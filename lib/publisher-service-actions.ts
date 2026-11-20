"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePublisherProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type PublisherServiceActionState = {
  message?: string;
  errors?: Record<string, string>;
};

const supportedCurrencies = new Set(Intl.supportedValuesOf("currency"));
const serviceIdSchema = z.string().cuid("Service not found.");
const websiteIdSchema = z.string().cuid("Website not found.");

const optionalText = z.string().trim().max(5000).optional().transform((value) => value || null);
const optionalPositiveInteger = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? null : value,
  z.coerce.number().int().min(1).max(2147483647).nullable(),
);
const checkbox = z.preprocess(
  (value) => value === "on" || value === "true" || value === true,
  z.boolean(),
);

const serviceSchema = z.object({
  serviceName: z.string().trim().min(2, "Enter a service name.").max(120),
  serviceType: z.enum([
    "GUEST_POST",
    "SPONSORED_ARTICLE",
    "LINK_INSERTION",
    "BANNER_ADVERTISEMENT",
  ]),
  price: z.string()
    .trim()
    .regex(/^\d{1,8}(?:\.\d{1,2})?$/, "Enter a price with up to two decimal places.")
    .refine((value) => Number(value) > 0, "Price must be greater than zero."),
  currency: z.string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Enter a three-letter currency code.")
    .refine((value) => supportedCurrencies.has(value), "Enter a supported ISO 4217 currency code."),
  deliveryTimeDays: z.coerce.number().int().min(1, "Delivery time must be at least one day.").max(2147483647),
  contentWritingIncluded: checkbox,
  linkType: z.enum(["DOFOLLOW", "NOFOLLOW", "BOTH", "NOT_APPLICABLE"]),
  maximumLinks: optionalPositiveInteger,
  homepageLinkAvailable: checkbox,
  description: z.string().trim().min(10, "Add at least 10 characters describing this service.").max(5000),
  publishingGuidelines: optionalText,
  additionalConditions: optionalText,
}).superRefine((service, context) => {
  if (service.serviceType === "BANNER_ADVERTISEMENT") {
    if (service.linkType !== "NOT_APPLICABLE") {
      context.addIssue({ code: "custom", path: ["linkType"], message: "Banner advertisements must use Not applicable for link type." });
    }
    if (service.maximumLinks !== null) {
      context.addIssue({ code: "custom", path: ["maximumLinks"], message: "Maximum links do not apply to banner advertisements." });
    }
  } else {
    if (service.linkType === "NOT_APPLICABLE") {
      context.addIssue({ code: "custom", path: ["linkType"], message: "Choose a link type for this service." });
    }
    if (service.maximumLinks === null) {
      context.addIssue({ code: "custom", path: ["maximumLinks"], message: "Enter the maximum number of links." });
    }
  }
});

function parseForm<T extends z.ZodType>(schema: T, formData: FormData) {
  return schema.safeParse(Object.fromEntries(formData.entries()));
}

function fieldErrors(error: z.ZodError): PublisherServiceActionState {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && errors[key] === undefined) errors[key] = issue.message;
  }
  return { errors };
}

async function findOwnedWebsite(userId: string, websiteId: string) {
  return prisma.publisherWebsite.findFirst({
    where: { id: websiteId, publisherProfile: { userId } },
    select: { id: true },
  });
}

async function findOwnedService(userId: string, websiteId: string, serviceId: string) {
  const website = await findOwnedWebsite(userId, websiteId);
  if (!website) return null;

  return prisma.publisherService.findFirst({
    where: { id: serviceId, publisherWebsiteId: website.id, archivedAt: null },
    select: { id: true, publisherWebsiteId: true },
  });
}

function refreshServiceViews(websiteId: string) {
  revalidatePath(`/publisher/websites/${websiteId}`);
  revalidatePath(`/publisher/websites/${websiteId}/services`);
  revalidatePath("/advertiser/marketplace");
}

export async function createPublisherServiceAction(
  _previousState: PublisherServiceActionState | undefined,
  formData: FormData,
): Promise<PublisherServiceActionState> {
  const user = await requirePublisherProfile();
  const websiteId = websiteIdSchema.safeParse(formData.get("websiteId"));
  const result = parseForm(serviceSchema, formData);

  if (!websiteId.success) return { message: "Website not found." };
  if (!result.success) return fieldErrors(result.error);
  if (!(await findOwnedWebsite(user.id, websiteId.data))) return { message: "Website not found." };

  try {
    await prisma.publisherService.create({
      data: { ...result.data, publisherWebsiteId: websiteId.data },
      select: { id: true },
    });
  } catch {
    return { message: "We couldn't create this service. Please try again." };
  }

  refreshServiceViews(websiteId.data);
  redirect(`/publisher/websites/${websiteId.data}/services`);
}

export async function updatePublisherServiceAction(
  _previousState: PublisherServiceActionState | undefined,
  formData: FormData,
): Promise<PublisherServiceActionState> {
  const user = await requirePublisherProfile();
  const websiteId = websiteIdSchema.safeParse(formData.get("websiteId"));
  const serviceId = serviceIdSchema.safeParse(formData.get("serviceId"));
  const result = parseForm(serviceSchema, formData);

  if (!websiteId.success || !serviceId.success) return { message: "Service not found." };
  if (!result.success) return fieldErrors(result.error);

  const service = await findOwnedService(user.id, websiteId.data, serviceId.data);
  if (!service) return { message: "Service not found." };

  const updated = await prisma.publisherService.updateMany({
    where: { id: service.id, publisherWebsiteId: service.publisherWebsiteId, archivedAt: null },
    data: result.data,
  });

  if (updated.count !== 1) return { message: "Service not found." };

  refreshServiceViews(websiteId.data);
  redirect(`/publisher/websites/${websiteId.data}/services/${service.id}`);
}

export async function setPublisherServiceActiveAction(formData: FormData): Promise<void> {
  const user = await requirePublisherProfile();
  const websiteId = websiteIdSchema.safeParse(formData.get("websiteId"));
  const serviceId = serviceIdSchema.safeParse(formData.get("serviceId"));
  const active = z.enum(["true", "false"]).safeParse(formData.get("active"));

  if (!websiteId.success || !serviceId.success || !active.success) return;

  const service = await findOwnedService(user.id, websiteId.data, serviceId.data);
  if (!service) return;

  await prisma.publisherService.updateMany({
    where: { id: service.id, publisherWebsiteId: service.publisherWebsiteId, archivedAt: null },
    data: { isActive: active.data === "true" },
  });

  refreshServiceViews(websiteId.data);
}

export async function archivePublisherServiceAction(formData: FormData): Promise<void> {
  const user = await requirePublisherProfile();
  const websiteId = websiteIdSchema.safeParse(formData.get("websiteId"));
  const serviceId = serviceIdSchema.safeParse(formData.get("serviceId"));

  if (!websiteId.success || !serviceId.success) return;

  const service = await findOwnedService(user.id, websiteId.data, serviceId.data);
  if (!service) return;

  await prisma.publisherService.updateMany({
    where: { id: service.id, publisherWebsiteId: service.publisherWebsiteId, archivedAt: null },
    data: { isActive: false, archivedAt: new Date() },
  });

  refreshServiceViews(websiteId.data);
  redirect(`/publisher/websites/${websiteId.data}/services`);
}