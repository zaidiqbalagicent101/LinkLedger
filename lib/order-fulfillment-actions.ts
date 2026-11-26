"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import type { OrderFulfillmentEventType, OrderStatus } from "@/generated/prisma/enums";
import { requirePublisherProfile, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildFulfillmentActionFilter } from "@/lib/order-fulfillment-policy";

export type FulfillmentActionState = {
  message?: string;
  errors?: Record<string, string>;
};

const orderIdSchema = z.string().cuid("Order not found.");
const isHttpUrl = (value: string) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};
const optionalHttpUrl = z.union([
  z.literal(""),
  z.string().trim().max(2048).url("Enter a valid URL.").refine(isHttpUrl, "Use an HTTP or HTTPS URL."),
]).optional().transform((value) => value || null);

const contentSubmissionSchema = z.object({
  orderId: orderIdSchema,
  contentUrl: optionalHttpUrl,
  contentText: z.string().trim().max(100000, "Content must be 100,000 characters or fewer.").optional().transform((value) => value || null),
}).superRefine((data, context) => {
  if (!data.contentUrl && !data.contentText) {
    context.addIssue({ code: "custom", path: ["contentText"], message: "Provide a content URL, article text, or both." });
  }
});

const revisionSchema = z.object({
  orderId: orderIdSchema,
  feedback: z.string().trim().min(1, "Feedback is required to request a revision.").max(5000),
});

const finalUrlSchema = z.object({ orderId: orderIdSchema, publicationUrl: z.string().trim().max(2048).url("Enter a valid live URL.").refine(isHttpUrl, "Use an HTTP or HTTPS URL.") });

function parseForm<T extends z.ZodType>(schema: T, formData: FormData) {
  return schema.safeParse(Object.fromEntries(formData.entries()));
}

function fieldErrors(error: z.ZodError): FulfillmentActionState {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && errors[key] === undefined) errors[key] = issue.message;
  }
  return { errors };
}

type FulfillmentEventInput = {
  type: OrderFulfillmentEventType;
  contentUrl?: string | null;
  contentText?: string | null;
  feedback?: string | null;
};

async function transitionOrder({
  orderId,
  actorId,
  role,
  nextStatus,
  events,
  orderData = {},
  requiresPublicationUrl = false,
}: {
  orderId: string;
  actorId: string;
  role: "PUBLISHER" | "ADVERTISER";
  nextStatus: OrderStatus;
  events: FulfillmentEventInput[];
  orderData?: Prisma.OrderUpdateManyMutationInput;
  requiresPublicationUrl?: boolean;
}): Promise<boolean> {
  const actionFilter = buildFulfillmentActionFilter(nextStatus, role, actorId, requiresPublicationUrl);
  if (!actionFilter) return false;

  const changed = await prisma.$transaction(async (transaction) => {
    const updated = await transaction.order.updateMany({
      where: {
        id: orderId,
        ...actionFilter,
      },
      data: { ...orderData, status: nextStatus },
    });
    if (updated.count !== 1) return false;

    for (const event of events) {
      await transaction.orderFulfillmentEvent.create({
        data: { ...event, orderId, actorId },
        select: { id: true },
      });
    }
    return true;
  });

  if (changed) {
    revalidatePath("/publisher/orders");
    revalidatePath("/advertiser/orders");
    revalidatePath(`/publisher/orders/${orderId}`);
    revalidatePath(`/advertiser/orders/${orderId}`);
  }
  return changed;
}

function conflictMessage() {
  return { message: "This order is no longer available for that action. Refresh and check its current status." };
}

export async function startPublisherOrderAction(
  _previousState: FulfillmentActionState | undefined,
  formData: FormData,
): Promise<FulfillmentActionState> {
  const publisher = await requirePublisherProfile();
  const parsedOrderId = orderIdSchema.safeParse(formData.get("orderId"));
  if (!parsedOrderId.success) return { message: "Order not found." };

  const changed = await transitionOrder({
    orderId: parsedOrderId.data,
    actorId: publisher.id,
    role: "PUBLISHER",
    nextStatus: "IN_PROGRESS",
    events: [{ type: "STARTED" }],
  });
  return changed ? { message: "Order started." } : conflictMessage();
}

