import "server-only";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getRazorpayClient, logPaymentEvent, verifyWebhookSignature } from "@/lib/razorpay";

type WebhookPayload = {
  event?: string;
  payload?: {
    payment?: { entity?: Record<string, unknown> };
    refund?: { entity?: Record<string, unknown> };
  };
};
    
export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (!verifyWebhookSignature(raw, signature)) {
    logPaymentEvent("razorpay_webhook_signature_failed", {});
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  let body: WebhookPayload;
  try {
    body = JSON.parse(raw) as WebhookPayload;
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const eventId = request.headers.get("x-razorpay-event-id")
    || `${body.event}:${crypto.createHash("sha256").update(raw).digest("hex")}`;
  const payloadHash = crypto.createHash("sha256").update(raw).digest("hex");

  try {
    await prisma.razorpayWebhookEvent.create({ data: { id: eventId.slice(0, 191), eventName: body.event || "unknown", payloadHash } });
  } catch {
    return Response.json({ received: true, duplicate: true });
  }

  try {
    const eventName = body.event || "";
    const payment = body.payload?.payment?.entity;
    const refund = body.payload?.refund?.entity;

    if (eventName.startsWith("payment.")) {
      if (!payment) return Response.json({ received: true });
      const paymentId = String(payment.id || "");
      const razorpayOrderId = String(payment.order_id || "");
      const amount = Number(payment.amount);
      const currency = String(payment.currency || "").toUpperCase();

      if (paymentId && razorpayOrderId) {
        const attempt = await prisma.paymentAttempt.findUnique({
          where: { razorpayOrderId },
          include: { order: true },
        });

        if (attempt && attempt.order.paymentStatus !== "PAID") {
          if (eventName === "payment.captured") {
            try {
              const verified = await getRazorpayClient().payments.fetch(paymentId) as unknown as { id: string; order_id: string; amount: number; currency: string; status: string; captured: boolean };
              if (verified.id !== paymentId || verified.order_id !== razorpayOrderId || verified.amount !== attempt.amount || verified.currency.toUpperCase() !== attempt.currency || (verified.status !== "captured" && !verified.captured)) {
                throw new Error("Razorpay payment details did not match the captured webhook event.");
              }

              await prisma.$transaction([
                prisma.order.update({ where: { id: attempt.orderId }, data: { paymentStatus: "PAID", razorpayPaymentId: paymentId, paymentAmount: attempt.amount, paymentCurrency: attempt.currency, paymentCapturedAt: new Date(), paymentUpdatedAt: new Date(), paymentFailureCode: null, paymentFailureMessage: null } }),
                prisma.paymentAttempt.update({ where: { id: attempt.id }, data: { razorpayPaymentId: paymentId, status: "PAID", lastVerifiedAt: new Date() } }),
              ]);
            } catch (error) {
              logPaymentEvent("razorpay_webhook_capture_recovery_failed", { razorpayOrderId, paymentId, error: error instanceof Error ? error.message : "unknown" });
              throw error;
            }
          } else if (eventName === "payment.failed") {
            await prisma.$transaction([
              prisma.order.update({ where: { id: attempt.orderId }, data: { paymentStatus: "FAILED", razorpayPaymentId: paymentId, paymentUpdatedAt: new Date(), paymentFailureCode: String(payment.error_code || "PAYMENT_FAILED"), paymentFailureMessage: String(payment.error_description || "Payment failed") } }),
              prisma.paymentAttempt.update({ where: { id: attempt.id }, data: { razorpayPaymentId: paymentId, status: "FAILED", failureCode: String(payment.error_code || "PAYMENT_FAILED"), failureMessage: String(payment.error_description || "Payment failed"), lastVerifiedAt: new Date() } }),
            ]);
          } else if (eventName === "payment.authorized") {
            await prisma.$transaction([
              prisma.order.update({ where: { id: attempt.orderId }, data: { paymentStatus: "AUTHORIZED", razorpayPaymentId: paymentId, paymentUpdatedAt: new Date() } }),
              prisma.paymentAttempt.update({ where: { id: attempt.id }, data: { razorpayPaymentId: paymentId, status: "AUTHORIZED", lastVerifiedAt: new Date() } }),
            ]);
          }
        }
      }
      logPaymentEvent("razorpay_webhook_processed", { eventName, paymentId, razorpayOrderId, amount, currency });
    }

    if (eventName.startsWith("refund.")) {
      const refundId = String(refund?.id || "");
      const paymentId = String(refund?.payment_id || "");
      if (refundId && paymentId) {
        const order = await prisma.order.findUnique({ where: { razorpayPaymentId: paymentId } });
        if (order) {
          await prisma.$transaction([
            prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "REFUNDED", razorpayRefundId: refundId, paymentRefundedAt: new Date(), paymentUpdatedAt: new Date() } }),
            prisma.paymentAttempt.updateMany({ where: { orderId: order.id, razorpayPaymentId: paymentId }, data: { status: "REFUNDED", lastVerifiedAt: new Date() } }),
          ]);
        }
      }
      logPaymentEvent("razorpay_webhook_processed", { eventName, refundId });
    }

    return Response.json({ received: true });
  } catch (error) {
    logPaymentEvent("razorpay_webhook_processing_failed", { eventName: body.event, error: error instanceof Error ? error.message : "unknown" });
    try {
      await prisma.razorpayWebhookEvent.deleteMany({ where: { id: eventId.slice(0, 191) } });
    } catch {
      logPaymentEvent("razorpay_webhook_event_cleanup_failed", { eventId });
    }
    return Response.json({ received: false, recoveryRequired: true }, { status: 500 });
  }
}
