"use server";

import "server-only";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRazorpayClient, getRazorpayConfig, toMinorUnits, verifyPaymentSignature, logPaymentEvent } from "@/lib/razorpay";
import { getAppBaseUrl, getStripeClient } from "@/lib/stripe";
import type { PaymentAttempt } from "@/generated/prisma/client";

export type PurchaseActionState = {
  message?: string;
  success?: boolean;
  pending?: boolean;
  retryWithNewKey?: boolean;
  checkout?: {
    provider: "STRIPE" | "RAZORPAY";
    orderId: string;
    checkoutUrl?: string;
    keyId?: string;
    razorpayOrderId?: string;
    amount?: number;
    currency?: string;
  };
};

const purchaseSchema = z.object({
  serviceId: z.string().cuid(),
  idempotencyKey: z.string().uuid(),
  provider: z.enum(["STRIPE", "RAZORPAY"]).default("RAZORPAY"),
});

const verifySchema = z.object({
  orderId: z.string().cuid(),
  razorpayOrderId: z.string().min(1).max(191),
  razorpayPaymentId: z.string().min(1).max(191),
  razorpaySignature: z.string().min(1).max(512),
});

const existingOrderSelect = {
  id: true,
  idempotencyKey: true,
  directPurchaseKey: true,
  advertiserId: true,
  publisherServiceId: true,
  paymentStatus: true,
  razorpayOrderId: true,
  paymentAmount: true,
  paymentCurrency: true,
  serviceNameSnapshot: true,
  websiteNameSnapshot: true,
  paymentAttempts: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
  },
} as const;

type StripeCheckoutOrder = {
  id: string;
  advertiserId: string;
  serviceNameSnapshot: string;
  websiteNameSnapshot: string;
};

async function createStripeCheckout(
  order: StripeCheckoutOrder,
  attempt: Pick<PaymentAttempt, "id" | "amount" | "currency" | "stripeCheckoutSessionId">,
  customerEmail: string,
): Promise<PurchaseActionState> {
  const stripe = getStripeClient();
  let session = attempt.stripeCheckoutSessionId
    ? await stripe.checkout.sessions.retrieve(attempt.stripeCheckoutSessionId)
    : null;

  if (session?.status === "open" && session.url) {
    return { checkout: { provider: "STRIPE", orderId: order.id, checkoutUrl: session.url } };
  }
  if (session?.status === "complete") {
    return { message: "Payment is being confirmed by Stripe.", pending: true };
  }
  if (session?.status === "expired") {
    return {
      message: "Checkout expired. Waiting for Stripe's webhook before retrying.",
      pending: true,
      retryWithNewKey: true,
    };
  }

  const baseUrl = getAppBaseUrl();
  session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: order.id,
    customer_email: customerEmail,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: attempt.currency.toLowerCase(),
        unit_amount: attempt.amount,
        product_data: {
          name: `${order.serviceNameSnapshot} on ${order.websiteNameSnapshot}`.slice(0, 250),
        },
      },
    }],
    metadata: { orderId: order.id, paymentAttemptId: attempt.id },
    payment_intent_data: {
      metadata: { orderId: order.id, paymentAttemptId: attempt.id },
    },
    success_url: `${baseUrl}/advertiser/orders/${order.id}?payment=processing`,
    cancel_url: `${baseUrl}/advertiser/orders/${order.id}?payment=cancelled`,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
  }, {
    idempotencyKey: `linkledger-checkout-${attempt.id}`,
  });

  if (!session.url || session.status !== "open") {
    throw new Error("Stripe did not return an open Checkout Session URL.");
  }

  const linked = await prisma.paymentAttempt.updateMany({
    where: { id: attempt.id, provider: "STRIPE", stripeCheckoutSessionId: null },
    data: { stripeCheckoutSessionId: session.id },
  });
  if (linked.count !== 1) {
    const storedAttempt = await prisma.paymentAttempt.findUnique({
      where: { id: attempt.id },
      select: { stripeCheckoutSessionId: true },
    });
    if (storedAttempt?.stripeCheckoutSessionId !== session.id) {
      throw new Error("Stripe Checkout Session could not be linked to the payment attempt.");
    }
  }

  logPaymentEvent("stripe_checkout_session_created", {
    orderId: order.id,
    paymentAttemptId: attempt.id,
    checkoutSessionId: session.id,
    amount: attempt.amount,
    currency: attempt.currency,
  });
  return { checkout: { provider: "STRIPE", orderId: order.id, checkoutUrl: session.url } };
}

