
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  ShieldCheck,
  Globe2,
  Wallet,
  FileText,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { notFound } from "next/navigation";

import { PublisherServiceForm } from "@/components/publisher/PublisherServiceForm";
import { PublisherAccountMenu } from "@/components/publisher/PublisherAccountMenu";
import { requirePublisherProfile } from "@/lib/auth";
import { getCurrencyOptions } from "@/lib/currency-options";
import { prisma } from "@/lib/prisma";

type AddServicePageProps = {
  params: Promise<{ websiteId: string }>;
};

export default async function AddWebsiteServicePage({
  params,
}: AddServicePageProps) {
  await connection();

  const user = await requirePublisherProfile();
  const { websiteId } = await params;

  const website = await prisma.publisherWebsite.findFirst({
    where: {
      id: websiteId,
      publisherProfile: { userId: user.id },
    },
    select: {
      id: true,
      websiteName: true,
    },
  });

  if (!website) notFound();

  const currencyOptions = getCurrencyOptions();
  const servicesUrl = `/publisher/websites/${website.id}/services`;

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
        <div className="mb-5 flex flex-wrap items-center gap-2 text-[13px] text-[#82918b]">
          <Link
            href={`/publisher/websites/${website.id}`}
            className="rounded-sm transition-colors hover:text-[#0e7a5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
          >
            My websites
          </Link>

          <span className="text-[#c1cbc6]">/</span>

          <Link
            href={servicesUrl}
            className="rounded-sm transition-colors hover:text-[#0e7a5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
          >
            Services &amp; pricing
          </Link>

          <span className="text-[#c1cbc6]">/</span>

          <span className="font-medium text-[#12211c]">
            Add service
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

          <div className="relative flex flex-col justify-between gap-8 xl:flex-row xl:items-center">
            <div className="min-w-0 max-w-3xl">
              <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                <BriefcaseBusiness size={14} className="shrink-0" />
                <span className="truncate">{website.websiteName}</span>
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Services &amp; pricing
              </p>

              <h1 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[46px]">
                Create a new service
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-emerald-50/75 sm:text-[15px]">
                Create a named offer with clear pricing and publishing terms.
                Give advertisers a straightforward understanding of what your
                publication offers.
              </p>
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-3 sm:min-w-[340px]">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-emerald-200">
                  <Globe2 size={18} />
                </span>

                <p className="mt-4 text-xs text-emerald-100/70">
                  Website
                </p>

                <p className="mt-1 break-words text-lg font-semibold">
                  {website.websiteName}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-emerald-200">
                  <Sparkles size={18} />
                </span>

                <p className="mt-4 text-xs text-emerald-100/70">
                  New listing
                </p>

                <p className="mt-1 text-lg font-semibold">
                  Add service
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

          <div>
            <p className="text-[13px] font-semibold text-[#203d33]">
              Keep your offers clear and transparent
            </p>

            <p className="mt-1 text-[12px] leading-relaxed text-[#5f6f69]">
              Provide accurate pricing, delivery timelines and publishing
              terms so advertisers can understand exactly what each service
              includes.
            </p>
          </div>
        </div>

        {/* Service Overview Cards */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <InfoCard
            icon={<Wallet size={18} />}
            title="Set your pricing"
            description="Define a clear price and choose the currency for your offer."
          />

          <InfoCard
            icon={<FileText size={18} />}
            title="Define service terms"
            description="Specify content requirements, link options and publishing guidelines."
          />

          <InfoCard
            icon={<Globe2 size={18} />}
            title="Showcase your offer"
            description="Help advertisers understand what your website can provide."
          />
        </div>

        {/* Form and Sidebar */}
        <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          {/* Main Form */}
          <section className="min-w-0 rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)] sm:p-8">
            <div className="mb-7 flex flex-col justify-between gap-4 border-b border-[#eef2f0] pb-6 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
                  <BriefcaseBusiness size={19} />
                </span>

                <div>
                  <h2 className="text-[18px] font-semibold text-[#12211c]">
                    Service information
                  </h2>

                  <p className="mt-1 text-sm text-[#82918b]">
                    Enter the offer details, pricing and publishing terms.
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#dcebe3] bg-[#eaf5ef] px-3 py-1.5 text-xs font-semibold text-[#0a6149]">
                <Sparkles size={13} />
                New service
              </span>
            </div>

            <PublisherServiceForm
              websiteId={website.id}
              currencyOptions={currencyOptions}
            />
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)]">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
                  <ShieldCheck size={18} />
                </span>

                <h3 className="text-sm font-semibold text-[#12211c]">
                  Before you publish
                </h3>
              </div>

              <p className="mt-4 text-[13px] leading-relaxed text-[#5f6f69]">
                Review these important details when creating your service
                listing.
              </p>

              <div className="mt-5 space-y-4">
                <ChecklistItem label="Use a clear service name" />
                <ChecklistItem label="Set accurate pricing" />
                <ChecklistItem label="Define delivery time" />
                <ChecklistItem label="Specify link options" />
                <ChecklistItem label="Add publishing guidelines" />
              </div>
            </div>

            <div className="rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)]">
              <span className="grid size-10 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
                <Globe2 size={18} />
              </span>

              <h3 className="mt-4 text-sm font-semibold text-[#12211c]">
                Multiple service offers
              </h3>

              <p className="mt-2 text-[13px] leading-relaxed text-[#5f6f69]">
                You can create multiple offers for the same website, each
                with its own pricing, delivery time and publishing terms.
              </p>
            </div>

            <Link
              href={servicesUrl}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#dcebe3] bg-[#eaf5ef] px-4 text-sm font-semibold text-[#0a6149] transition-colors hover:bg-[#dcefe4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
            >
              <ArrowLeft size={15} />
              Back to services
            </Link>
          </aside>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-[#e5eae8] bg-white p-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="text-sm font-semibold text-[#12211c]">
              Managing another website?
            </p>

            <p className="mt-1 text-xs text-[#82918b]">
              Return to your website services to manage your other offers.
            </p>
          </div>

          <Link
            href={servicesUrl}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0e7a5a] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0a6149] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
          >
            All services
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-6 border-t border-[#e5eae8] bg-white">
        <div className="flex w-full flex-col justify-between gap-3 px-6 py-6 text-[13px] text-[#82918b] sm:flex-row sm:items-center sm:px-10 lg:px-14">
          <span>© 2026 LinkLedger</span>

          <Link
            href={servicesUrl}
            className="inline-flex items-center gap-1 font-medium transition-colors hover:text-[#0e7a5a]"
          >
            Services &amp; pricing
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
        <h3 className="text-sm font-semibold text-[#12211c]">
          {title}
        </h3>

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
        <CheckCircle2 size={13} />
      </span>
      {label}
    </div>
  );
}
