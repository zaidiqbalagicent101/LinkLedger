"use client";

import { useActionState, useRef, type FormEvent } from "react";
import { Check, LoaderCircle, ShoppingCart } from "lucide-react";
import { buyPublisherServiceAction, type PurchaseActionState } from "@/lib/purchase-actions";

export function BuyNowButton({ serviceId }: { serviceId: string }) {
  const [state, action, pending] = useActionState<PurchaseActionState | undefined, FormData>(
    buyPublisherServiceAction,
    undefined,
  );
  const idempotencyKey = useRef<HTMLInputElement>(null);

  function confirmPurchase(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Are you sure you want to buy this service?")) {
      event.preventDefault();
      return;
    }
    if (idempotencyKey.current && !idempotencyKey.current.value) {
      idempotencyKey.current.value = crypto.randomUUID();
    }
  }

  return (
    <form action={action} onSubmit={confirmPurchase} className="w-full">
      <input type="hidden" name="serviceId" value={serviceId} />
      <input ref={idempotencyKey} type="hidden" name="idempotencyKey" />
      {state?.message && (
        <p className={`mb-2 text-sm ${state.success ? "text-[#16734e]" : "text-[#b42318]"}`} role={state.success ? "status" : "alert"}>
          {state.message}
        </p>
      )}
      <button
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 bg-[#0e7a5a] px-4 text-sm font-semibold text-white hover:bg-[#0a6149] disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={pending || state?.success}
      >
        {pending ? <LoaderCircle className="animate-spin" size={16} /> : state?.success ? <Check size={16} /> : <ShoppingCart size={16} />}
        {pending ? "Confirming..." : state?.success ? "Purchased" : "Buy Now"}
      </button>
    </form>
  );
}