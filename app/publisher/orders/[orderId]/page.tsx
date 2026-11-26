
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  Globe2,
  UserRound,
  Wallet,
} from "lucide-react";

import { OrderStatusBadge } from "@/components/advertiser/OrderStatusBadge";
import { FulfillmentHistory } from "@/components/orders/FulfillmentHistory";
import { PublisherFulfillmentControls } from "@/components/orders/PublisherFulfillmentControls";
import { PublisherAccountMenu } from "@/components/publisher/PublisherAccountMenu";
import {
  formatServiceLinkType,
  formatServiceType,
} from "@/components/publisher/service-options";
import { requirePublisherProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return date.toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PublisherOrderDetailsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main
          className="min-h-screen w-full bg-[#f6f8f7]"
          aria-busy="true"
        />
      }
    >
      <PublisherOrderDetails params={params} />
    </Suspense>
  );
}

async function PublisherOrderDetails({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  await connection();

  const user = await requirePublisherProfile();
  const { orderId } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      paymentStatus: "PAID",
      website: {
        publisherProfile: {
          userId: user.id,
        },
      },
    },
    select: {
      id: true,
      websiteNameSnapshot: true,
      websiteUrlSnapshot: true,
      websiteNicheSnapshot: true,
      monthlyTrafficSnapshot: true,
      websiteLanguageSnapshot: true,
      targetAudienceCountrySnapshot: true,
      serviceNameSnapshot: true,
      serviceTypeSnapshot: true,
      serviceDescriptionSnapshot: true,
      publishingGuidelinesSnapshot: true,
      additionalConditionsSnapshot: true,
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
      publicationUrl: true,
      createdAt: true,
      fulfillmentEvents: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          type: true,
          contentUrl: true,
          contentText: true,
          feedback: true,
          createdAt: true,
          actor: { select: { fullName: true, role: true } },
        },
      },
      advertiser: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!order) notFound();

  const valueOrMissing = (value: string | null | undefined) =>
    value?.trim() || "Not provided";

  const price = new Intl.NumberFormat("en", {
    style: "currency",
    currency: order.agreedCurrency,
  }).format(Number(order.agreedPrice));

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

      {/* Page Content */}
      <section className="w-full px-6 py-8 sm:px-10 sm:py-10 lg:px-14">
        {/* Back Navigation */}
        <Link
          href="/publisher/orders"
          className="mb-5 inline-flex items-center gap-2 rounded-md text-[13px] font-medium text-[#82918b] transition-colors hover:text-[#0e7a5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
        >
          <ArrowLeft size={15} />
          Incoming orders
        </Link>

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

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                <span className="size-1.5 rounded-full bg-emerald-300" />
                Publisher workspace
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Order details
              </p>

              <h1 className="max-w-3xl break-words text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[46px]">
                {order.serviceNameSnapshot}
              </h1>

              <p className="mt-4 break-all text-[12px] text-emerald-50/55">
                Order ID: {order.id}
              </p>

              <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-emerald-50/75">
                <CalendarDays size={14} />
                Purchased {formatDate(order.createdAt)}
              </p>
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-3 xl:w-[440px]">
              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
                <dt className="text-xs text-emerald-100/70">
                  Agreed price
                </dt>
                <dd className="mt-1 break-words text-2xl font-semibold tabular-nums">
                  {price}
                </dd>
              </div>

              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
                <dt className="text-xs text-emerald-100/70">
                  Delivery time
                </dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {order.agreedDeliveryTimeDays} days
                </dd>
              </div>

              <div className="col-span-2 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-3">
                <span className="text-xs font-medium text-emerald-100/70">
                  Current order status
                </span>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Notice */}
        <div className="mt-5 flex items-center gap-4 rounded-2xl border border-[#dcebe3] bg-[#edf6f1] px-5 py-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#0e7a5a]">
            <CheckCircle2 size={19} />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-[#203d33]">
              Payment successfully received
            </p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-[#5f6f69]">
              This order was placed and paid for by the advertiser.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <PublisherFulfillmentControls
            orderId={order.id}
            status={order.status}
            paymentStatus="PAID"
            publicationUrl={order.publicationUrl}
            latestContent={[...order.fulfillmentEvents].reverse().find((event) => event.type === "CONTENT_SUBMITTED")}
          />
        </div>

        {/* Quick Summary */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<Wallet size={18} />}
            label="Agreed price"
            value={price}
            description="Confirmed purchase amount"
          />

          <SummaryCard
            icon={<CalendarDays size={18} />}
            label="Delivery timeline"
            value={`${order.agreedDeliveryTimeDays} days`}
            description="Agreed delivery period"
          />

          <SummaryCard
            icon={<Globe2 size={18} />}
            label="Website"
            value={order.websiteNameSnapshot}
            description="Purchased publication"
          />

          <SummaryCard
            icon={<FileText size={18} />}
            label="Service type"
            value={formatServiceType(order.serviceTypeSnapshot)}
            description="Purchased service category"
          />
        </div>

        {/* Details Grid */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {/* Advertiser */}
          <section className="min-w-0 rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)] sm:p-6">
            <SectionHeading
              icon={<UserRound size={18} />}
              title="Advertiser"
              description="Contact information of the advertiser."
            />

            <dl className="mt-6 grid gap-5">
              <Detail label="Name">
                {order.advertiser.fullName}
              </Detail>

              <Detail label="Email address">
                <a
                  className="break-all text-[#286d5d] transition-colors hover:text-[#0a6149]"
                  href={`mailto:${order.advertiser.email}`}
                >
                  {order.advertiser.email}
                </a>
              </Detail>
            </dl>
          </section>

          {/* Purchased Service */}
          <section className="min-w-0 rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)] sm:p-6">
            <SectionHeading
              icon={<Globe2 size={18} />}
              title="Purchased service"
              description="Website and agreed service information."
            />

            <dl className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
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

              <Detail label="Service type">
                {formatServiceType(order.serviceTypeSnapshot)}
              </Detail>

              <Detail label="Agreed price">{price}</Detail>

              <Detail label="Delivery time">
                {order.agreedDeliveryTimeDays} days
              </Detail>

              <Detail label="Content writing">
                {order.agreedContentWritingIncluded
                  ? "Included"
                  : "Not included"}
              </Detail>

              <Detail label="Link type">
                {formatServiceLinkType(order.agreedLinkType)}
              </Detail>

              <Detail label="Number of links">
                {order.agreedNumberOfLinks ?? "Not specified"}
              </Detail>

              <Detail label="Homepage placement">
                {order.agreedHomepageLinkAvailable
                  ? "Available"
                  : "Not included"}
              </Detail>

              <div className="sm:col-span-2">
                <Detail label="Service description">
                  {order.serviceDescriptionSnapshot}
                </Detail>
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
          </section>

          {/* Purchase Requirements */}
          <section className="min-w-0 rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)] sm:col-span-2 sm:p-6">
            <SectionHeading
              icon={<FileText size={18} />}
              title="Purchase requirements"
              description="Content and placement instructions submitted by the advertiser."
            />

            <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <Detail label="Topic">
                {valueOrMissing(order.topic)}
              </Detail>

              <Detail label="Anchor text">
                {valueOrMissing(order.anchorText)}
              </Detail>

              <div className="sm:col-span-2">
                <Detail label="Target URL">
                  {valueOrMissing(order.targetUrl)}
                </Detail>
              </div>

              <div className="sm:col-span-2">
                <Detail label="Content requirements">
                  {valueOrMissing(order.contentRequirements)}
                </Detail>
              </div>

              <div className="sm:col-span-2">
                <Detail label="Additional instructions">
                  {valueOrMissing(order.additionalInstructions)}
                </Detail>
              </div>
            </dl>
          </section>

          {/* Website Snapshot */}
          <section className="min-w-0 rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)] sm:col-span-2 sm:p-6">
            <SectionHeading
              icon={<Globe2 size={18} />}
              title="Website snapshot"
              description="Publication information recorded at the time of purchase."
            />

            <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <Detail label="Niche">
                {order.websiteNicheSnapshot}
              </Detail>

              <Detail label="Monthly traffic">
                {order.monthlyTrafficSnapshot.toLocaleString()}
              </Detail>

              <Detail label="Language">
                {order.websiteLanguageSnapshot}
              </Detail>

              <Detail label="Target audience">
                {order.targetAudienceCountrySnapshot}
              </Detail>
            </dl>
          </section>
        </div>

        <div className="mt-5">
          <FulfillmentHistory events={order.fulfillmentEvents} />
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-[#e5eae8] bg-white p-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="text-sm font-semibold text-[#12211c]">
              Need to review another order?
            </p>
            <p className="mt-1 text-xs text-[#82918b]">
              Return to your incoming orders to view other purchases.
            </p>
          </div>

          <Link
            href="/publisher/orders"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0e7a5a] px-5 text-sm font-semibold !text-white transition-colors hover:bg-[#0a6149] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
          >
            Incoming orders
            <ArrowRight size={15} />
          </Link>
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
