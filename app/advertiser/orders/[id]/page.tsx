import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock,
  FileText,
  Globe2,
  PackageCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { OrderStatusBadge } from "@/components/advertiser/OrderStatusBadge";
import { AdvertiserAccountMenu } from "@/components/advertiser/AdvertiserAccountMenu";
import { formatServiceLinkType, formatServiceType } from "@/components/publisher/service-options";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default function AdvertiserOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="workspace-page" aria-busy="true" />}>
      <AdvertiserOrderDetails params={params} />
    </Suspense>
  );
}

async function AdvertiserOrderDetails({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const user = await requireRole("ADVERTISER");
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, advertiserId: user.id },
    select: {
      id: true,
      websiteNameSnapshot: true,
      websiteUrlSnapshot: true,
      websiteNicheSnapshot: true,
      monthlyTrafficSnapshot: true,
      websiteLanguageSnapshot: true,
      targetAudienceCountrySnapshot: true,
      websiteDescriptionSnapshot: true,
      domainRatingSnapshot: true,
      domainAuthoritySnapshot: true,
      serviceNameSnapshot: true,
      serviceTypeSnapshot: true,
      serviceDescriptionSnapshot: true,
      publishingGuidelinesSnapshot: true,
      additionalConditionsSnapshot: true,
      originalPrice: true,
      originalCurrency: true,
      originalDeliveryTimeDays: true,
      originalContentWritingIncluded: true,
      originalLinkType: true,
      originalMaximumLinks: true,
      originalHomepageLinkAvailable: true,
      agreedPrice: true,
      agreedCurrency: true,
      agreedDeliveryTimeDays: true,
      agreedContentWritingIncluded: true,
      agreedLinkType: true,
      agreedNumberOfLinks: true,
      agreedHomepageLinkAvailable: true,
      topic: true,
      targetUrl: true,
      anchorText: true,
      contentRequirements: true,
      additionalInstructions: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
    },
  });

  if (!order) notFound();

  const formatPrice = (price: { toNumber(): number }, currency: string) =>
    new Intl.NumberFormat("en", { style: "currency", currency }).format(price.toNumber());
  const valueOrMissing = (value: string | null | undefined) => value?.trim() || "Not provided";

  const agreedPriceLabel = formatPrice(order.agreedPrice, order.agreedCurrency);
  const originalPriceLabel = formatPrice(order.originalPrice, order.originalCurrency);
  const priceChanged =
    order.originalCurrency !== order.agreedCurrency ||
    order.originalPrice.toNumber() !== order.agreedPrice.toNumber();
  const deliveryChanged = order.originalDeliveryTimeDays !== order.agreedDeliveryTimeDays;

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#12211c] antialiased">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#e5eae8] bg-white/80 backdrop-blur-md">
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
          <AdvertiserAccountMenu />
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1200px] px-6 py-8 sm:px-10 sm:py-10 lg:px-14">
        <Link
          href="/advertiser/orders"
          className="mb-5 inline-flex items-center gap-2 rounded-md text-[13px] font-medium text-[#82918b] transition-colors hover:text-[#0e7a5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
        >
          <ArrowLeft size={15} />
          My orders
        </Link>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0b2e24] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] bg-[length:22px_22px] px-7 py-9 text-white sm:px-10 sm:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 -top-24 size-64 rounded-full bg-[#0e7a5a]/30 blur-3xl"
          />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="min-w-0">
              <div className="mb-4 inline-flex flex-wrap items-center gap-2 rounded-xl bg-white px-2.5 py-2">
                <OrderStatusBadge status={order.status} />
                <OrderStatusBadge status={order.paymentStatus} kind="payment" />
              </div>

              <h1 className="break-words text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[44px]">
                {order.serviceNameSnapshot}
              </h1>

              <p className="mt-3 text-[15px] text-emerald-50/75">
                {order.websiteNameSnapshot}
              </p>

              <div className="mt-4 flex flex-col gap-2 text-[13px] text-emerald-50/65">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={14} />
                  Purchased{" "}
                  {order.createdAt.toLocaleString("en", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <span className="break-all">
                  Order ID: <span className="font-mono">{order.id}</span>
                </span>
              </div>
            </div>

            <dl className="flex shrink-0 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
                <dt className="text-xs text-emerald-100/70">Agreed price</dt>
                <dd className="mt-1 whitespace-nowrap text-[28px] font-semibold tracking-tight tabular-nums">
                  {agreedPriceLabel}
                </dd>
                {priceChanged && (
                  <dd className="mt-0.5 text-xs text-emerald-100/60">
                    Listed at <span className="line-through">{originalPriceLabel}</span>
                  </dd>
                )}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
                <dt className="inline-flex items-center gap-1.5 text-xs text-emerald-100/70">
                  <Clock size={12} />
                  Delivery
                </dt>
                <dd className="mt-1 whitespace-nowrap text-[28px] font-semibold tracking-tight tabular-nums">
                  {order.agreedDeliveryTimeDays} days
                </dd>
                {deliveryChanged && (
                  <dd className="mt-0.5 text-xs text-emerald-100/60">
                    Listed at{" "}
                    <span className="line-through">{order.originalDeliveryTimeDays} days</span>
                  </dd>
                )}
              </div>
            </dl>
          </div>
        </div>

        {/* Details */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card icon={Globe2} title="Website snapshot">
            <div className="grid grid-cols-3 gap-3">
              <Metric label="Monthly traffic" value={order.monthlyTrafficSnapshot.toLocaleString()} />
              <Metric label="Domain Rating" value={order.domainRatingSnapshot ?? "Not provided"} />
              <Metric label="Domain Authority" value={order.domainAuthoritySnapshot ?? "Not provided"} />
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <Detail label="Website">
                <a
                  href={order.websiteUrlSnapshot}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-full items-center gap-1 break-all font-semibold text-[#286d5d] transition-colors hover:text-[#0a6149]"
                >
                  {order.websiteNameSnapshot}
                  <ArrowUpRight size={13} className="shrink-0" />
                </a>
              </Detail>
              <Detail label="Website URL">
                <span className="break-all">{order.websiteUrlSnapshot}</span>
              </Detail>
              <Detail label="Niche">{order.websiteNicheSnapshot}</Detail>
              <Detail label="Language">{order.websiteLanguageSnapshot}</Detail>
              <div className="sm:col-span-2">
                <Detail label="Target audience">{order.targetAudienceCountrySnapshot}</Detail>
              </div>
              <div className="sm:col-span-2">
                <Detail label="Website description">{order.websiteDescriptionSnapshot}</Detail>
              </div>
            </dl>
          </Card>

          <Card icon={PackageCheck} title="Service snapshot">
            {/* Original vs agreed terms */}
            <div className="overflow-hidden rounded-xl border border-[#e5eae8] text-sm">
              <div className="grid grid-cols-[1fr_1fr_1fr] bg-[#f3f8f5] px-4 py-2.5 text-xs font-medium text-[#82918b]">
                <span />
                <span>Original</span>
                <span className="text-[#0a6149]">Agreed</span>
              </div>
              <div className="grid grid-cols-[1fr_1fr_1fr] items-center border-t border-[#eef2f0] px-4 py-3">
                <span className="text-xs text-[#82918b]">Price</span>
                <span className="tabular-nums text-[#5f6f69]">{originalPriceLabel}</span>
                <span className="font-semibold tabular-nums text-[#203d33]">{agreedPriceLabel}</span>
              </div>
              <div className="grid grid-cols-[1fr_1fr_1fr] items-center border-t border-[#eef2f0] px-4 py-3">
                <span className="text-xs text-[#82918b]">Delivery</span>
                <span className="tabular-nums text-[#5f6f69]">{order.originalDeliveryTimeDays} days</span>
                <span className="font-semibold tabular-nums text-[#203d33]">
                  {order.agreedDeliveryTimeDays} days
                </span>
              </div>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <Detail label="Service">{order.serviceNameSnapshot}</Detail>
              <Detail label="Service type">{formatServiceType(order.serviceTypeSnapshot)}</Detail>
              <Detail label="Content writing">
                {order.agreedContentWritingIncluded ? "Included" : "Not included"}
              </Detail>
              <Detail label="Link type">{formatServiceLinkType(order.agreedLinkType)}</Detail>
              <Detail label="Maximum links">{order.agreedNumberOfLinks ?? "Not specified"}</Detail>
              <Detail label="Homepage placement">
                {order.agreedHomepageLinkAvailable ? "Available" : "Not included"}
              </Detail>
              <div className="sm:col-span-2">
                <Detail label="Service description">{order.serviceDescriptionSnapshot}</Detail>
              </div>
              <div className="sm:col-span-2">
                <Detail label="Publishing guidelines">
                  {valueOrMissing(order.publishingGuidelinesSnapshot)}
                </Detail>
              </div>
              <div className="sm:col-span-2">
                <Detail label="Additional conditions">
                  {valueOrMissing(order.additionalConditionsSnapshot)}
                </Detail>
              </div>
            </dl>
          </Card>

          <Card icon={FileText} title="Article and content instructions" className="lg:col-span-2">
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label="Article topic">{valueOrMissing(order.topic)}</Detail>
              <Detail label="Anchor text">{valueOrMissing(order.anchorText)}</Detail>
              <div className="sm:col-span-2">
                <Detail label="Target URL">
                  <span className="break-all">{valueOrMissing(order.targetUrl)}</span>
                </Detail>
              </div>
              <div className="sm:col-span-2">
                <Detail label="Content requirements">{valueOrMissing(order.contentRequirements)}</Detail>
              </div>
              <div className="sm:col-span-2">
                <Detail label="Additional instructions">
                  {valueOrMissing(order.additionalInstructions)}
                </Detail>
              </div>
            </dl>
          </Card>
        </div>
      </section>
    </main>
  );
}

function Card({
  icon: Icon,
  title,
  className = "",
  children,
}: {
  icon: LucideIcon;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-[#e5eae8] bg-white p-5 sm:p-7 ${className}`}
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
          <Icon size={19} />
        </span>
        <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl bg-[#f3f8f5] px-4 py-3.5">
      <div className="text-xs text-[#82918b]">{label}</div>
      <div className="mt-1 break-words text-lg font-semibold tracking-tight tabular-nums text-[#203d33]">
        {value}
      </div>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-[#82918b]">{label}</dt>
      <dd className="mt-1.5 whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-[#203d33]">
        {children}
      </dd>
    </div>
  );
}