export async function submitPublisherContentAction(
  _previousState: FulfillmentActionState | undefined,
  formData: FormData,
): Promise<FulfillmentActionState> {
  const publisher = await requirePublisherProfile();
  const parsed = parseForm(contentSubmissionSchema, formData);
  if (!parsed.success) return fieldErrors(parsed.error);

  const changed = await transitionOrder({
    orderId: parsed.data.orderId,
    actorId: publisher.id,
    role: "PUBLISHER",
    nextStatus: "CONTENT_SUBMITTED",
    events: [{
      type: "CONTENT_SUBMITTED",
      contentUrl: parsed.data.contentUrl,
      contentText: parsed.data.contentText,
    }],
  });
  return changed ? { message: "Content submitted to the advertiser." } : conflictMessage();
}

export async function requestOrderRevisionAction(
  _previousState: FulfillmentActionState | undefined,
  formData: FormData,
): Promise<FulfillmentActionState> {
  const advertiser = await requireRole("ADVERTISER");
  const parsed = parseForm(revisionSchema, formData);
  if (!parsed.success) return fieldErrors(parsed.error);

  const changed = await transitionOrder({
    orderId: parsed.data.orderId,
    actorId: advertiser.id,
    role: "ADVERTISER",
    nextStatus: "REVISION_REQUESTED",
    events: [{ type: "REVISION_REQUESTED", feedback: parsed.data.feedback }],
  });
  return changed ? { message: "Revision requested." } : conflictMessage();
}

export async function approveOrderContentAction(
  _previousState: FulfillmentActionState | undefined,
  formData: FormData,
): Promise<FulfillmentActionState> {
  const advertiser = await requireRole("ADVERTISER");
  const parsedOrderId = orderIdSchema.safeParse(formData.get("orderId"));
  if (!parsedOrderId.success) return { message: "Order not found." };

  const changed = await transitionOrder({
    orderId: parsedOrderId.data,
    actorId: advertiser.id,
    role: "ADVERTISER",
    nextStatus: "APPROVED",
    events: [{ type: "CONTENT_APPROVED" }],
  });
  return changed ? { message: "Content approved. The publisher can now submit the live URL." } : conflictMessage();
}

export async function submitFinalPublicationUrlAction(
  _previousState: FulfillmentActionState | undefined,
  formData: FormData,
): Promise<FulfillmentActionState> {
  const publisher = await requirePublisherProfile();
  const parsed = parseForm(finalUrlSchema, formData);
  if (!parsed.success) return fieldErrors(parsed.error);

  const changed = await transitionOrder({
    orderId: parsed.data.orderId,
    actorId: publisher.id,
    role: "PUBLISHER",
    nextStatus: "PUBLISHED",
    orderData: { publicationUrl: parsed.data.publicationUrl, publishedAt: new Date() },
    events: [{ type: "FINAL_URL_SUBMITTED", contentUrl: parsed.data.publicationUrl }],
  });
  return changed ? { message: "Live URL submitted for advertiser confirmation." } : conflictMessage();
}

export async function approveFinalPublicationAction(
  _previousState: FulfillmentActionState | undefined,
  formData: FormData,
): Promise<FulfillmentActionState> {
  const advertiser = await requireRole("ADVERTISER");
  const parsedOrderId = orderIdSchema.safeParse(formData.get("orderId"));
  if (!parsedOrderId.success) return { message: "Order not found." };

  const changed = await transitionOrder({
    orderId: parsedOrderId.data,
    actorId: advertiser.id,
    role: "ADVERTISER",
    nextStatus: "COMPLETED",
    orderData: { completedAt: new Date() },
    requiresPublicationUrl: true,
    events: [{ type: "FINAL_URL_APPROVED" }, { type: "COMPLETED" }],
  });
  return changed ? { message: "Publication confirmed and order completed." } : conflictMessage();
}