"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
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
  const registrationTitle = role === "advertiser" ? "Create your advertiser account" : "Create your publisher account";

  return (
    <div className="auth-form-wrap">
      <div className="auth-form-heading">
        <Link className="back-link" href="/">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <p className="eyebrow">{isLogin ? "Welcome back" : `Join as ${role}`}</p>
        <h2>{isLogin ? "Sign in to LinkLedger" : registrationTitle}</h2>
        <p className="auth-form-heading__copy">
          {isLogin
            ? "Enter your details to continue to your workspace."
            : "A few details to get your account started."}
        </p>
      </div>

      {notice && <p className="form-notice" role="status">{notice}</p>}
      {state?.message && <p className="form-error form-error--summary" role="alert">{state.message}</p>}

      <form className="auth-form" action={formAction}>
        {!isLogin && (
          <div className="field-row">
            <label className="field">
              <span>Full name</span>
              <input
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                required
                aria-invalid={Boolean(state?.errors?.fullName)}
                aria-describedby={state?.errors?.fullName ? "fullName-error" : undefined}
              />
              {state?.errors?.fullName && <span id="fullName-error" className="form-error">{state.errors.fullName}</span>}
            </label>
            <label className="field">
              <span>Country</span>
              <input
                name="country"
                type="text"
                autoComplete="country-name"
                placeholder="Your country"
                required
                aria-invalid={Boolean(state?.errors?.country)}
                aria-describedby={state?.errors?.country ? "country-error" : undefined}
              />
              {state?.errors?.country && <span id="country-error" className="form-error">{state.errors.country}</span>}
            </label>
          </div>
        )}

        <label className="field">
          <span>Email address</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            required
            aria-invalid={Boolean(state?.errors?.email)}
            aria-describedby={state?.errors?.email ? "email-error" : undefined}
          />
          {state?.errors?.email && <span id="email-error" className="form-error">{state.errors.email}</span>}
        </label>

        <label className="field">
          <span>Password</span>
          <span className="password-field">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder={isLogin ? "Enter your password" : "At least 8 characters"}
              required
              aria-invalid={Boolean(state?.errors?.password)}
              aria-describedby={state?.errors?.password ? "password-error" : undefined}
            />
            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
          {state?.errors?.password && <span id="password-error" className="form-error">{state.errors.password}</span>}
        </label>

        {!isLogin && (
          <label className="field">
            <span>Confirm password</span>
            <span className="password-field">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                required
                aria-invalid={Boolean(state?.errors?.confirmPassword)}
                aria-describedby={state?.errors?.confirmPassword ? "confirmPassword-error" : undefined}
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
            {state?.errors?.confirmPassword && <span id="confirmPassword-error" className="form-error">{state.errors.confirmPassword}</span>}
          </label>
        )}

        {isLogin ? (
          <div className="form-options">
            <label className="check-field">
              <input name="rememberMe" type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link href="/login?notice=Password%20reset%20is%20not%20available%20yet." className="text-link">
              Forgot password?
            </Link>
          </div>
        ) : (
          <label className="check-field terms-field">
            <input name="terms" type="checkbox" required aria-invalid={Boolean(state?.errors?.terms)} />
            <span>I accept the <a href="#terms">Terms &amp; Conditions</a></span>
            {state?.errors?.terms && <span className="form-error">{state.errors.terms}</span>}
          </label>
        )}

        <button className="primary-button" type="submit" disabled={pending}>
          {pending ? <LoaderCircle className="spinner" size={18} /> : null}
          <span>{pending ? "Please wait..." : isLogin ? "Sign in" : "Create account"}</span>
          {!pending && <ArrowRight size={17} />}
        </button>
      </form>

      <p className="auth-switch">
        {isLogin ? "New to LinkLedger?" : "Already have an account?"}{" "}
        <Link href={isLogin ? "/register/advertiser" : "/login"}>
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>

      {!isLogin && (
        <p className="role-switch">
          {role === "advertiser" ? "Are you a publisher?" : "Are you an advertiser?"}{" "}
          <Link href={role === "advertiser" ? "/register/publisher" : "/register/advertiser"}>
            Sign up here
          </Link>
        </p>
      )}
      {isLogin && <p className="form-footnote">By signing in, you agree to LinkLedger&apos;s terms and privacy policy.</p>}
    </div>
  );
}