async function createRazorpayCheckout(
  order: { id: string; razorpayOrderId?: string | null },
  attempt: Pick<PaymentAttempt, "id" | "amount" | "currency" | "razorpayOrderId">,
): Promise<PurchaseActionState> {
  let razorpayOrderId = attempt.razorpayOrderId;

  if (!razorpayOrderId) {
    const created = await getRazorpayClient().orders.create({
      amount: attempt.amount,
      currency: attempt.currency,
      receipt: order.id,
      notes: { orderId: order.id, paymentAttemptId: attempt.id },
    });
    const linked = await prisma.paymentAttempt.updateMany({
      where: { id: attempt.id, provider: "RAZORPAY", razorpayOrderId: null },
      data: { razorpayOrderId: created.id },
    });
    if (linked.count === 1) {
      razorpayOrderId = created.id;
    } else {
      const savedAttempt = await prisma.paymentAttempt.findUnique({
        where: { id: attempt.id },
        select: { razorpayOrderId: true },
      });
      if (!savedAttempt?.razorpayOrderId) throw new Error("Razorpay order could not be linked to the payment attempt.");
      razorpayOrderId = savedAttempt.razorpayOrderId;
    }
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      razorpayOrderId,
      paymentAmount: attempt.amount,
      paymentCurrency: attempt.currency,
      paymentUpdatedAt: new Date(),
    },
  });

  logPaymentEvent("razorpay_order_created", {
    orderId: order.id,
    paymentAttemptId: attempt.id,
    razorpayOrderId,
    amount: attempt.amount,
    currency: attempt.currency,
  });
  return {
    checkout: {
      provider: "RAZORPAY",
      orderId: order.id,
      keyId: getRazorpayConfig().keyId,
      razorpayOrderId,
      amount: attempt.amount,
      currency: attempt.currency,
    },
  };
}

