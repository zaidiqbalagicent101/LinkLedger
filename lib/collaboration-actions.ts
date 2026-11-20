"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CollaborationActionState = {
  message?: string;
  errors?: Record<string, string>;
};

const requestIdSchema = z.string().cuid("Request not found.");
const supportedCurrencies = new Set(Intl.supportedValuesOf("currency"));
const moneySchema = z.string()
  .trim()
  .regex(/^\d{1,8}(?:\.\d{1,2})?$/, "Enter an amount with up to two decimal places.")
  .refine((value) => Number(value) > 0, "Amount must be greater than zero.");
const optionalText = z.string().trim().max(5000).optional().transform((value) => value || null);

const publisherResponseSchema = z.object({
  requestId: requestIdSchema,
  decision: z.enum(["ACCEPTED", "REJECTED", "NEGOTIATION"]),
  publisherResponse: optionalText,
  revisedPrice: z.union([z.literal(""), moneySchema]).optional(),
  revisedCurrency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/).refine((value) => supportedCurrencies.has(value)).optional(),
  revisedTerms: optionalText,
}).superRefine((data, context) => {
  if (data.decision === "NEGOTIATION") {
    if (!data.revisedPrice) context.addIssue({ code: "custom", path: ["revisedPrice"], message: "Enter your revised price." });
    if (!data.revisedCurrency) context.addIssue({ code: "custom", path: ["revisedCurrency"], message: "Choose a currency." });
    if (!data.revisedTerms) context.addIssue({ code: "custom", path: ["revisedTerms"], message: "Describe your revised terms." });
  }
});

const advertiserDecisionSchema = z.object({
  requestId: requestIdSchema,
  decision: z.enum(["ACCEPTED", "REJECTED"]),
});

function parseForm<T extends z.ZodType>(schema: T, formData: FormData) {
  return schema.safeParse(Object.fromEntries(formData.entries()));
}

function fieldErrors(error: z.ZodError): CollaborationActionState {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && errors[key] === undefined) errors[key] = issue.message;
  }
  return { errors };
}

export async function respondToCollaborationRequestAction(
  _previousState: CollaborationActionState | undefined,
  formData: FormData,
): Promise<CollaborationActionState> {
  const user = await requireRole("PUBLISHER");
  const result = parseForm(publisherResponseSchema, formData);
  if (!result.success) return fieldErrors(result.error);

  const request = await prisma.collaborationRequest.findFirst({
    where: {
      id: result.data.requestId,
      status: "PENDING",
      website: { publisherProfile: { userId: user.id } },
    },
    select: { id: true, publisherWebsiteId: true },
  });
  if (!request?.publisherWebsiteId) return { message: "Request not found or no longer pending." };

  const updated = await prisma.collaborationRequest.updateMany({
    where: { id: request.id, publisherWebsiteId: request.publisherWebsiteId, status: "PENDING" },
    data: {
      status: result.data.decision,
      publisherResponse: result.data.publisherResponse ?? null,
      revisedPrice: result.data.decision === "NEGOTIATION" ? result.data.revisedPrice || null : null,
      revisedCurrency: result.data.decision === "NEGOTIATION" ? result.data.revisedCurrency : null,
      revisedTerms: result.data.decision === "NEGOTIATION" ? result.data.revisedTerms : null,
      revisedAt: result.data.decision === "NEGOTIATION" ? new Date() : null,
      acceptedAt: result.data.decision === "ACCEPTED" ? new Date() : null,
    },
  });

  if (updated.count !== 1) return { message: "Request not found or no longer pending." };
  revalidatePath("/publisher/requests");
  revalidatePath(`/publisher/requests/${request.id}`);
  revalidatePath("/advertiser/requests");
  redirect(`/publisher/requests/${request.id}`);
}

export async function respondToRevisedProposalAction(
  _previousState: CollaborationActionState | undefined,
  formData: FormData,
): Promise<CollaborationActionState> {
  const user = await requireRole("ADVERTISER");
  const result = parseForm(advertiserDecisionSchema, formData);
  if (!result.success) return fieldErrors(result.error);

  const updated = await prisma.collaborationRequest.updateMany({
    where: {
      id: result.data.requestId,
      advertiserId: user.id,
      status: "NEGOTIATION",
      revisedPrice: { not: null },
    },
    data: {
      status: result.data.decision,
      acceptedAt: result.data.decision === "ACCEPTED" ? new Date() : null,
    },
  });

  if (updated.count !== 1) return { message: "This proposal is no longer available." };
  revalidatePath("/advertiser/requests");
  redirect("/advertiser/requests");
}

export async function cancelCollaborationRequestAction(formData: FormData): Promise<void> {
  const user = await requireRole("ADVERTISER");
  const requestId = requestIdSchema.safeParse(formData.get("requestId"));
  if (!requestId.success) return;

  const cancelled = await prisma.collaborationRequest.updateMany({
    where: {
      id: requestId.data,
      advertiserId: user.id,
      status: { in: ["PENDING", "NEGOTIATION"] },
    },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  if (cancelled.count === 1) revalidatePath("/advertiser/requests");
}