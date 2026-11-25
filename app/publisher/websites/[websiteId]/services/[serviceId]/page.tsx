
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Globe2,
  CalendarDays,
  Clock3,
  FileText,
  Link2,
  CheckCircle2,
  ShieldCheck,
  Wallet,
  Archive,
} from "lucide-react";
import { notFound } from "next/navigation";

import { PublisherAccountMenu } from "@/components/publisher/PublisherAccountMenu";
import { PublisherServiceControls } from "@/components/publisher/PublisherServiceControls";
import {
  formatServiceLinkType,
  formatServiceType,
} from "@/components/publisher/service-options";
import { requirePublisherProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ServiceDetailsPageProps = {
  params: Promise<{ websiteId: string; serviceId: string }>;
};

export default async function PublisherServiceDetailsPage({
  params,
}: ServiceDetailsPageProps) {
  await connection();

  const user = await requirePublisherProfile();
  const { websiteId, serviceId } = await params;

  const service = await prisma.publisherService.findFirst({
    where: {
      id: serviceId,
      publisherWebsiteId: websiteId,
      website: {
        publisherProfile: {
          userId: user.id,
        },
      },
    },
    include: {
      website: {
        select: {
          websiteName: true,
          websiteUrl: true,
        },
      },
    },
  });

  if (!service) notFound();

  const archived = service.archivedAt !== null;

  const price = new Intl.NumberFormat("en", {
    style: "currency",
    currency: service.currency,
  }).format(Number(service.price));

  const statusLabel = archived
    ? "Archived"
    : service.isActive
      ? "Active"
      : "Inactive";

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
        {/* Back Navigation */}
        <Link
          href={`/publisher/websites/${websiteId}/services`}
          className="mb-5 inline-flex items-center gap-2 rounded-md text-[13px] font-medium text-[#82918b] transition-colors hover:text-[#0e7a5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
        >
          <ArrowLeft size={15} />
          All services
        </Link>

        {/* Hero */}
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
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                <Globe2 size={14} />
                Publisher service
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                {service.website.websiteName}
              </p>

              <h1 className="max-w-3xl break-words text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[46px]">
                {service.serviceName}
              </h1>

              <p className="mt-4 text-sm text-emerald-50/75 sm:text-[15px]">
                {formatServiceType(service.serviceType)}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    archived
                      ? "border-amber-200/20 bg-amber-300/10 text-amber-200"
                      : service.isActive
                        ? "border-emerald-200/20 bg-emerald-300/10 text-emerald-200"
                        : "border-white/15 bg-white/10 text-white/75"
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {statusLabel}
                </span>

                {archived && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/70">
                    <Archive size={12} />
                    Archived service
                  </span>
                )}
              </div>
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-3 sm:min-w-[360px]">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-emerald-200">
                  <Wallet size={18} />
                </span>
                <p className="mt-4 text-xs text-emerald-100/70">
                  Service price
                </p>
                <p className="mt-1 break-words text-2xl font-semibold tabular-nums">
                  {price}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-emerald-200">
                  <Clock3 size={18} />
                </span>
                <p className="mt-4 text-xs text-emerald-100/70">
                  Delivery time
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {service.deliveryTimeDays} days
                </p>
              </div>

              <div className="col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
                <div>
                  <p className="text-xs text-emerald-100/70">
                    Published on
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {service.website.websiteName}
                  </p>
                </div>

                <a
                  href={service.website.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200 transition-colors hover:text-white"
                >
                  Visit website
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Archived Notice */}
        {archived && (
          <div className="mt-5 flex items-start gap-4 rounded-2xl border border-[#f0dfc8] bg-[#fff7ed] px-5 py-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#a16b2f]">
              <Archive size={18} />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[#704b25]">
                This service has been archived
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#896b49]">
                This service is archived and is displayed here for your
                reference.
              </p>
            </div>
          </div>
        )}

        {/* Active Service Notice */}
        {!archived && (
          <div className="mt-5 flex items-center gap-4 rounded-2xl border border-[#dcebe3] bg-[#edf6f1] px-5 py-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#0e7a5a]">
              <ShieldCheck size={19} />
            </span>

            <div>
              <p className="text-[13px] font-semibold text-[#203d33]">
                Manage your service listing
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-[#5f6f69]">
                Keep your pricing, delivery time and publishing requirements
                accurate for advertisers.
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<Wallet size={18} />}
            label="Service price"
            value={price}
            description="Your listed service price"
          />

          <SummaryCard
            icon={<CalendarDays size={18} />}
            label="Delivery time"
            value={`${service.deliveryTimeDays} days`}
            description="Expected delivery period"
          />

          <SummaryCard
            icon={<Link2 size={18} />}
            label="Maximum links"
            value={String(service.maximumLinks ?? "N/A")}
            description="Links included per order"
          />

          <SummaryCard
            icon={<FileText size={18} />}
            label="Content writing"
            value={
              service.contentWritingIncluded ? "Included" : "Not included"
            }
            description="Content writing availability"
          />
        </div>

        {/* Main Details */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {/* Service Configuration */}
          <section className="min-w-0 rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)] sm:p-6">
            <SectionHeading
              icon={<ShieldCheck size={18} />}
              title="Service configuration"
              description="The commercial terms and options included in this service."
            />

            <dl className="mt-6 grid gap-x-6 gap-y-6 sm:grid-cols-2">
              <Detail label="Delivery time">
                {service.deliveryTimeDays} day
                {service.deliveryTimeDays === 1 ? "" : "s"}
              </Detail>

              <Detail label="Content writing">
                {service.contentWritingIncluded
                  ? "Included"
                  : "Not included"}
              </Detail>

              <Detail label="Link type">
                {formatServiceLinkType(service.linkType)}
              </Detail>

              <Detail label="Maximum links">
                {service.maximumLinks ?? "Not applicable"}
              </Detail>

              <Detail label="Homepage link">
                {service.homepageLinkAvailable
                  ? "Available"
                  : "Not available"}
              </Detail>

              <Detail label="Created">
                {service.createdAt.toLocaleDateString()}
              </Detail>

              {service.archivedAt && (
                <Detail label="Archived">
                  {service.archivedAt.toLocaleDateString()}
                </Detail>
              )}
            </dl>
          </section>

          {/* Website Information */}
          <section className="min-w-0 rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)] sm:p-6">
            <SectionHeading
              icon={<Globe2 size={18} />}
              title="Website information"
              description="The website where this service is offered."
            />

            <dl className="mt-6 grid gap-6">
              <Detail label="Website name">
                {service.website.websiteName}
              </Detail>

              <Detail label="Website URL">
                <a
                  href={service.website.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-full items-center gap-1.5 break-all text-[#286d5d] transition-colors hover:text-[#0a6149]"
                >
                  {service.website.websiteUrl}
                  <ExternalLink size={13} className="shrink-0" />
                </a>
              </Detail>
            </dl>
          </section>

          {/* Description */}
          <section className="min-w-0 rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)] sm:col-span-2 sm:p-6">
            <SectionHeading
              icon={<FileText size={18} />}
              title="Service description"
              description="Details about the service presented to potential advertisers."
            />

            <div className="mt-6 rounded-xl bg-[#f6f8f7] p-5">
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#40574e]">
                {service.description}
              </p>
            </div>
          </section>

          {/* Publishing Guidelines */}
          <section className="min-w-0 rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)] sm:p-6">
            <SectionHeading
              icon={<CheckCircle2 size={18} />}
              title="Publishing guidelines"
              description="Requirements for publishing content on your website."
            />

            <div className="mt-6">
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#40574e]">
                {service.publishingGuidelines || "Not provided"}
              </p>
            </div>
          </section>

          {/* Additional Conditions */}
          <section className="min-w-0 rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)] sm:p-6">
            <SectionHeading
              icon={<FileText size={18} />}
              title="Additional conditions"
              description="Any other terms associated with this service."
            />

            <div className="mt-6">
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#40574e]">
                {service.additionalConditions || "None"}
              </p>
            </div>
          </section>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-[#e5eae8] bg-white p-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="text-sm font-semibold text-[#12211c]">
              Manage your publisher services
            </p>
            <p className="mt-1 text-xs text-[#82918b]">
              Return to your services or update this listing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/publisher/websites/${websiteId}/services`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#dce5df] bg-white px-4 text-sm font-semibold text-[#40574e] transition-colors hover:bg-[#f3f8f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
            >
              <ArrowLeft size={15} />
              All services
            </Link>

            {!archived && (
              <>
                <Link
                  href={`/publisher/websites/${websiteId}/services/${serviceId}/edit`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0e7a5a] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0a6149] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
                >
                  Edit service
                  <ArrowRight size={15} />
                </Link>

                <PublisherServiceControls
                  websiteId={websiteId}
                  serviceId={serviceId}
                  isActive={service.isActive}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-[#eef2f0] pb-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
        {icon}
      </span>

      <div className="min-w-0">
        <h2 className="text-[16px] font-semibold text-[#12211c]">
          {title}
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed text-[#82918b]">
          {description}
        </p>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-25px_rgba(14,122,90,0.2)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-[#5f6f69]">{label}</p>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
          {icon}
        </span>
      </div>

      <p className="mt-4 break-words text-xl font-bold tracking-tight text-[#12211c]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#82918b]">{description}</p>
    </div>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-[#82918b]">{label}</dt>
      <dd className="mt-1.5 whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-[#203d33]">
        {children}
      </dd>
    </div>
  );
}
