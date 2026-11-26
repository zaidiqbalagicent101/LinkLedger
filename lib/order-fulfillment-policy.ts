import type { OrderStatus } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

export type FulfillmentRole = "PUBLISHER" | "ADVERTISER";

export const fulfillmentTransitionSources: Partial<Record<OrderStatus, readonly OrderStatus[]>> = {
  IN_PROGRESS: ["CONFIRMED"],
  CONTENT_SUBMITTED: ["IN_PROGRESS", "REVISION_REQUESTED"],
  REVISION_REQUESTED: ["CONTENT_SUBMITTED"],
  APPROVED: ["CONTENT_SUBMITTED"],
  PUBLISHED: ["APPROVED"],
  COMPLETED: ["PUBLISHED"],
};

export function isValidFulfillmentTransition(
  current: OrderStatus,
  next: OrderStatus,
): boolean {
  return fulfillmentTransitionSources[next]?.includes(current) ?? false;
}

export function buildFulfillmentActionFilter(
  next: OrderStatus,
  role: FulfillmentRole,
  actorId: string,
  requiresPublicationUrl = false,
): Prisma.OrderWhereInput | null {
  const allowedStatuses = fulfillmentTransitionSources[next];
  if (!allowedStatuses) return null;

  return {
    paymentStatus: "PAID",
    status: { in: [...allowedStatuses] },
    ...(requiresPublicationUrl ? { publicationUrl: { not: null } } : {}),
    ...(role === "PUBLISHER"
      ? { website: { is: { publisherProfile: { is: { userId: actorId } } } } }
      : { advertiserId: actorId }),
  };
}