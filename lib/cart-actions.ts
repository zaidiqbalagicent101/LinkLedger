"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CartActionResult = {
  success: boolean;
  message?: string;
};

const serviceIdSchema = z.string().cuid();

export async function addAdvertiserCartItem(
  serviceId: string,
): Promise<CartActionResult> {
  const user = await requireRole("ADVERTISER");
  const parsedServiceId = serviceIdSchema.safeParse(serviceId);

  if (!parsedServiceId.success) {
    return { success: false, message: "This service could not be added to your cart." };
  }

  const service = await prisma.publisherService.findFirst({
    where: {
      id: parsedServiceId.data,
      isActive: true,
      archivedAt: null,
      website: { approvalStatus: "APPROVED" },
    },
    select: { id: true },
  });

  if (!service) {
    return { success: false, message: "This service is no longer available." };
  }

  const paidPurchase = await prisma.order.findFirst({
    where: {
      advertiserId: user.id,
      publisherServiceId: service.id,
      source: "DIRECT_PURCHASE",
      paymentStatus: "PAID",
    },
    select: { id: true },
  });

  if (paidPurchase) {
    return { success: false, message: "You have already purchased this service." };
  }

  await prisma.advertiserCartItem.upsert({
    where: {
      advertiserId_publisherServiceId: {
        advertiserId: user.id,
        publisherServiceId: service.id,
      },
    },
    create: {
      advertiserId: user.id,
      publisherServiceId: service.id,
    },
    update: {},
  });

  revalidatePath("/advertiser/marketplace");
  revalidatePath("/advertiser/cart");
  return { success: true };
}

export async function removeAdvertiserCartItem(
  serviceId: string,
): Promise<CartActionResult> {
  const user = await requireRole("ADVERTISER");
  const parsedServiceId = serviceIdSchema.safeParse(serviceId);

  if (!parsedServiceId.success) {
    return { success: false, message: "This cart item could not be removed." };
  }

  await prisma.advertiserCartItem.deleteMany({
    where: {
      advertiserId: user.id,
      publisherServiceId: parsedServiceId.data,
    },
  });

  revalidatePath("/advertiser/marketplace");
  revalidatePath("/advertiser/cart");
  return { success: true };
}