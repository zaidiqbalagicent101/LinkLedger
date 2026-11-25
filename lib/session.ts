import "server-only";
import { cookies } from "next/headers";
import { getIronSession, type IronSession } from "iron-session";

export type SessionData = {
  sessionId?: string;
};

const sessionPassword = process.env.SESSION_PASSWORD;

const password =
  sessionPassword ?? "linkledger-local-development-session-secret-do-not-use-in-production";

export async function getSession(
  rememberMe = true,
): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();

  if (process.env.NODE_ENV === "production" && (!sessionPassword || sessionPassword.length < 32)) {
    throw new Error("SESSION_PASSWORD must be at least 32 characters in production.");
  }

  return getIronSession<SessionData>(cookieStore, {
    cookieName: "linkledger_session",
    password,
    ttl: 60 * 60 * 24 * 30,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: rememberMe ? 60 * 60 * 24 * 30 - 60 : undefined,
    },
  });
}