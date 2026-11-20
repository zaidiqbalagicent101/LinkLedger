
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowLeft,
  ArrowRight,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import { PublisherProfileForm } from "@/components/publisher/PublisherProfileForm";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default function PublisherOnboardingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen animate-pulse bg-[#f6f8f7]" />
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

          <Link
            href="/publisher/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5f6f69] transition-colors hover:text-[#0e7a5a]"
          >
            <ArrowLeft size={16} />
            Publisher dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <section className="mx-auto w-[calc(100%-40px)] max-w-[720px] py-10 sm:py-14">

        {/* Breadcrumb */}
        <div className="mb-7 flex items-center gap-2 text-[13px] text-[#82918b]">
          <Link
            href="/publisher/dashboard"
            className="transition-colors hover:text-[#0e7a5a]"
          >
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-medium text-[#12211c]">
            Publisher profile
          </span>
        </div>

        {/* Page Heading */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#dcebe3] bg-[#eaf5ef] px-3 py-1.5 text-xs font-semibold text-[#0a6149]">
            <UserRound size={14} />
            Publisher setup
          </div>

          <h1 className="text-[30px] font-semibold tracking-[-1px] sm:text-[38px]">
            {isEditing
              ? "Update your profile"
              : "Complete your publisher profile"}
          </h1>

          <p className="mt-3 max-w-[590px] text-[15px] leading-relaxed text-[#5f6f69] sm:text-[16px]">
            Tell advertisers about your publication, your business and the
            audience you reach. You can update these details at any time.
          </p>
        </div>

        {/* Profile Information Notice */}
        <div className="mb-7 flex gap-3 rounded-xl border border-[#dcebe3] bg-[#edf6f1] p-4">
          <div className="mt-0.5 shrink-0 text-[#0e7a5a]">
            <ShieldCheck size={19} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#12211c]">
              Build a complete publisher profile
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#5f6f69]">
              Accurate profile information helps advertisers understand your
              publication and make better partnership decisions.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-[#e5eae8] bg-white p-5 shadow-[0_8px_30px_-25px_rgba(18,33,28,0.2)] sm:p-8">
          <div className="mb-7 border-b border-[#e5eae8] pb-5">
            <h2 className="text-[18px] font-semibold">
              Profile information
            </h2>

            <p className="mt-1.5 text-sm text-[#5f6f69]">
              {isEditing
                ? "Keep your publisher details up to date."
                : "Add your details to set up your publisher account."}
            </p>
          </div>

          <PublisherProfileForm profile={profile} />
        </div>

        {/* Back Link */}
        <Link
          href="/publisher/dashboard"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#5f6f69] transition-colors hover:text-[#0e7a5a]"
        >
          <ArrowLeft size={15} />
          Back to dashboard
        </Link>

      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-[#e5eae8] bg-white">
        <div className="mx-auto flex w-[calc(100%-40px)] max-w-[1040px] flex-col justify-between gap-2 py-6 text-[13px] text-[#82918b] sm:flex-row">
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
