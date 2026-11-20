import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarDays } from "lucide-react";
import { OrderStatusBadge } from "@/components/advertiser/OrderStatusBadge";
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

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#12211c] antialiased">
      <header className="border-b border-[#e5eae8] bg-white">
        <div className="mx-auto flex h-[72px] w-[calc(100%-40px)] max-w-[1040px] items-center justify-between">
          <Link href="/" aria-label="LinkLedger home" className="inline-flex items-center gap-2.5 text-[19px] font-bold">
            <span className="grid size-8 place-items-center rounded-lg bg-[#0e7a5a] text-[17px] text-white">L</span>
            LinkLedger
          </Link>
          <nav className="flex items-center gap-4 text-sm font-semibold text-[#5f6f69] sm:gap-6">
            <Link href="/advertiser/marketplace" className="hover:text-[#0e7a5a]">Marketplace</Link>
            <Link href="/advertiser/orders" className="text-[#0e7a5a]">My Orders</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto w-[calc(100%-40px)] max-w-[1040px] py-9 sm:py-12">
        <Link href="/advertiser/orders" className="mb-7 inline-flex items-center gap-2 text-[13px] font-medium text-[#82918b] hover:text-[#0e7a5a]">
          <ArrowLeft size={15} />My Orders
        </Link>
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <p className="eyebrow">Order details</p>
            <h1 className="mt-2 break-all text-[26px] font-semibold tracking-[-0.5px] sm:text-[32px]">{order.serviceNameSnapshot}</h1>
            <p className="mt-2 break-all font-mono text-xs text-[#78847e]">Order ID: {order.id}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#78847e]"><CalendarDays size={14} />Purchased {order.createdAt.toLocaleString()}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <OrderStatusBadge status={order.status} />
            <OrderStatusBadge status={order.paymentStatus} kind="payment" />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="min-w-0 border border-[#e0e7e2] bg-white p-5 sm:p-6">
            <h2 className="text-[16px] font-semibold">Website snapshot</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Detail label="Website">
                <a href={order.websiteUrlSnapshot} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1 break-all font-semibold text-[#286d5d] hover:text-[#0a6149]">
                  {order.websiteNameSnapshot}<ArrowUpRight size={13} className="shrink-0" />
                </a>
              </Detail>
              <Detail label="Website URL"><span className="break-all">{order.websiteUrlSnapshot}</span></Detail>
              <Detail label="Niche">{order.websiteNicheSnapshot}</Detail>
              <Detail label="Monthly traffic">{order.monthlyTrafficSnapshot.toLocaleString()}</Detail>
              <Detail label="Language">{order.websiteLanguageSnapshot}</Detail>
              <Detail label="Target audience">{order.targetAudienceCountrySnapshot}</Detail>
              <Detail label="Domain Rating">{order.domainRatingSnapshot ?? "Not provided"}</Detail>
              <Detail label="Domain Authority">{order.domainAuthoritySnapshot ?? "Not provided"}</Detail>
              <div className="sm:col-span-2"><Detail label="Website description">{order.websiteDescriptionSnapshot}</Detail></div>
            </dl>
          </section>

          <section className="min-w-0 border border-[#e0e7e2] bg-white p-5 sm:p-6">
            <h2 className="text-[16px] font-semibold">Service snapshot</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Detail label="Service">{order.serviceNameSnapshot}</Detail>
              <Detail label="Service type">{formatServiceType(order.serviceTypeSnapshot)}</Detail>
              <Detail label="Original price">{formatPrice(order.originalPrice, order.originalCurrency)}</Detail>
              <Detail label="Agreed price">{formatPrice(order.agreedPrice, order.agreedCurrency)}</Detail>
              <Detail label="Original delivery">{order.originalDeliveryTimeDays} days</Detail>
              <Detail label="Agreed delivery">{order.agreedDeliveryTimeDays} days</Detail>
              <Detail label="Content writing">{order.agreedContentWritingIncluded ? "Included" : "Not included"}</Detail>
              <Detail label="Link type">{formatServiceLinkType(order.agreedLinkType)}</Detail>
              <Detail label="Maximum links">{order.agreedNumberOfLinks ?? "Not specified"}</Detail>
              <Detail label="Homepage placement">{order.agreedHomepageLinkAvailable ? "Available" : "Not included"}</Detail>
              <div className="sm:col-span-2"><Detail label="Service description">{order.serviceDescriptionSnapshot}</Detail></div>
              <div className="sm:col-span-2"><Detail label="Publishing guidelines">{valueOrMissing(order.publishingGuidelinesSnapshot)}</Detail></div>
              <div className="sm:col-span-2"><Detail label="Additional conditions">{valueOrMissing(order.additionalConditionsSnapshot)}</Detail></div>
            </dl>
          </section>

          <section className="min-w-0 border border-[#e0e7e2] bg-white p-5 sm:col-span-2 sm:p-6">
            <h2 className="text-[16px] font-semibold">Article and content instructions</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Detail label="Article topic">{valueOrMissing(order.topic)}</Detail>
              <Detail label="Anchor text">{valueOrMissing(order.anchorText)}</Detail>
              <div className="sm:col-span-2"><Detail label="Target URL">{valueOrMissing(order.targetUrl)}</Detail></div>
              <div className="sm:col-span-2"><Detail label="Content requirements">{valueOrMissing(order.contentRequirements)}</Detail></div>
              <div className="sm:col-span-2"><Detail label="Additional instructions">{valueOrMissing(order.additionalInstructions)}</Detail></div>
            </dl>
          </section>
        </div>
      </section>
    </main>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-[#82918b]">{label}</dt>
      <dd className="mt-1.5 whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-[#203d33]">{children}</dd>
    </div>
  );
}