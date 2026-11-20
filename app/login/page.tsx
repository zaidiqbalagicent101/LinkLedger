import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

type LoginPageProps = {
  searchParams: Promise<{
    registered?: string;
    loggedOut?: string;
    notice?: string;
  }>;
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <AuthShell role="login">
      <Suspense fallback={<div className="auth-form-wrap" />}>
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function LoginContent({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const notice = params.registered
    ? `Your ${params.registered} account is ready. Sign in to continue.`
    : params.loggedOut
      ? "You have been signed out."
      : params.notice;

  return <AuthForm mode="login" notice={notice} />;
}