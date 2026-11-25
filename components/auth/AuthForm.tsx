
"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
  Store,
  CheckCircle2,
} from "lucide-react";
import {
  loginAction,
  registerAdvertiserAction,
  registerPublisherAction,
  type AuthFormState,
} from "@/lib/auth-actions";

type AuthFormProps = {
  mode: "login" | "register";
  role?: "advertiser" | "publisher";
  notice?: string;
};

type AuthAction = (
  state: AuthFormState | undefined,
  formData: FormData,
) => Promise<AuthFormState>;

export function AuthForm({ mode, role, notice }: AuthFormProps) {
  const action: AuthAction =
    mode === "login"
      ? loginAction
      : role === "advertiser"
        ? registerAdvertiserAction
        : registerPublisherAction;

  const [state, formAction, pending] = useActionState(action, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isLogin = mode === "login";
  const isAdvertiser = role === "advertiser";

  const registrationTitle = isAdvertiser
    ? "Create your advertiser account"
    : "Create your publisher account";

  const roleLabel = isAdvertiser ? "Advertiser" : "Publisher";

  const inputClass =
    "w-full min-h-[50px] rounded-xl border border-[#e5eae8] bg-[#fbfcfb] px-4 text-[14px] font-medium text-[#12211c] outline-none transition-all placeholder:font-normal placeholder:text-[#a0aaa5] hover:border-[#cbd8d1] focus:border-[#0e7a5a] focus:bg-white focus:ring-4 focus:ring-[#0e7a5a]/[0.08] aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-100";

  const labelClass =
    "mb-2 block text-[13px] font-semibold text-[#203d33]";

  return (
    <div className="relative w-full max-w-[490px] overflow-hidden rounded-[28px] border border-[#e5eae8] bg-white shadow-[0_24px_80px_-35px_rgba(18,55,40,0.22)]">
      {/* Decorative top accent */}
      <div className="h-[5px] w-full bg-gradient-to-r from-[#0b2e24] via-[#0e7a5a] to-[#56a88a]" />

      <div className="p-6 sm:p-9 lg:p-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="group mb-8 inline-flex items-center gap-2 text-[13px] font-semibold text-[#718078] transition-colors hover:text-[#0e7a5a]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5eae8] bg-[#f8faf9] transition-all group-hover:border-[#b8d5c8] group-hover:bg-[#edf6f1]">
              <ArrowLeft size={15} />
            </span>
            Back to home
          </Link>

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eaf4ef] text-[#0e7a5a]">
              {isLogin ? (
                <ShieldCheck size={21} strokeWidth={1.8} />
              ) : isAdvertiser ? (
                <Store size={21} strokeWidth={1.8} />
              ) : (
                <UserRound size={21} strokeWidth={1.8} />
              )}
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0e7a5a]">
                {isLogin ? "Welcome back" : `Join as ${roleLabel}`}
              </p>
              <p className="mt-0.5 text-[12px] text-[#82918b]">
                {isLogin ? "Your workspace awaits" : "Get started with LinkLedger"}
              </p>
            </div>
          </div>

          <h2 className="text-[27px] font-bold leading-[1.2] tracking-[-0.8px] text-[#12211c] sm:text-[31px]">
            {isLogin ? (
              <>
                Sign in to your
                <span className="text-[#0e7a5a]"> workspace.</span>
              </>
            ) : (
              registrationTitle
            )}
          </h2>

          <p className="mt-3 max-w-[390px] text-[14px] leading-6 text-[#718078]">
            {isLogin
              ? "Enter your account details to continue managing your LinkLedger workspace."
              : isAdvertiser
                ? "Discover quality websites, connect with publishers, and grow your online presence."
                : "Showcase your websites, list your services, and connect with advertisers."}
          </p>
        </div>

        {/* Role indicator */}
        {!isLogin && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#dcebe2] bg-[#f3f8f5] px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#0e7a5a] shadow-sm">
              {isAdvertiser ? <Store size={16} /> : <UserRound size={16} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-[#203d33]">
                {roleLabel} account
              </p>
              <p className="mt-0.5 text-[11px] text-[#718078]">
                {isAdvertiser
                  ? "Find and purchase publishing services"
                  : "List and manage your publishing services"}
              </p>
            </div>
            <CheckCircle2 size={17} className="shrink-0 text-[#0e7a5a]" />
          </div>
        )}

        {/* Notices */}
        {notice && (
          <div
            className="mb-5 flex gap-3 rounded-xl border border-[#dcebe2] bg-[#f3f8f5] px-4 py-3 text-[13px] leading-5 text-[#28634d]"
            role="status"
          >
            <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {state?.message && (
          <div
            className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] leading-5 text-red-700"
            role="alert"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[12px] font-bold">
              !
            </span>
            <span>{state.message}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" action={formAction}>
          {!isLogin && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block min-w-0">
                <span className={labelClass}>Full name</span>
                <input
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  required
                  className={inputClass}
                  aria-invalid={Boolean(state?.errors?.fullName)}
                  aria-describedby={
                    state?.errors?.fullName ? "fullName-error" : undefined
                  }
                />
                {state?.errors?.fullName && (
                  <span
                    id="fullName-error"
                    className="mt-1.5 block text-[12px] font-medium text-red-600"
                  >
                    {state.errors.fullName}
                  </span>
                )}
              </label>

              <label className="block min-w-0">
                <span className={labelClass}>Country</span>
                <input
                  name="country"
                  type="text"
                  autoComplete="country-name"
                  placeholder="Your country"
                  required
                  className={inputClass}
                  aria-invalid={Boolean(state?.errors?.country)}
                  aria-describedby={
                    state?.errors?.country ? "country-error" : undefined
                  }
                />
                {state?.errors?.country && (
                  <span
                    id="country-error"
                    className="mt-1.5 block text-[12px] font-medium text-red-600"
                  >
                    {state.errors.country}
                  </span>
                )}
              </label>
            </div>
          )}

          <label className="block">
            <span className={labelClass}>Email address</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              required
              className={inputClass}
              aria-invalid={Boolean(state?.errors?.email)}
              aria-describedby={
                state?.errors?.email ? "email-error" : undefined
              }
            />
            {state?.errors?.email && (
              <span
                id="email-error"
                className="mt-1.5 block text-[12px] font-medium text-red-600"
              >
                {state.errors.email}
              </span>
            )}
          </label>

          <label className="block">
            <span className={labelClass}>Password</span>
            <span className="relative block">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder={
                  isLogin ? "Enter your password" : "At least 8 characters"
                }
                required
                className={`${inputClass} pr-12`}
                aria-invalid={Boolean(state?.errors?.password)}
                aria-describedby={
                  state?.errors?.password ? "password-error" : undefined
                }
              />
              <button
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-[#82918b] transition-colors hover:text-[#0e7a5a] focus-visible:outline-2 focus-visible:outline-[#0e7a5a]"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
            {state?.errors?.password && (
              <span
                id="password-error"
                className="mt-1.5 block text-[12px] font-medium text-red-600"
              >
                {state.errors.password}
              </span>
            )}
          </label>

          {!isLogin && (
            <label className="block">
              <span className={labelClass}>Confirm password</span>
              <span className="relative block">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  required
                  className={`${inputClass} pr-12`}
                  aria-invalid={Boolean(state?.errors?.confirmPassword)}
                  aria-describedby={
                    state?.errors?.confirmPassword
                      ? "confirmPassword-error"
                      : undefined
                  }
                />
                <button
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-[#82918b] transition-colors hover:text-[#0e7a5a] focus-visible:outline-2 focus-visible:outline-[#0e7a5a]"
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((visible) => !visible)
                  }
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  title={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </span>
              {state?.errors?.confirmPassword && (
                <span
                  id="confirmPassword-error"
                  className="mt-1.5 block text-[12px] font-medium text-red-600"
                >
                  {state.errors.confirmPassword}
                </span>
              )}
            </label>
          )}

          {/* Form options */}
          {isLogin ? (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
              <label className="group flex cursor-pointer items-center gap-2.5 text-[13px] font-medium text-[#5f6f69]">
                <input
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-[#cbd8d1] accent-[#0e7a5a] focus:ring-[#0e7a5a]"
                />
                <span className="transition-colors group-hover:text-[#203d33]">
                  Remember me
                </span>
              </label>

              <Link
                href="/login?notice=Password%20reset%20is%20not%20available%20yet."
                className="text-[13px] font-semibold text-[#0e7a5a] transition-colors hover:text-[#0a6149] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          ) : (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#e5eae8] bg-[#fbfcfb] p-3.5 transition-colors hover:border-[#cbd8d1]">
              <input
                name="terms"
                type="checkbox"
                required
                aria-invalid={Boolean(state?.errors?.terms)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[#cbd8d1] accent-[#0e7a5a] focus:ring-[#0e7a5a]"
              />
              <span className="text-[12px] leading-5 text-[#718078]">
                I accept the{" "}
                <a
                  href="#terms"
                  className="font-semibold text-[#0e7a5a] hover:underline"
                >
                  Terms &amp; Conditions
                </a>
              </span>
              {state?.errors?.terms && (
                <span className="text-[12px] font-medium text-red-600">
                  {state.errors.terms}
                </span>
              )}
            </label>
          )}

          {/* Submit */}
          <button
            className="group relative flex min-h-[52px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[#0e7a5a] px-5 text-[14px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(14,122,90,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0a6149] hover:shadow-[0_12px_24px_-8px_rgba(14,122,90,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            type="submit"
            disabled={pending}
          >
            {pending ? (
              <>
                <LoaderCircle className="animate-spin" size={18} />
                <span>Please wait...</span>
              </>
            ) : (
              <>
                <span>{isLogin ? "Sign in to workspace" : "Create account"}</span>
                <ArrowRight
                  size={17}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </>
            )}
          </button>
        </form>

        {/* Account switch */}
        <div className="mt-7 border-t border-[#edf0ee] pt-6 text-center">
          <p className="text-[13px] text-[#718078]">
            {isLogin ? "New to LinkLedger?" : "Already have an account?"}{" "}
            <Link
              href={isLogin ? "/register/advertiser" : "/login"}
              className="font-bold text-[#0e7a5a] transition-colors hover:text-[#0a6149] hover:underline"
            >
              {isLogin ? "Create an account" : "Sign in"}
            </Link>
          </p>

          {!isLogin && (
            <p className="mt-4 text-[12px] text-[#82918b]">
              {isAdvertiser
                ? "Want to list your websites instead?"
                : "Looking to purchase publishing services?"}{" "}
              <Link
                href={
                  isAdvertiser
                    ? "/register/publisher"
                    : "/register/advertiser"
                }
                className="font-semibold text-[#203d33] transition-colors hover:text-[#0e7a5a] hover:underline"
              >
                {isAdvertiser ? "Join as publisher" : "Join as advertiser"}
              </Link>
            </p>
          )}

          {isLogin && (
            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#9aa59f]">
              <ShieldCheck size={14} className="text-[#0e7a5a]" />
              <span>
                By signing in, you agree to LinkLedger&apos;s terms and privacy
                policy.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom decorative detail */}
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-[#eaf4ef] opacity-70 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 top-1/2 h-28 w-28 rounded-full bg-[#f0f7f3] opacity-60 blur-3xl" />
    </div>
  );
}
