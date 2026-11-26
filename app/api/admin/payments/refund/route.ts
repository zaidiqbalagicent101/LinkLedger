import "server-only";

import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRazorpayClient, logPaymentEvent } from "@/lib/razorpay";
import { getStripeClient } from "@/lib/stripe";

const schema = z.object({
  orderId: z.string().cuid(),
  amountMinor: z.number().int().positive().optional(),
});

export async function POST(request: Request) {
  await requireRole("ADMIN");
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ message: "Invalid refund request." }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: body.data.orderId },
    select: {
      id: true,
      razorpayPaymentId: true,
      razorpayRefundId: true,
      stripeRefundId: true,
      paymentAmount: true,
      paymentStatus: true,
      paymentAttempts: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (order?.paymentStatus !== "PAID" || !order) {
    return Response.json({ message: "Only captured payments can be refunded." }, { status: 409 });
  }

  const amount = body.data.amountMinor;
  if (amount && order.paymentAmount && amount > order.paymentAmount) {
    return Response.json({ message: "Refund amount exceeds the captured payment.", }, { status: 400 });
  }

  const attempt = order.paymentAttempts[0];

  if (attempt?.provider === "STRIPE") {
    if (order.stripeRefundId) {
      return Response.json({ message: "This payment has already been refunded.", success: true });
    }
    if (!attempt.stripePaymentIntentId) {
      return Response.json({ message: "The Stripe payment intent is not available yet." }, { status: 409 });
    }

    try {
      const refund = await getStripeClient().refunds.create({
        payment_intent: attempt.stripePaymentIntentId,
        ...(amount ? { amount } : {}),
      });
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: "REFUNDED", stripeRefundId: refund.id, paymentRefundedAt: new Date(), paymentUpdatedAt: new Date() },
        }),
        prisma.paymentAttempt.update({
          where: { id: attempt.id },
          data: { status: "REFUNDED", lastVerifiedAt: new Date() },
        }),
      ]);
      logPaymentEvent("stripe_refund_created", { orderId: order.id, paymentIntentId: attempt.stripePaymentIntentId, refundId: refund.id });
      return Response.json({ success: true, refundId: refund.id });
    } catch (error) {
      logPaymentEvent("stripe_refund_failed", { orderId: order.id, error: error instanceof Error ? error.message : "unknown" });
      return Response.json({ message: "Refund could not be created." }, { status: 502 });
    }
  }

  if (!order.razorpayPaymentId) {
    return Response.json({ message: "Only captured payments can be refunded." }, { status: 409 });
  }
  if (order.razorpayRefundId) {
    return Response.json({ message: "This payment has already been refunded.", success: true });
  }

  try {
    const refund = await getRazorpayClient().payments.refund(order.razorpayPaymentId, amount ? { amount } : {});
    const refundId = String(refund.id);
    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "REFUNDED", razorpayRefundId: refundId, paymentRefundedAt: new Date(), paymentUpdatedAt: new Date() } }),
      prisma.paymentAttempt.updateMany({ where: { orderId: order.id, razorpayPaymentId: order.razorpayPaymentId }, data: { status: "REFUNDED", lastVerifiedAt: new Date() } }),
    ]);
    logPaymentEvent("razorpay_refund_created", { orderId: order.id, paymentId: order.razorpayPaymentId, refundId });
    return Response.json({ success: true, refundId });
  } catch (error) {
    logPaymentEvent("razorpay_refund_failed", { orderId: order.id, error: error instanceof Error ? error.message : "unknown" });
    return Response.json({ message: "Refund could not be created." }, { status: 502 });
  }
}
