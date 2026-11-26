"use client";

import { useRef, useState, type FormEvent } from "react";
import { Check, LoaderCircle, RefreshCw, ShoppingCart } from "lucide-react";

type CheckoutResponse = {
  checkout?: {
    provider: "STRIPE" | "RAZORPAY";
    orderId: string;
    checkoutUrl?: string;
    keyId?: string;
    razorpayOrderId?: string;
    amount?: number;
    currency?: string;
  };
  message?: string;
  success?: boolean;
};

type PaymentStatusResponse = {
  paymentStatus?: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";
};

type RazorpayInstance = {
  open(): void;
  on(event: string, handler: (response: unknown) => void): void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>("script[data-razorpay-checkout]");
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function BuyNowButton({
  serviceId,
  alreadyPurchased = false,
}: {
  serviceId: string;
  alreadyPurchased?: boolean;
}) {
  const idempotencyKey = useRef(crypto.randomUUID());
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);

  async function waitForWebhookStatus(orderId: string) {
    setPending(true);
    setFailed(false);
    setMessage("Waiting for payment confirmation...");

    for (let attempt = 0; attempt < 24; attempt += 1) {
      if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 2500));

      try {
        const response = await fetch(`/api/payments/status?orderId=${encodeURIComponent(orderId)}`, { cache: "no-store" });
        if (!response.ok) continue;

        const result = await response.json() as PaymentStatusResponse;
        if (result.paymentStatus === "PAID") {
          setSuccess(true);
          setFailed(false);
          setMessage("Purchase confirmed successfully!");
          setPending(false);
          return;
        }
        if (result.paymentStatus === "FAILED" || result.paymentStatus === "REFUNDED") {
          setSuccess(false);
          setFailed(true);
          setMessage(result.paymentStatus === "REFUNDED" ? "This payment was refunded." : "The payment failed. Please retry.");
          setPending(false);
          return;
        }
      } catch {
        // Continue checking while the payment webhook is processed.
      }
    }

    setPending(false);
    setFailed(false);
    setMessage("Payment is still being confirmed. Check My Orders shortly.");
  }

  async function confirmPurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (alreadyPurchased) return;
    if (!window.confirm("Are you sure you want to buy this service?")) return;

    setPending(true);
    setMessage(undefined);
    setFailed(false);

    try {
      const createResponse = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, idempotencyKey: idempotencyKey.current }),
      });
      const created = await createResponse.json() as CheckoutResponse;
      if (!createResponse.ok || !created.checkout) {
        setFailed(true);
        setMessage(created.message || "Payment could not be started. Please try again.");
        return;
      }

      const checkout = created.checkout;
      if (checkout.provider === "STRIPE") {
        if (!checkout.checkoutUrl) {
          setFailed(true);
          setMessage("Stripe Checkout could not be started. Please retry.");
          return;
        }
        window.location.assign(checkout.checkoutUrl);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setFailed(true);
        setMessage("Razorpay Checkout could not be loaded. Please retry.");
        return;
      }

      let confirmationInProgress = false;
      const razorpay = new window.Razorpay({
        key: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency,
        name: "LinkLedger",
        description: "Marketplace service purchase",
        order_id: checkout.razorpayOrderId,
        retry: { enabled: true, max_count: 2 },
        handler: async (response: unknown) => {
          confirmationInProgress = true;
          const payment = response as { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string };
          setPending(true);
          setMessage("Checking payment with Razorpay...");
          try {
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: checkout.orderId,
                razorpayOrderId: payment.razorpay_order_id,
                razorpayPaymentId: payment.razorpay_payment_id,
                razorpaySignature: payment.razorpay_signature,
              }),
            });
            const verified = await verifyResponse.json() as CheckoutResponse;
            if (!verifyResponse.ok && verifyResponse.status !== 202) {
              setPending(false);
              setFailed(true);
              setMessage(verified.message || "Payment verification failed. Please check My Orders.");
              return;
            }
            await waitForWebhookStatus(checkout.orderId);
          } catch {
            setPending(false);
            setFailed(true);
            setMessage("Payment verification could not complete. Please check My Orders and retry safely.");
          }
        },
        modal: {
          ondismiss: () => {
            if (!confirmationInProgress) {
              setPending(false);
              setFailed(false);
              setMessage("Checkout closed. If you completed payment, check My Orders for the final status.");
            }
          },
        },
        theme: { color: "#0e7a5a" },
      });

      razorpay.on("payment.failed", () => {
        confirmationInProgress = true;
        void waitForWebhookStatus(checkout.orderId);
      });
      razorpay.open();
    } catch {
      setFailed(true);
      setMessage("Payment could not be started. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={confirmPurchase} className="w-full">
      {message && (
        <p className={`mb-2 text-sm ${success ? "text-[#16734e]" : "text-[#b42318]"}`} role={success ? "status" : "alert"}>
          {message}
        </p>
      )}
      <button
        className={`inline-flex min-h-10 w-full items-center justify-center gap-2 px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-100 ${
          alreadyPurchased
            ? "border border-[#bfdfcf] bg-[#edf7f1] text-[#16734e]"
            : "bg-[#0e7a5a] text-white hover:bg-[#0a6149]"
        }`}
        type="submit"
        disabled={pending || success || alreadyPurchased}
      >
        {alreadyPurchased ? <Check size={16} /> : pending ? <LoaderCircle className="animate-spin" size={16} /> : success ? <Check size={16} /> : failed ? <RefreshCw size={16} /> : <ShoppingCart size={16} />}
        {alreadyPurchased ? "Already purchased" : pending ? "Processing..." : success ? "Purchased" : failed ? "Retry payment" : "Buy Now"}
      </button>
    </form>
  );
}