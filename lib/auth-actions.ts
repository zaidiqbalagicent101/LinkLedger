"use server";

import "server-only";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { dashboardForRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export type AuthFormState = {
  message?: string;
  errors?: Partial<
    Record<"fullName" | "email" | "password" | "confirmPassword" | "country" | "terms", string>
  >;
};

const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use no more than 72 characters.")
  .refine((password) => Buffer.byteLength(password, "utf8") <= 72, {
    message: "Password is too long.",
  });

const registrationSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name.").max(191),
    email: z.email("Enter a valid email address.").trim().toLowerCase(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
    country: z.string().trim().min(2, "Enter your country.").max(100),
    terms: z.literal(true, { error: "Accept the terms to create an account." }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password."),
});

function formErrors(error: z.ZodError): AuthFormState {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && errors[field] === undefined) {
      errors[field] = issue.message;
    }
  }

  return {
    errors: errors as AuthFormState["errors"],
  };
}

function registrationValues(formData: FormData) {
  return registrationSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    country: formData.get("country"),
    terms: formData.get("terms") === "on",
  });
}

async function register(
  formData: FormData,
  role: "ADVERTISER" | "PUBLISHER",
): Promise<AuthFormState> {
  const result = registrationValues(formData);

  if (!result.success) {
    return formErrors(result.error);
  }

  const { fullName, email, password, country } = result.data;

  try {
    if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
      return { message: "An account with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role,
        status: "ACTIVE",
        country,
        lastLoginAt: null,
      },
      select: { id: true },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { message: "An account with this email already exists." };
    }

    return { message: "We couldn't create your account right now. Please try again." };
  }

  redirect(`/login?registered=${role.toLowerCase()}`);
}

export async function registerAdvertiserAction(
  _previousState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  return register(formData, "ADVERTISER");
}

export async function registerPublisherAction(
  _previousState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  return register(formData, "PUBLISHER");
}

export async function loginAction(
  _previousState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return formErrors(result.error);
  }

  const user = await prisma.user.findUnique({
    where: { email: result.data.email },
    select: {
      id: true,
      password: true,
      role: true,
      status: true,
    },
  });

  if (!user || !(await bcrypt.compare(result.data.password, user.password))) {
    return { message: "Email or password is incorrect." };
  }

  if (user.status !== "ACTIVE") {
    return { message: "This account is inactive. Contact support for help." };
  }

  const rememberMe = formData.get("rememberMe") === "on";
  const session = await getSession(rememberMe);
  const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000);
  const createdSession = await prisma.$transaction(async (transaction) => {
    if (session.sessionId) {
      await transaction.session.deleteMany({ where: { id: session.sessionId } });
    }

    const newSession = await transaction.session.create({
      data: { userId: user.id, expiresAt },
      select: { id: true },
    });

    await transaction.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
      select: { id: true },
    });

    return newSession;
  });

  session.sessionId = createdSession.id;
  await session.save();

  if (user.role === "PUBLISHER") {
    const profile = await prisma.publisherProfile.findUnique({
      where: { userId: user.id },
      select: { publisherName: true, country: true, description: true },
    });

    if (
      !profile ||
      !profile.publisherName.trim() ||
      !profile.country.trim() ||
      !profile.description.trim()
    ) {
      redirect("/publisher/onboarding");
    }
  }

  redirect(dashboardForRole(user.role));
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();

  if (session.sessionId) {
    await prisma.session.deleteMany({ where: { id: session.sessionId } });
  }

  session.destroy();
  redirect("/login?loggedOut=1");
}