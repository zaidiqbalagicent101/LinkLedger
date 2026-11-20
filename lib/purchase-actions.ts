"use server";

import "server-only";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type PurchaseActionState = {
  message?: string;
  success?: boolean;
};

const purchaseSchema = z.object({
  serviceId: z.string().cuid(),
  idempotencyKey: z.string().uuid(),
});

function isSamePurchase(
  order: { advertiserId: string; publisherServiceId: string | null } | null,
  advertiserId: string,
  serviceId: string,
) {
  return order?.advertiserId === advertiserId && order.publisherServiceId === serviceId;
}

export async function buyPublisherServiceAction(
  _previousState: PurchaseActionState | undefined,
  formData: FormData,
): Promise<PurchaseActionState> {
  const user = await requireRole("ADVERTISER");
  const result = purchaseSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!result.success) return { message: "This service could not be purchased. Please try again." };

  const { serviceId, idempotencyKey } = result.data;
  const existingOrder = await prisma.order.findUnique({
    where: { idempotencyKey },
    select: { advertiserId: true, publisherServiceId: true },
  });
  if (isSamePurchase(existingOrder, user.id, serviceId)) {
    return { message: "Purchase confirmed successfully!", success: true };
  }
  if (existingOrder) return { message: "This service could not be purchased. Please try again." };

  const service = await prisma.publisherService.findFirst({
    where: {
      id: serviceId,
      isActive: true,
      archivedAt: null,
      website: { approvalStatus: "APPROVED" },
    },
    select: {
      id: true,
      serviceName: true,
      serviceType: true,
      price: true,
      currency: true,
      deliveryTimeDays: true,
      contentWritingIncluded: true,
      linkType: true,
      maximumLinks: true,
      homepageLinkAvailable: true,
      description: true,
      publishingGuidelines: true,
      additionalConditions: true,
      website: {
        select: {
          id: true,
          websiteName: true,
          websiteUrl: true,
          websiteNiche: true,
          monthlyTraffic: true,
          websiteLanguage: true,
          targetAudienceCountry: true,
          websiteDescription: true,
          domainRating: true,
          domainAuthority: true,
        },
      },
    },
  });

  if (!service) return { message: "This service is no longer available." };

  try {
    await prisma.order.create({
      data: {
        idempotencyKey,
        source: "DIRECT_PURCHASE",
        status: "CONFIRMED",
        paymentStatus: "PENDING",
        advertiserId: user.id,
        publisherWebsiteId: service.website.id,
        publisherServiceId: service.id,
        websiteNameSnapshot: service.website.websiteName,
        websiteUrlSnapshot: service.website.websiteUrl,
        websiteNicheSnapshot: service.website.websiteNiche,
        monthlyTrafficSnapshot: service.website.monthlyTraffic,
        websiteLanguageSnapshot: service.website.websiteLanguage,
        targetAudienceCountrySnapshot: service.website.targetAudienceCountry,
        websiteDescriptionSnapshot: service.website.websiteDescription,
        domainRatingSnapshot: service.website.domainRating,
        domainAuthoritySnapshot: service.website.domainAuthority,
        serviceNameSnapshot: service.serviceName,
        serviceTypeSnapshot: service.serviceType,
        serviceDescriptionSnapshot: service.description,
        publishingGuidelinesSnapshot: service.publishingGuidelines,
        additionalConditionsSnapshot: service.additionalConditions,
        originalPrice: service.price,
        originalCurrency: service.currency,
        originalDeliveryTimeDays: service.deliveryTimeDays,
        originalContentWritingIncluded: service.contentWritingIncluded,
        originalLinkType: service.linkType,
        originalMaximumLinks: service.maximumLinks,
        originalHomepageLinkAvailable: service.homepageLinkAvailable,
        agreedPrice: service.price,
        agreedCurrency: service.currency,
        agreedDeliveryTimeDays: service.deliveryTimeDays,
        agreedContentWritingIncluded: service.contentWritingIncluded,
        agreedLinkType: service.linkType,
        agreedNumberOfLinks: service.maximumLinks,
        agreedHomepageLinkAvailable: service.homepageLinkAvailable,
        contentRequirements: "",
        additionalInstructions: "",
      },
    });
  } catch {
    const duplicate = await prisma.order.findUnique({
      where: { idempotencyKey },
      select: { advertiserId: true, publisherServiceId: true },
    });
    if (isSamePurchase(duplicate, user.id, serviceId)) {
      return { message: "Purchase confirmed successfully!", success: true };
    }
    return { message: "We couldn't confirm this purchase. Please try again." };
  }

  return { message: "Purchase confirmed successfully!", success: true };
}