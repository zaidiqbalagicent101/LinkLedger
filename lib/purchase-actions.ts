"use server";

import "server-only";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRazorpayClient, toMinorUnits, verifyPaymentSignature, logPaymentEvent } from "@/lib/razorpay";

export type PurchaseActionState = {
  message?: string;
  success?: boolean;
  checkout?: {
    keyId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    orderId: string;
  };
};

const purchaseSchema = z.object({
  serviceId: z.string().cuid(),
  idempotencyKey: z.string().uuid(),
});

const verifySchema = z.object({
  orderId: z.string().cuid(),
  razorpayOrderId: z.string().min(1).max(191),
  razorpayPaymentId: z.string().min(1).max(191),
  razorpaySignature: z.string().min(1).max(512),
});

export async function buyPublisherServiceAction(
  _previousState: PurchaseActionState | undefined,
  formData: FormData,
): Promise<PurchaseActionState> {
  const user = await requireRole("ADVERTISER");
  const result = purchaseSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!result.success) return { message: "This service could not be purchased. Please try again." };

  const { serviceId, idempotencyKey } = result.data;
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

  const existing = await prisma.order.findUnique({
    where: { idempotencyKey },
    select: { id: true, advertiserId: true, publisherServiceId: true, paymentStatus: true, razorpayOrderId: true, paymentAmount: true, paymentCurrency: true, paymentAttempts: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (existing) {
    if (existing.advertiserId !== user.id || existing.publisherServiceId !== serviceId) {
      return { message: "This service could not be purchased. Please try again." };
    }
    if (existing.paymentStatus === "PAID") return { message: "Purchase confirmed successfully!", success: true };

    const attempt = existing.paymentAttempts[0];
    if (existing.razorpayOrderId && existing.paymentAmount && existing.paymentCurrency && attempt) {
      return {
        checkout: {
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "",
          razorpayOrderId: existing.razorpayOrderId,
          amount: existing.paymentAmount,
          currency: existing.paymentCurrency,
          orderId: existing.id,
        },
      };
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

  let orderId: string;
  try {
    const minorAmount = toMinorUnits(service.price.toString(), service.currency);
    if (existing) {
      orderId = existing.id;
    } else {
      const created = await prisma.order.create({
        data: {
          idempotencyKey, source: "DIRECT_PURCHASE", status: "CONFIRMED", paymentStatus: "PENDING",
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
          paymentAttempts: { create: { idempotencyKey, amount: minorAmount, currency: service.currency } },
        },
      });
      orderId = created.id;
    }

    const paymentOrder = await getRazorpayClient().orders.create({
      amount: existing?.paymentAmount ?? toMinorUnits(service.price.toString(), service.currency),
      currency: service.currency,
      receipt: orderId,
      notes: { orderId, advertiserId: user.id, serviceId: service.id },
    });

    await prisma.$transaction([
      prisma.order.update({ where: { id: orderId }, data: { razorpayOrderId: paymentOrder.id, paymentStatus: "PENDING", paymentUpdatedAt: new Date() } }),
      prisma.paymentAttempt.update({ where: { idempotencyKey }, data: { razorpayOrderId: paymentOrder.id, status: "PENDING" } }),
    ]);

    logPaymentEvent("razorpay_order_created", { orderId, razorpayOrderId: paymentOrder.id, amount: paymentOrder.amount, currency: service.currency });
    return { checkout: { keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "", razorpayOrderId: paymentOrder.id, amount: Number(paymentOrder.amount), currency: String(paymentOrder.currency), orderId } };
  } catch (error) {
    if (!existing) {
      const duplicate = await prisma.order.findUnique({ where: { idempotencyKey }, select: { id: true, advertiserId: true, publisherServiceId: true, paymentStatus: true, razorpayOrderId: true, paymentAmount: true, paymentCurrency: true } });
      if (duplicate?.advertiserId === user.id && duplicate.publisherServiceId === serviceId) {
        if (duplicate.paymentStatus === "PAID") return { message: "Purchase confirmed successfully!", success: true };
        if (duplicate.razorpayOrderId && duplicate.paymentAmount && duplicate.paymentCurrency) {
          return { checkout: { keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "", razorpayOrderId: duplicate.razorpayOrderId, amount: duplicate.paymentAmount, currency: duplicate.paymentCurrency, orderId: duplicate.id } };
        }
      }
    }
    logPaymentEvent("razorpay_order_failed", { orderId: existing?.id, serviceId, advertiserId: user.id, error: error instanceof Error ? error.message : "unknown" });
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

  try {
    const payment = await getRazorpayClient().payments.fetch(razorpayPaymentId) as unknown as { id: string; order_id: string; amount: number; currency: string; status: string; captured: boolean; method?: string };
    if (payment.order_id !== razorpayOrderId || payment.id !== razorpayPaymentId) {
      return { message: "Payment does not belong to this purchase." };
    }
    if (payment.amount !== order.paymentAmount || payment.currency?.toUpperCase() !== order.paymentCurrency?.toUpperCase()) {
      return { message: "Payment amount or currency does not match this purchase." };
    }

    if (payment.status === "captured" || payment.captured) {
      await prisma.$transaction([
        prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID", razorpayPaymentId, paymentCapturedAt: new Date(), paymentUpdatedAt: new Date(), paymentFailureCode: null, paymentFailureMessage: null } }),
        prisma.paymentAttempt.updateMany({ where: { orderId: order.id, razorpayOrderId }, data: { razorpayPaymentId, status: "PAID", lastVerifiedAt: new Date() } }),
      ]);
    } else if (payment.status === "authorized") {
      await prisma.$transaction([
        prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "AUTHORIZED", razorpayPaymentId, paymentUpdatedAt: new Date() } }),
        prisma.paymentAttempt.updateMany({ where: { orderId: order.id, razorpayOrderId }, data: { razorpayPaymentId, status: "AUTHORIZED", lastVerifiedAt: new Date() } }),
      ]);
      return { message: "Payment is authorized and awaiting capture verification." };
    } else {
      await prisma.$transaction([
        prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED", razorpayPaymentId, paymentUpdatedAt: new Date(), paymentFailureCode: payment.status } }),
        prisma.paymentAttempt.updateMany({ where: { orderId: order.id, razorpayOrderId }, data: { razorpayPaymentId, status: "FAILED", failureCode: payment.status, lastVerifiedAt: new Date() } }),
      ]);
      return { message: "Payment failed. Please retry.", success: false };
    }

    logPaymentEvent("razorpay_payment_verified", { orderId: order.id, razorpayOrderId, razorpayPaymentId, amount: payment.amount });
    return { message: "Payment captured and purchase confirmed!", success: true };
  } catch (error) {
    logPaymentEvent("razorpay_verification_failed", { orderId: order.id, razorpayOrderId, razorpayPaymentId, error: error instanceof Error ? error.message : "unknown" });
    return { message: "Payment verification is pending. Please check My Orders shortly." };
  }
}