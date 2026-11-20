
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { connection } from "next/server";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Globe2,
  Users,
  Languages,
  MapPin,
  ShieldCheck,
  Clock3,
  PenLine,
  Link2,
  House,
  FileText,
} from "lucide-react";
import { notFound } from "next/navigation";
import { BuyNowButton } from "@/components/advertiser/BuyNowButton";
import {
  formatServiceLinkType,
  formatServiceType,
} from "@/components/publisher/service-options";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type WebsitePageProps = {
  params: Promise<{ websiteId: string }>;
};

export default function MarketplaceWebsitePage({ params }: WebsitePageProps) {
  return (
    <Suspense fallback={<main className="min-h-screen animate-pulse bg-[#f6f8f7]" />}>
      <MarketplaceWebsiteDetails
        params={params}
      />
    </Suspense>
  );
}

async function MarketplaceWebsiteDetails({
  params,
}: WebsitePageProps) {
  await connection();
  await requireRole("ADVERTISER");

  const { websiteId } = await params;

  const website = await prisma.publisherWebsite.findFirst({
    where: {
      id: websiteId,
      approvalStatus: "APPROVED",
      services: {
        some: { isActive: true, archivedAt: null },
      },
    },
    select: {
      id: true,
      websiteName: true,
      websiteUrl: true,
      websiteNiche: true,
      monthlyTraffic: true,
      websiteLanguage: true,
      targetAudienceCountry: true,
      websiteDescription: true,
      websiteLogo: true,
      domainRating: true,
      domainAuthority: true,
      metricsVerified: true,
      services: {
        where: { isActive: true, archivedAt: null },
        orderBy: [{ serviceType: "asc" }, { price: "asc" }],
        select: {
          id: true,
          serviceName: true,
          serviceType: true,
          price: true,
          currency: true,
          deliveryTimeDays: true,
          contentWritingIncluded: true,
          linkType: true,
          maximumLinks: true,
          homepageLinkAvailable: true,
          description: true,
          publishingGuidelines: true,
          additionalConditions: true,
        },
      },
    },
  });

  if (!website) notFound();

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#12211c] antialiased">

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#e5eae8] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] w-[calc(100%-40px)] max-w-[1040px] items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-[19px] font-bold tracking-tight"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-[#0e7a5a] text-[17px] text-white">
              L
            </span>
            LinkLedger
          </Link>

          <nav className="flex items-center gap-4 sm:gap-7">
            <Link
              href="/advertiser/marketplace"
              className="text-sm font-semibold text-[#0e7a5a]"
            >
              Marketplace
            </Link>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <section className="mx-auto w-[calc(100%-40px)] max-w-[1040px] py-9 sm:py-12">

        {/* Breadcrumb */}
        <Link
          href="/advertiser/marketplace"
          className="mb-7 inline-flex items-center gap-2 text-[13px] font-medium text-[#82918b] transition-colors hover:text-[#0e7a5a]"
        >
          <ArrowLeft size={15} />
          Publisher marketplace
        </Link>

        {/* Website Overview */}
        <div className="rounded-xl border border-[#e5eae8] bg-white p-5 shadow-[0_8px_30px_-25px_rgba(18,33,28,0.2)] sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="flex min-w-0 items-start gap-4">
              {website.websiteLogo ? (
                <Image
                  src={website.websiteLogo}
                  alt=""
                  width={68}
                  height={68}
                  unoptimized
                  className="size-[68px] shrink-0 rounded-xl border border-[#e5eae8] bg-white object-contain p-2"
                />
              ) : (
                <div className="grid size-[68px] shrink-0 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
                  <Globe2 size={30} />
                </div>
              )}

              <div className="min-w-0">
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#dcebe3] bg-[#eaf5ef] px-2.5 py-1 text-[11px] font-semibold text-[#0a6149]">
                  <CheckCircle2 size={13} />
                  Approved publisher website
                </span>

                <h1 className="break-words text-[28px] font-semibold tracking-[-1px] sm:text-[36px]">
                  {website.websiteName}
                </h1>

                <a
                  href={website.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex max-w-full items-center gap-1 break-all text-sm font-semibold text-[#0e7a5a] hover:text-[#0a6149]"
                >
                  {website.websiteUrl}
                  <ArrowUpRight size={14} className="shrink-0" />
                </a>
              </div>
            </div>

            <a
              href={website.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#e5eae8] px-4 text-sm font-semibold text-[#12211c] transition-colors hover:border-[#b8d9cb] hover:bg-[#f6f8f7]"
            >
              Visit website
              <ArrowUpRight size={15} />
            </a>
          </div>

          <div className="mt-8 grid gap-4 border-t border-[#edf1ee] pt-6 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
                <Users size={20} />
              </div>
              <div>
                <p className="text-xs text-[#82918b]">Monthly traffic</p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums">
                  {website.monthlyTraffic.toLocaleString()}
                  <span className="ml-1 text-xs font-medium text-[#82918b]">
                    visits
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs text-[#82918b]">Traffic information</p>
                <p className="mt-0.5 text-sm font-semibold">
                  {website.metricsVerified ? "Verified metrics" : "Publisher reported"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Website Details */}
        <div className="mt-10">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[1.2px] text-[#0a6149]">
              Publication profile
            </p>
            <h2 className="mt-2 text-[23px] font-semibold tracking-tight">
              Website details
            </h2>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Niche", value: website.websiteNiche, icon: Globe2 },
              { label: "Language", value: website.websiteLanguage, icon: Languages },
              { label: "Target audience", value: website.targetAudienceCountry, icon: MapPin },
              { label: "Domain Rating", value: website.domainRating ?? "Not provided", icon: ShieldCheck },
              { label: "Domain Authority", value: website.domainAuthority ?? "Not provided", icon: ShieldCheck },
            ].map((detail) => {
              const Icon = detail.icon;

              return (
                <div
                  key={detail.label}
                  className="rounded-xl border border-[#e5eae8] bg-white p-5"
                >
                  <dt className="flex items-center gap-2 text-xs font-medium text-[#82918b]">
                    <Icon size={16} />
                    {detail.label}
                  </dt>
                  <dd className="mt-3 break-words text-[15px] font-semibold text-[#12211c]">
                    {detail.value}
                  </dd>
                </div>
              );
            })}
          </dl>

          <div className="mt-3 rounded-xl border border-[#e5eae8] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <FileText size={17} className="text-[#0e7a5a]" />
              <h3 className="text-sm font-semibold">About this website</h3>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-[1.8] text-[#5f6f69]">
              {website.websiteDescription}
            </p>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-[#82918b]">
            Traffic and domain metrics are publisher-reported unless marked verified.
          </p>
        </div>

        {/* Active Services */}
        <div className="mt-12">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[1.2px] text-[#0a6149]">
                Available offers
              </p>
              <h2 className="mt-2 text-[24px] font-semibold tracking-tight">
                Active services
              </h2>
              <p className="mt-1.5 text-sm text-[#5f6f69]">
                Explore publishing options and choose an offer for your campaign.
              </p>
            </div>

            <span className="w-fit rounded-lg border border-[#e5eae8] bg-white px-3 py-1.5 text-xs font-semibold text-[#5f6f69]">
              {website.services.length} listed
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {website.services.map((service) => (
              <article
                key={service.id}
                className="flex min-w-0 flex-col rounded-xl border border-[#e5eae8] bg-white p-5 transition-all duration-200 hover:border-[#b8d9cb] hover:shadow-[0_12px_28px_-20px_rgba(18,33,28,0.3)] sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[1px] text-[#0e7a5a]">
                      {formatServiceType(service.serviceType)}
                    </p>
                    <h3 className="mt-1.5 break-words text-[17px] font-semibold text-[#12211c]">
                      {service.serviceName}
                    </h3>
                  </div>

                  <strong className="shrink-0 text-[20px] font-semibold tabular-nums text-[#203d33]">
                    {new Intl.NumberFormat("en", {
                      style: "currency",
                      currency: service.currency,
                    }).format(Number(service.price))}
                  </strong>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-[13px] leading-[1.75] text-[#5f6f69]">
                  {service.description}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-3 border-t border-[#edf1ee] pt-4 text-[12px] text-[#65726d] sm:grid-cols-2">
                  <span className="flex items-center gap-2">
                    <Clock3 size={15} className="shrink-0 text-[#0e7a5a]" />
                    {service.deliveryTimeDays} day{service.deliveryTimeDays === 1 ? "" : "s"} delivery
                  </span>

                  <span className="flex items-center gap-2">
                    <PenLine size={15} className="shrink-0 text-[#0e7a5a]" />
                    {service.contentWritingIncluded
                      ? "Writing included"
                      : "Content supplied by advertiser"}
                  </span>

                  <span className="flex items-center gap-2">
                    <Link2 size={15} className="shrink-0 text-[#0e7a5a]" />
                    {formatServiceLinkType(service.linkType)}
                    {service.linkType === "NOT_APPLICABLE"
                      ? ""
                      : ` · Up to ${service.maximumLinks} links`}
                  </span>

                  <span className="flex items-center gap-2">
                    <House size={15} className="shrink-0 text-[#0e7a5a]" />
                    {service.homepageLinkAvailable
                      ? "Homepage link available"
                      : "No homepage link"}
                  </span>
                </div>

                {service.publishingGuidelines && (
                  <div className="mt-5 border-t border-[#edf1ee] pt-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wide text-[#78847e]">
                      Publishing guidelines
                    </h4>
                    <p className="mt-2 whitespace-pre-wrap text-[12px] leading-[1.75] text-[#5f6f69]">
                      {service.publishingGuidelines}
                    </p>
                  </div>
                )}

                {service.additionalConditions && (
                  <div className="mt-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wide text-[#78847e]">
                      Additional conditions
                    </h4>
                    <p className="mt-2 whitespace-pre-wrap text-[12px] leading-[1.75] text-[#5f6f69]">
                      {service.additionalConditions}
                    </p>
                  </div>
                )}

                <div className="mt-auto pt-6">
                  <BuyNowButton serviceId={service.id} />
                </div>
              </article>
            ))}
          </div>
        </div>

        <Link
          href="/advertiser/marketplace"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#5f6f69] transition-colors hover:text-[#0e7a5a]"
        >
          <ArrowLeft size={15} />
          Back to marketplace
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-[#e5eae8] bg-white">
        <div className="mx-auto flex w-[calc(100%-40px)] max-w-[1040px] flex-col justify-between gap-2 py-6 text-[13px] text-[#82918b] sm:flex-row">
          <span>© 2026 LinkLedger</span>
          <div className="flex items-center gap-5">
            <Link
              href="/advertiser/marketplace"
              className="transition-colors hover:text-[#0e7a5a]"
            >
              Marketplace
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
