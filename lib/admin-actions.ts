"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AdminActionState = {
  message?: string;
  errors?: Record<string, string>;
};

const reviewSchema = z.object({
  websiteId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().trim().max(5000).optional(),
}).refine((value) => value.decision !== "REJECTED" || Boolean(value.rejectionReason?.length), {
  message: "Add a reason when rejecting a website.",
  path: ["rejectionReason"],
});

const userStatusSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

function formErrors(error: z.ZodError): AdminActionState {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && errors[key] === undefined) errors[key] = issue.message;
  }
  return { errors };
}

export async function reviewWebsiteAction(
  _previousState: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireRole("ADMIN");
  const result = reviewSchema.safeParse({
    websiteId: formData.get("websiteId"),
    decision: formData.get("decision"),
    rejectionReason: formData.get("rejectionReason"),
  });

  if (!result.success) return formErrors(result.error);

  const rejectionReason = result.data.decision === "REJECTED"
    ? result.data.rejectionReason?.trim()
    : null;

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.publisherWebsite.update({
        where: { id: result.data.websiteId },
        data: {
          approvalStatus: result.data.decision,
          rejectionReason,
          reviewedAt: new Date(),
          reviewedById: admin.id,
        },
        select: { id: true },
      });

      await transaction.websiteReview.create({
        data: {
          publisherWebsiteId: result.data.websiteId,
          adminId: admin.id,
          status: result.data.decision,
          rejectionReason,
        },
        select: { id: true },
      });
    });
  } catch {
    return { message: "This website could not be reviewed. Refresh and try again." };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/websites");
  revalidatePath("/admin/websites/pending");
  revalidatePath("/admin/websites/approved");
  revalidatePath("/admin/websites/rejected");
  revalidatePath(`/admin/websites/${result.data.websiteId}`);
  revalidatePath("/publisher/websites");
  revalidatePath(`/publisher/websites/${result.data.websiteId}`);
  redirect(`/admin/websites/${result.data.websiteId}`);
}

export async function updateUserStatusAction(
  _previousState: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireRole("ADMIN");
  const result = userStatusSchema.safeParse({
    userId: formData.get("userId"),
    status: formData.get("status"),
  });

  if (!result.success) return formErrors(result.error);
  if (result.data.userId === admin.id && result.data.status === "INACTIVE") {
    return { message: "You cannot deactivate your own admin account." };
  }

  const user = await prisma.user.findUnique({
    where: { id: result.data.userId },
    select: { id: true },
  });

  if (!user) return { message: "User not found." };

  await prisma.$transaction(async (transaction) => {
    await transaction.user.update({
      where: { id: user.id },
      data: { status: result.data.status },
      select: { id: true },
    });

    if (result.data.status === "INACTIVE") {
      await transaction.session.deleteMany({ where: { userId: user.id } });
    }
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${user.id}`);
  redirect(`/admin/users/${user.id}`);
}