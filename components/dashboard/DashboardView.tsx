
import Link from "next/link";
import { ArrowRight, ArrowUpRight, LogOut, Globe2, UserRound, CheckCircle2, Inbox } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";
import type { AuthenticatedUser } from "@/lib/auth";

export function DashboardView({ user }: { user: AuthenticatedUser }) {
  const roleName = user.role === "ADVERTISER" ? "Advertiser" : "Publisher";
  const firstName = user.fullName.split(" ")[0];
  const isPublisher = user.role === "PUBLISHER";

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#12211c] antialiased">

      {/* Header */}
      <header className="border-b border-[#e5eae8] bg-white">
        <div className="mx-auto flex h-[72px] w-[calc(100%-40px)] max-w-[1040px] items-center justify-between">

          <Link
            href="/"
            aria-label="LinkLedger home"
            className="inline-flex items-center gap-2.5 text-[19px] font-bold tracking-tight"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-[#0e7a5a] text-[17px] text-white">
              L
            </span>
            LinkLedger
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-[#5f6f69] sm:block">
              {user.email}
            </span>

            <form action={logoutAction}>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#e5eae8] bg-white px-3.5 text-sm font-semibold text-[#12211c] transition-colors hover:border-[#c3d3cc] hover:bg-[#f6f8f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
                type="submit"
                title="Sign out"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="mx-auto w-[calc(100%-40px)] max-w-[1040px] py-12 sm:py-16">

        {/* Welcome */}
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#dcebe3] bg-[#eaf5ef] px-3 py-1.5 text-xs font-semibold text-[#0a6149]">
            <span className="size-1.5 rounded-full bg-[#0e7a5a]" />
            {roleName} workspace
          </div>

          <h1 className="text-[36px] font-semibold tracking-[-1.3px] sm:text-[44px]">
            Welcome, {firstName}.
          </h1>

          <p className="mt-3 text-[16px] leading-relaxed text-[#5f6f69]">
            Your LinkLedger {roleName.toLowerCase()} account is ready.
            Let&apos;s get things moving.
          </p>
        </div>

        {/* Account Status */}
        <div className="mt-9 flex flex-col justify-between gap-5 rounded-xl border border-[#e5eae8] bg-white p-5 shadow-[0_8px_30px_-25px_rgba(18,33,28,0.2)] sm:flex-row sm:items-center sm:p-6">

          <div className="flex items-center gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
              <CheckCircle2 size={23} />
            </div>

            <div>
              <h2 className="text-[15px] font-semibold">
                Account active
              </h2>
              <p className="mt-1 text-sm text-[#5f6f69]">
                Your account is ready to use.
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#eaf5ef] px-3 py-2 text-xs font-semibold text-[#0a6149]">
            <span className="size-2 rounded-full bg-[#0e7a5a]" />
            Active
            <ArrowUpRight size={15} />
          </div>
        </div>

        {/* Workspace Actions */}
        <div className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-semibold tracking-tight">
              Your workspace
            </h2>
            <p className="mt-1.5 text-sm text-[#5f6f69]">
              Manage your LinkLedger account and get started.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            {isPublisher ? (
              <>
                <Link
                  href="/publisher/websites"
                  className="group rounded-xl border border-[#e5eae8] bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b8d9cb] hover:shadow-[0_12px_28px_-20px_rgba(18,33,28,0.3)]"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
                      <Globe2 size={21} />
                    </span>
                    <ArrowUpRight
                      size={19}
                      className="text-[#82918b] transition-colors group-hover:text-[#0e7a5a]"
                    />
                  </div>

                  <h3 className="mt-5 text-[17px] font-semibold">
                    My websites
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-[#5f6f69]">
                    Add, manage and update your publisher websites.
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0e7a5a]">
                    Manage websites
                    <ArrowRight size={15} />
                  </span>
                </Link>

                <Link
                  href="/publisher/onboarding"
                  className="group rounded-xl border border-[#e5eae8] bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b8d9cb] hover:shadow-[0_12px_28px_-20px_rgba(18,33,28,0.3)]"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
                      <UserRound size={21} />
                    </span>
                    <ArrowUpRight
                      size={19}
                      className="text-[#82918b] transition-colors group-hover:text-[#0e7a5a]"
                    />
                  </div>

                  <h3 className="mt-5 text-[17px] font-semibold">
                    Edit profile
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-[#5f6f69]">
                    Keep your publisher profile and business details up to date.
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0e7a5a]">
                    Update profile
                    <ArrowRight size={15} />
                  </span>
                </Link>

                <Link
                  href="/publisher/requests"
                  className="group rounded-xl border border-[#e5eae8] bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b8d9cb] hover:shadow-[0_12px_28px_-20px_rgba(18,33,28,0.3)]"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]"><Inbox size={21} /></span>
                    <ArrowUpRight size={19} className="text-[#82918b] transition-colors group-hover:text-[#0e7a5a]" />
                  </div>
                  <h3 className="mt-5 text-[17px] font-semibold">Incoming requests</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5f6f69]">Review advertiser briefs and respond to proposals.</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0e7a5a]">Open requests<ArrowRight size={15} /></span>
                </Link>
              </>
            ) : (
              <div className="rounded-xl border border-[#e5eae8] bg-white p-6 sm:col-span-2">
                <div className="grid size-11 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
                  <Globe2 size={21} />
                </div>

                <h3 className="mt-5 text-[17px] font-semibold">
                  Your advertiser workspace
                </h3>

                <p className="mt-2 max-w-[520px] text-sm leading-relaxed text-[#5f6f69]">
                  Your account is ready. You&apos;ll be able to discover publishers,
                  compare websites and manage your sponsored content orders here.
                </p>
                <Link
                  href="/advertiser/marketplace"
                  className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0e7a5a] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0a6149]"
                >
                  Browse marketplace
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/advertiser/requests"
                  className="ml-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#0e7a5a] hover:text-[#0a6149]"
                >
                  My requests
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}

          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5eae8] bg-white">
        <div className="mx-auto flex w-[calc(100%-40px)] max-w-[1040px] flex-col justify-between gap-2 py-6 text-[13px] text-[#82918b] sm:flex-row">
          <span>Signed in as {user.email}</span>
          <span>© 2026 LinkLedger · {roleName}</span>
        </div>
      </footer>

    </main>
  );
}