function isUniqueConstraint(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function buyPublisherServiceAction(
  _previousState: PurchaseActionState | undefined,
  formData: FormData,
): Promise<PurchaseActionState> {
  const user = await requireRole("ADVERTISER");
  const result = purchaseSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!result.success) return { message: "This service could not be purchased. Please try again." };

  const { serviceId, idempotencyKey, provider } = result.data;
  const paidPurchase = await prisma.order.findFirst({
    where: {
      advertiserId: user.id,
      publisherServiceId: serviceId,
      source: "DIRECT_PURCHASE",
      paymentStatus: "PAID",
    },
    select: { id: true },
  });
  if (paidPurchase) {
    return { message: "This service has already been purchased.", success: true };
  }

  const directPurchaseKey = `${user.id}:${serviceId}`;
  let existing = await prisma.order.findFirst({
    where: {
      advertiserId: user.id,
      publisherServiceId: serviceId,
      source: "DIRECT_PURCHASE",
      OR: [{ idempotencyKey }, { directPurchaseKey }],
    },
    select: existingOrderSelect,
  });

  if (!existing) {
    existing = await prisma.order.findFirst({
      where: {
        advertiserId: user.id,
        publisherServiceId: serviceId,
        source: "DIRECT_PURCHASE",
        paymentStatus: { in: ["PENDING", "AUTHORIZED"] },
      },
      orderBy: { createdAt: "desc" },
      select: existingOrderSelect,
    });
  }

  if (existing && (existing.advertiserId !== user.id || existing.publisherServiceId !== serviceId)) {
    return { message: "This service could not be purchased. Please try again." };
  }
  if (existing?.paymentStatus === "PAID") {
    return { message: "Purchase confirmed successfully!", success: true };
  }

  if (existing && ["PENDING", "AUTHORIZED"].includes(existing.paymentStatus)) {
    let attempt = existing.paymentAttempts[0];
    if (!attempt) return { message: "Payment is still being prepared. Please retry shortly.", pending: true };

    if (attempt.provider !== provider) {
      if (attempt.status !== "PENDING") {
        return { message: "Payment is being reconciled with the selected gateway. Please check My Orders shortly.", pending: true };
      }

      const reusedAttempt = await prisma.paymentAttempt.findUnique({ where: { idempotencyKey } });
      if (reusedAttempt) {
        if (reusedAttempt.orderId !== existing.id || reusedAttempt.provider !== provider) {
          return { message: "This payment attempt has already been used. Start a fresh retry.", retryWithNewKey: true };
        }
        attempt = reusedAttempt;
      } else {
        attempt = await prisma.paymentAttempt.create({
          data: {
            orderId: existing.id,
            idempotencyKey,
            provider,
            amount: attempt.amount,
            currency: attempt.currency,
          },
        });
      }
    }

    if (attempt.provider === "RAZORPAY") {
      try {
        return await createRazorpayCheckout(existing, attempt);
      } catch (error) {
        logPaymentEvent("razorpay_order_creation_failed", {
          orderId: existing.id,
          paymentAttemptId: attempt.id,
          error: error instanceof Error ? error.message : "unknown",
        });
        return { message: "Razorpay Checkout could not be started. You can retry safely." };
      }
    }
    if (attempt.status !== "PENDING") {
      return { message: "Payment is being reconciled with Stripe.", pending: true };
    }
    try {
      return await createStripeCheckout(existing, attempt, user.email);
    } catch (error) {
      logPaymentEvent("stripe_checkout_creation_failed", {
        orderId: existing.id,
        paymentAttemptId: attempt.id,
        error: error instanceof Error ? error.message : "unknown",
      });
      return { message: "Stripe Checkout could not be started. You can retry safely." };
    }
  }

  const service = await prisma.publisherService.findFirst({
    where: { id: serviceId, isActive: true, archivedAt: null, website: { approvalStatus: "APPROVED" } },
    select: {
      id: true, serviceName: true, serviceType: true, price: true, currency: true,
      deliveryTimeDays: true, contentWritingIncluded: true, linkType: true, maximumLinks: true,
      homepageLinkAvailable: true, description: true, publishingGuidelines: true, additionalConditions: true,
      website: { select: { id: true, websiteName: true, websiteUrl: true, websiteNiche: true, monthlyTraffic: true, websiteLanguage: true, targetAudienceCountry: true, websiteDescription: true, domainRating: true, domainAuthority: true } },
    },
  });
  if (!service) return { message: "This service is no longer available." };

  let order: StripeCheckoutOrder | null = null;
  let paymentAttempt: PaymentAttempt | null = null;
  try {
    const minorAmount = toMinorUnits(service.price.toString(), service.currency);
    if (existing && (existing.paymentStatus === "FAILED" || existing.paymentStatus === "REFUNDED")) {
      const repeatedAttempt = await prisma.paymentAttempt.findUnique({ where: { idempotencyKey } });
      if (repeatedAttempt) {
        return { message: "This payment attempt has already been used. Start a fresh retry.", retryWithNewKey: true };
      }

      const reopened = await prisma.$transaction(async (transaction) => {
        const changed = await transaction.order.updateMany({
          where: { id: existing.id, paymentStatus: existing.paymentStatus },
          data: {
            paymentStatus: "PENDING",
            paymentUpdatedAt: new Date(),
            paymentFailureCode: null,
            paymentFailureMessage: null,
          },
        });
        if (changed.count !== 1) return null;
        return transaction.paymentAttempt.create({
          data: {
            orderId: existing.id,
            idempotencyKey,
            provider,
            amount: existing.paymentAmount ?? minorAmount,
            currency: existing.paymentCurrency ?? service.currency,
          },
        });
      });

      if (!reopened) {
        return { message: "Payment status is changing. Refresh before retrying.", pending: true };
      }
      paymentAttempt = reopened;
      order = await prisma.order.findUnique({ where: { id: existing.id }, select: { id: true, advertiserId: true, serviceNameSnapshot: true, websiteNameSnapshot: true } });
    } else {
      const created = await prisma.order.create({
        data: {
          idempotencyKey,
          directPurchaseKey,
          source: "DIRECT_PURCHASE",
          status: "CONFIRMED",
          paymentStatus: "PENDING",
          advertiserId: user.id, publisherWebsiteId: service.website.id, publisherServiceId: service.id,
          websiteNameSnapshot: service.website.websiteName, websiteUrlSnapshot: service.website.websiteUrl,
          websiteNicheSnapshot: service.website.websiteNiche, monthlyTrafficSnapshot: service.website.monthlyTraffic,
          websiteLanguageSnapshot: service.website.websiteLanguage, targetAudienceCountrySnapshot: service.website.targetAudienceCountry,
          websiteDescriptionSnapshot: service.website.websiteDescription, domainRatingSnapshot: service.website.domainRating,
          domainAuthoritySnapshot: service.website.domainAuthority, serviceNameSnapshot: service.serviceName,
          serviceTypeSnapshot: service.serviceType, serviceDescriptionSnapshot: service.description,
          publishingGuidelinesSnapshot: service.publishingGuidelines, additionalConditionsSnapshot: service.additionalConditions,
          originalPrice: service.price, originalCurrency: service.currency, originalDeliveryTimeDays: service.deliveryTimeDays,
          originalContentWritingIncluded: service.contentWritingIncluded, originalLinkType: service.linkType,
          originalMaximumLinks: service.maximumLinks, originalHomepageLinkAvailable: service.homepageLinkAvailable,
          agreedPrice: service.price, agreedCurrency: service.currency, agreedDeliveryTimeDays: service.deliveryTimeDays,
          agreedContentWritingIncluded: service.contentWritingIncluded, agreedLinkType: service.linkType,
          agreedNumberOfLinks: service.maximumLinks, agreedHomepageLinkAvailable: service.homepageLinkAvailable,
          contentRequirements: "", additionalInstructions: "", paymentAmount: minorAmount, paymentCurrency: service.currency,
          paymentAttempts: { create: { idempotencyKey, provider, amount: minorAmount, currency: service.currency } },
        },
        select: {
          id: true,
          advertiserId: true,
          serviceNameSnapshot: true,
          websiteNameSnapshot: true,
          paymentAttempts: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      });
      order = created;
      paymentAttempt = created.paymentAttempts[0];
    }

    if (!order || !paymentAttempt) throw new Error("The payment attempt could not be created.");
    if (provider === "RAZORPAY") return await createRazorpayCheckout(order, paymentAttempt);
    return await createStripeCheckout(order, paymentAttempt, user.email);
  } catch (error) {
    if (isUniqueConstraint(error)) {
      const duplicate = await prisma.order.findFirst({
        where: {
          advertiserId: user.id,
          publisherServiceId: serviceId,
          source: "DIRECT_PURCHASE",
          OR: [{ directPurchaseKey }, { idempotencyKey }],
        },
        select: existingOrderSelect,
      });
      if (duplicate?.paymentStatus === "PAID") {
        return { message: "Purchase confirmed successfully!", success: true };
      }
      const duplicateAttempt = duplicate?.paymentAttempts[0];
      if (duplicate && duplicateAttempt?.provider === "RAZORPAY" && duplicate.paymentStatus === "PENDING") {
        try {
          return await createRazorpayCheckout(duplicate, duplicateAttempt);
        } catch {
          return { message: "Razorpay Checkout could not be started. You can retry safely." };
        }
      }
      if (duplicate && duplicateAttempt?.provider === "STRIPE" && duplicate.paymentStatus === "PENDING") {
        try {
          return await createStripeCheckout(duplicate, duplicateAttempt, user.email);
        } catch {
          return { message: "Stripe Checkout could not be started. You can retry safely." };
        }
      }
    }
    logPaymentEvent("payment_order_creation_failed", { orderId: order?.id ?? existing?.id, serviceId, advertiserId: user.id, provider, error: error instanceof Error ? error.message : "unknown" });
    return { message: "Payment could not be started. Please try again." };
  }
}

export async function verifyPublisherPaymentAction(input: z.infer<typeof verifySchema>): Promise<PurchaseActionState> {
  const user = await requireRole("ADVERTISER");
  const result = verifySchema.safeParse(input);
  if (!result.success) return { message: "Payment verification failed. Please retry." };

  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = result.data;
  if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
    return { message: "Payment signature verification failed." };
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, advertiserId: user.id, razorpayOrderId },
    select: { id: true, paymentStatus: true, paymentAmount: true, paymentCurrency: true, publisherServiceId: true },
  });
  if (!order) return { message: "Payment could not be matched to this order." };
  if (order.paymentStatus === "PAID") return { message: "Purchase confirmed successfully!", success: true };

  return { message: "Payment confirmation is pending from Razorpay.", pending: true };
}