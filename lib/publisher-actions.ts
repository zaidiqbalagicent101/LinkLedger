"use server";

import "server-only";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export type PublisherActionState = {
  message?: string;
  errors?: Record<string, string>;
};

const optionalUrl = z
  .union([z.literal(""), z.string().max(2048).url("Enter a valid image URL.")])
  .optional()
  .transform((value) => value || null);

function isHttpUrl(value: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

const profileSchema = z.object({
  publisherName: z.string().trim().min(2, "Enter your publisher name.").max(191),
  businessName: z.string().trim().max(191).optional().transform((value) => value || null),
  country: z.string().trim().min(2, "Enter your country.").max(100),
  contactNumber: z.string().trim().max(40).optional().transform((value) => value || null),
  description: z.string().trim().min(20, "Add at least 20 characters about your publication.").max(5000),
  profileImage: optionalUrl,
});

const websiteSchema = z.object({
  websiteName: z.string().trim().min(2, "Enter a website name.").max(191),
  websiteUrl: z
    .string()
    .trim()
    .max(512, "Website URL is too long.")
    .url("Enter a valid website URL.")
    .refine(isHttpUrl, "Use an HTTP or HTTPS website URL.")
    .transform((value) => {
      const url = new URL(value);
      const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
      return `https://${hostname}${url.port ? `:${url.port}` : ""}`;
    }),
  websiteNiche: z.string().trim().min(2, "Choose a website niche.").max(120),
  monthlyTraffic: z.coerce.number().int().min(0).max(2147483647),
  websiteLanguage: z.string().trim().min(2, "Enter the website language.").max(80),
  targetAudienceCountry: z.string().trim().min(2, "Enter a target country.").max(100),
  websiteDescription: z.string().trim().min(20, "Add at least 20 characters about the website.").max(5000),
  websiteLogo: optionalUrl,
  domainRating: z.union([z.literal(""), z.coerce.number().int().min(0).max(100)]).optional().transform((value) => value === "" || value === undefined ? null : value),
  domainAuthority: z.union([z.literal(""), z.coerce.number().int().min(0).max(100)]).optional().transform((value) => value === "" || value === undefined ? null : value),
});

function parseForm<T extends z.ZodType>(schema: T, formData: FormData) {
  return schema.safeParse(Object.fromEntries(formData.entries()));
}

function fieldErrors(error: z.ZodError): PublisherActionState {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && errors[key] === undefined) errors[key] = issue.message;
  }
  return { errors };
}

function isUniqueConstraint(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function savePublisherProfileAction(
  _previousState: PublisherActionState | undefined,
  formData: FormData,
): Promise<PublisherActionState> {
  const user = await requireRole("PUBLISHER");
  const result = parseForm(profileSchema, formData);

  if (!result.success) return fieldErrors(result.error);

  await prisma.publisherProfile.upsert({
    where: { userId: user.id },
    create: { ...result.data, userId: user.id },
    update: result.data,
    select: { id: true },
  });

  redirect("/publisher/dashboard");
}

async function publisherProfileId(userId: string): Promise<string> {
  const profile = await prisma.publisherProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) redirect("/publisher/onboarding");
  return profile.id;
}

export async function createPublisherWebsiteAction(
  _previousState: PublisherActionState | undefined,
  formData: FormData,
): Promise<PublisherActionState> {
  const user = await requireRole("PUBLISHER");
  const result = parseForm(websiteSchema, formData);

  if (!result.success) return fieldErrors(result.error);

  const profileId = await publisherProfileId(user.id);

  try {
    await prisma.publisherWebsite.create({
      data: {
        ...result.data,
        publisherProfileId: profileId,
        metricsVerified: false,
      },
      select: { id: true },
    });
  } catch (error) {
    if (isUniqueConstraint(error)) return { message: "This website has already been submitted." };
    return { message: "We couldn't submit this website. Please try again." };
  }

  redirect("/publisher/websites");
}

export async function updatePublisherWebsiteAction(
  _previousState: PublisherActionState | undefined,
  formData: FormData,
): Promise<PublisherActionState> {
  const user = await requireRole("PUBLISHER");
  const websiteId = z.string().cuid().safeParse(formData.get("websiteId"));
  const result = parseForm(websiteSchema, formData);

  if (!websiteId.success) return { message: "Website not found." };
  if (!result.success) return fieldErrors(result.error);

  const profileId = await publisherProfileId(user.id);

  try {
    const updated = await prisma.publisherWebsite.updateMany({
      where: { id: websiteId.data, publisherProfileId: profileId },
      data: {
        ...result.data,
        approvalStatus: "PENDING",
        rejectionReason: null,
        reviewedAt: null,
        reviewedById: null,
      },
    });

    if (updated.count !== 1) return { message: "Website not found." };
  } catch (error) {
    if (isUniqueConstraint(error)) return { message: "Another website already uses this URL." };
    return { message: "We couldn't update this website. Please try again." };
  }

  redirect(`/publisher/websites/${websiteId.data}`);
}