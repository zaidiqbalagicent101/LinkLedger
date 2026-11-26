import "server-only";

import crypto from "node:crypto";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe";
import { logPaymentEvent } from "@/lib/razorpay";

function paymentIntentId(paymentIntent: string | Stripe.PaymentIntent | null): string | null {
  if (!paymentIntent) return null;
  return typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;
}

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("Missing Stripe signature.");
    event = getStripeClient().webhooks.constructEvent(raw, signature, getStripeWebhookSecret());
  } catch (error) {
    logPaymentEvent("stripe_webhook_signature_failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payloadHash = crypto.createHash("sha256").update(raw).digest("hex");

  try {
    await prisma.stripeWebhookEvent.create({
      data: { id: event.id.slice(0, 191), eventName: event.type, payloadHash },
    });
  } catch {
    return Response.json({ received: true, duplicate: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const paymentAttemptId = session.metadata?.paymentAttemptId;

      const attempt = paymentAttemptId
        ? await prisma.paymentAttempt.findUnique({ where: { id: paymentAttemptId }, include: { order: true } })
        : await prisma.paymentAttempt.findUnique({ where: { stripeCheckoutSessionId: session.id }, include: { order: true } });

      if (attempt && attempt.provider === "STRIPE" && attempt.orderId === (orderId || attempt.orderId)) {
        const intentId = paymentIntentId(session.payment_intent);
        if (session.payment_status !== "paid" || session.amount_total !== attempt.amount || session.currency?.toUpperCase() !== attempt.currency) {
          throw new Error("Stripe checkout details did not match the payment attempt.");
        }

        await prisma.$transaction([
          prisma.order.update({
            where: { id: attempt.orderId },
            data: {
              paymentStatus: "PAID",
              paymentAmount: attempt.amount,
              paymentCurrency: attempt.currency,
              paymentCapturedAt: new Date(),
              paymentUpdatedAt: new Date(),
              paymentFailureCode: null,
              paymentFailureMessage: null,
            },
          }),
          prisma.paymentAttempt.update({
            where: { id: attempt.id },
            data: {
              stripeCheckoutSessionId: session.id,
              stripePaymentIntentId: intentId,
              status: "PAID",
              lastVerifiedAt: new Date(),
              failureCode: null,
              failureMessage: null,
            },
          }),
        ]);
      }
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const attempt = await prisma.paymentAttempt.findUnique({
        where: { stripePaymentIntentId: intent.id },
        include: { order: true },
      });

      if (attempt && attempt.provider === "STRIPE" && attempt.order.paymentStatus !== "PAID") {
        if (intent.amount !== attempt.amount || intent.currency.toUpperCase() !== attempt.currency) {
          throw new Error("Stripe payment intent details did not match the payment attempt.");
        }
        await prisma.$transaction([
          prisma.order.update({
            where: { id: attempt.orderId },
            data: {
              paymentStatus: "PAID",
              paymentAmount: attempt.amount,
              paymentCurrency: attempt.currency,
              paymentCapturedAt: new Date(),
              paymentUpdatedAt: new Date(),
              paymentFailureCode: null,
              paymentFailureMessage: null,
            },
          }),
          prisma.paymentAttempt.update({
            where: { id: attempt.id },
            data: { status: "PAID", lastVerifiedAt: new Date(), failureCode: null, failureMessage: null },
          }),
        ]);
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const attempt = await prisma.paymentAttempt.findUnique({
        where: { stripePaymentIntentId: intent.id },
        include: { order: true },
      });

      if (attempt && attempt.provider === "STRIPE") {
        const failure = intent.last_payment_error;
        const failureCode = failure?.code || "PAYMENT_FAILED";
        const failureMessage = failure?.message || "Payment failed";
        await prisma.$transaction([
          prisma.order.update({
            where: { id: attempt.orderId },
            data: {
              paymentStatus: "FAILED",
              paymentUpdatedAt: new Date(),
              paymentFailureCode: failureCode,
              paymentFailureMessage: failureMessage,
            },
          }),
          prisma.paymentAttempt.update({
            where: { id: attempt.id },
            data: { status: "FAILED", failureCode, failureMessage, lastVerifiedAt: new Date() },
          }),
        ]);
      }
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const intentId = paymentIntentId(charge.payment_intent);
      if (!intentId) throw new Error("Refund charge has no payment intent.");

      const attempt = await prisma.paymentAttempt.findUnique({
        where: { stripePaymentIntentId: intentId },
        include: { order: true },
      });
      if (attempt && attempt.provider === "STRIPE") {
        const refundId = charge.refunds?.data.find((refund) => refund.status === "succeeded")?.id;
        await prisma.$transaction([
          prisma.order.update({
            where: { id: attempt.orderId },
            data: {
              paymentStatus: "REFUNDED",
              stripeRefundId: refundId || event.id,
              paymentRefundedAt: new Date(),
              paymentUpdatedAt: new Date(),
            },
          }),
          prisma.paymentAttempt.update({
            where: { id: attempt.id },
            data: { status: "REFUNDED", lastVerifiedAt: new Date() },
          }),
        ]);
      }
    }

    logPaymentEvent("stripe_webhook_processed", { eventId: event.id, eventName: event.type });
    return Response.json({ received: true });
  } catch (error) {
    logPaymentEvent("stripe_webhook_processing_failed", {
      eventId: event.id,
      eventName: event.type,
      error: error instanceof Error ? error.message : "unknown",
    });
    try {
      await prisma.stripeWebhookEvent.deleteMany({ where: { id: event.id.slice(0, 191) } });
    } catch {
      logPaymentEvent("stripe_webhook_event_cleanup_failed", { eventId: event.id });
    }
    return Response.json({ received: false, recoveryRequired: true }, { status: 500 });
  }
}
