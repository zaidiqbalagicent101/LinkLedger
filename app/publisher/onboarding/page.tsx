
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowLeft,
  ArrowRight,
  UserRound,
  ShieldCheck,
  Globe2,
  Building2,
  Sparkles,
  CircleCheck,
} from "lucide-react";

import { PublisherProfileForm } from "@/components/publisher/PublisherProfileForm";
import { PublisherAccountMenu } from "@/components/publisher/PublisherAccountMenu";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default function PublisherOnboardingPage() {
  return (
    <Suspense
      fallback={
        <main
          className="min-h-screen w-full animate-pulse bg-[#f6f8f7]"
          aria-busy="true"
        />
      }
    >
      <PublisherOnboardingContent />
    </Suspense>
  );
}

async function PublisherOnboardingContent() {
  await connection();

  const user = await requireRole("PUBLISHER");

  const profile = await prisma.publisherProfile.findUnique({
    where: { userId: user.id },
    select: {
      publisherName: true,
      businessName: true,
      country: true,
      contactNumber: true,
      description: true,
      profileImage: true,
    },
  });

  const isEditing = Boolean(profile);

  return (
    <main className="min-h-screen w-full bg-[#f6f8f7] text-[#12211c] antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#e5eae8] bg-white/80 backdrop-blur-md">
        <div className="flex h-[72px] w-full items-center justify-between px-6 sm:px-10 lg:px-14">
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

          <PublisherAccountMenu />
        </div>
      </header>

      {/* Main Content */}
      <section className="w-full px-6 py-8 sm:px-10 sm:py-10 lg:px-14">
        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-[13px] text-[#82918b]">
          <Link
            href="/publisher/dashboard"
            className="rounded-sm transition-colors hover:text-[#0e7a5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
          >
            Dashboard
          </Link>
          <span className="text-[#c1cbc6]">/</span>
          <span className="font-medium text-[#12211c]">
            Publisher profile
          </span>
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0b2e24] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] bg-[length:22px_22px] px-7 py-9 text-white sm:px-10 sm:py-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 -top-24 size-64 rounded-full bg-[#0e7a5a]/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -bottom-32 size-72 rounded-full bg-emerald-400/10 blur-3xl"
          />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="min-w-0 max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                <UserRound size={14} />
                Publisher workspace
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                {isEditing ? "Manage your account" : "Get started"}
              </p>

              <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.035em] sm:text-[46px]">
                {isEditing
                  ? "Your publisher profile"
                  : "Build your publisher presence"}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-emerald-50/75 sm:text-[15px]">
                {isEditing
                  ? "Keep your publisher information accurate and up to date. A well-maintained profile helps advertisers understand your publication and partnership opportunities."
                  : "Introduce your publication, showcase your business and tell advertisers about the audience you reach. Complete your profile to establish your publisher presence on LinkLedger."}
              </p>
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-3 sm:min-w-[340px]">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-emerald-200">
                  <Globe2 size={18} />
                </span>
                <p className="mt-4 text-xs text-emerald-100/70">
                  Your publication
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {isEditing ? "Manage details" : "Get discovered"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-emerald-200">
                  <ShieldCheck size={18} />
                </span>
                <p className="mt-4 text-xs text-emerald-100/70">
                  Profile status
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {isEditing ? "Existing profile" : "Setup required"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Information Notice */}
        <div className="mt-5 flex items-start gap-4 rounded-2xl border border-[#dcebe3] bg-[#edf6f1] px-5 py-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#0e7a5a]">
            <ShieldCheck size={19} />
          </span>

          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#203d33]">
              {isEditing
                ? "Keep your publisher profile up to date"
                : "Make a strong first impression"}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#5f6f69]">
              Accurate publisher details help advertisers understand your
              publication, evaluate your audience and make better partnership
              decisions.
            </p>
          </div>
        </div>

        {/* Profile Overview */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <InfoCard
            icon={<UserRound size={18} />}
            title="Publisher identity"
            description="Your public publisher name and profile information."
          />

          <InfoCard
            icon={<Building2 size={18} />}
            title="Business details"
            description="Your business identity and contact information."
          />

          <InfoCard
            icon={<Globe2 size={18} />}
            title="Publication presence"
            description="Tell advertisers about your publication and audience."
          />
        </div>

        {/* Form Layout */}
        <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          {/* Main Form Card */}
          <section className="min-w-0 rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)] sm:p-8">
            <div className="mb-7 flex flex-col justify-between gap-4 border-b border-[#eef2f0] pb-6 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
                  <UserRound size={19} />
                </span>

                <div>
                  <h2 className="text-[18px] font-semibold text-[#12211c]">
                    Profile information
                  </h2>
                  <p className="mt-1 text-sm text-[#82918b]">
                    {isEditing
                      ? "Update your publisher account details."
                      : "Enter your details to set up your publisher account."}
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#dcebe3] bg-[#eaf5ef] px-3 py-1.5 text-xs font-semibold text-[#0a6149]">
                {isEditing ? (
                  <>
                    <CircleCheck size={13} />
                    Existing profile
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    New profile
                  </>
                )}
              </span>
            </div>

            <PublisherProfileForm profile={profile} />
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)]">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
                  <ShieldCheck size={18} />
                </span>
                <h3 className="text-sm font-semibold text-[#12211c]">
                  Profile checklist
                </h3>
              </div>

              <p className="mt-4 text-[13px] leading-relaxed text-[#5f6f69]">
                Make sure your information accurately represents your
                publication and business.
              </p>

              <div className="mt-5 space-y-4">
                <ChecklistItem label="Publisher name" />
                <ChecklistItem label="Business information" />
                <ChecklistItem label="Contact details" />
                <ChecklistItem label="Publisher description" />
                <ChecklistItem label="Profile image" />
              </div>
            </div>

            <div className="rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)]">
              <span className="grid size-10 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
                <Globe2 size={18} />
              </span>

              <h3 className="mt-4 text-sm font-semibold text-[#12211c]">
                Why your profile matters
              </h3>

              <p className="mt-2 text-[13px] leading-relaxed text-[#5f6f69]">
                Advertisers use publisher information to understand your
                business, publication niche and potential audience before
                choosing a partnership.
              </p>
            </div>

            <Link
              href="/publisher/dashboard"
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#dcebe3] bg-[#eaf5ef] px-4 text-sm font-semibold text-[#0a6149] transition-colors hover:bg-[#dcefe4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
            >
              <ArrowLeft size={15} />
              Back to dashboard
            </Link>
          </aside>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-6 border-t border-[#e5eae8] bg-white">
        <div className="flex w-full flex-col justify-between gap-3 px-6 py-6 text-[13px] text-[#82918b] sm:flex-row sm:items-center sm:px-10 lg:px-14">
          <span>© 2026 LinkLedger</span>

          <Link
            href="/publisher/dashboard"
            className="inline-flex items-center gap-1 font-medium transition-colors hover:text-[#0e7a5a]"
          >
            Publisher dashboard
            <ArrowRight size={13} />
          </Link>
        </div>
      </footer>
    </main>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-4 rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-25px_rgba(14,122,90,0.2)]">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
        {icon}
      </span>

      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-[#12211c]">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#82918b]">
          {description}
        </p>
      </div>
    </div>
  );
}

function ChecklistItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[13px] text-[#5f6f69]">
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#eaf5ef] text-[#0e7a5a]">
        <CircleCheck size={13} />
      </span>
      {label}
    </div>
  );
}
