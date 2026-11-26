import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export type AuthenticatedUser = {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "ADVERTISER" | "PUBLISHER";
};

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  await connection();
  const session = await getSession();

  if (!session.sessionId) {
    return null;
  }

  const activeSession = await prisma.session.findFirst({
    where: {
      id: session.sessionId,
      expiresAt: { gt: new Date() },
      user: { status: "ACTIVE" },
    },
    select: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return activeSession?.user ?? null;
}

export function dashboardForRole(role: AuthenticatedUser["role"]): string {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "PUBLISHER") return "/publisher/dashboard";
  return "/advertiser/dashboard";
}

export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(
  role: AuthenticatedUser["role"],
): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (user.role !== role) {
    redirect(dashboardForRole(user.role));
  }

  return user;
}

export async function requirePublisherProfile(): Promise<AuthenticatedUser> {
  const user = await requireRole("PUBLISHER");
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

  return user;
}