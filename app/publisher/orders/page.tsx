import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  Globe2,
  Inbox,
  UserRound,
} from "lucide-react";

import type { OrderStatus, PublisherServiceType } from "@/generated/prisma/enums";
import { OrderStatusBadge } from "@/components/advertiser/OrderStatusBadge";
import { PublisherAccountMenu } from "@/components/publisher/PublisherAccountMenu";
import { formatServiceType } from "@/components/publisher/service-options";
import { requirePublisherProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return date.toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type PublisherOrdersSearchParams = {
  from?: string;
  to?: string;
  status?: string;
  serviceType?: string;
};

function parseDate(value?: string, endOfDay = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return undefined;
  }

  if (endOfDay) date.setUTCDate(date.getUTCDate() + 1);
  return date;
}

export default function PublisherOrdersPage({
  searchParams,
}: {
  searchParams: Promise<PublisherOrdersSearchParams>;
}) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f6f8f7]" aria-busy="true" />
      }
    >
      <PublisherOrdersContent searchParams={searchParams} />
    </Suspense>
  );
}

async function PublisherOrdersContent({
  searchParams,
}: {
  searchParams: Promise<PublisherOrdersSearchParams>;
}) {
  await connection();

  const user = await requirePublisherProfile();
  const params = await searchParams;

  const fromDate = parseDate(params.from);
  const toDateExclusive = parseDate(params.to, true);
  const statusFilter = params.status?.trim() ?? "";
  const serviceTypeFilter = params.serviceType?.trim() ?? "";

  const ownershipWhere = {
    website: {
      publisherProfile: {
        userId: user.id,
      },
    },
  };

  // Build filter values from all orders belonging to this publisher.
  // Payment status is intentionally not restricted: CONFIRMED orders can still be PENDING payment.
  const [availableStatuses, availableServiceTypes] = await Promise.all([
    prisma.order.findMany({
      where: ownershipWhere,
      distinct: ["status"],
      select: { status: true },
    }),
    prisma.order.findMany({
      where: ownershipWhere,
      distinct: ["serviceTypeSnapshot"],
      select: { serviceTypeSnapshot: true },
    }),
  ]);

  const validStatuses = availableStatuses.map((item) => item.status);
  const validServiceTypes = availableServiceTypes.map((item) => item.serviceTypeSnapshot);

  const filters: {
    createdAt?: { gte?: Date; lt?: Date };
    status?: OrderStatus;
    serviceTypeSnapshot?: PublisherServiceType;
  } = {};

  if (fromDate || toDateExclusive) {
    filters.createdAt = {};
    if (fromDate) filters.createdAt.gte = fromDate;
    if (toDateExclusive) filters.createdAt.lt = toDateExclusive;
  }

  if (statusFilter && validStatuses.includes(statusFilter as OrderStatus)) {
    filters.status = statusFilter as OrderStatus;
  }

  if (serviceTypeFilter && validServiceTypes.includes(serviceTypeFilter as PublisherServiceType)) {
    filters.serviceTypeSnapshot = serviceTypeFilter as PublisherServiceType;
  }

  const hasActiveFilters = Boolean(
    fromDate || toDateExclusive || filters.status || filters.serviceTypeSnapshot
  );

  const orders = await prisma.order.findMany({
    where: {
      ...ownershipWhere,
      ...filters,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      websiteNameSnapshot: true,
      serviceNameSnapshot: true,
      serviceTypeSnapshot: true,
      agreedPrice: true,
      agreedCurrency: true,
      topic: true,
      anchorText: true,
      status: true,
      createdAt: true,
      advertiser: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  });

  const orderCount = orders.length;
  const latestOrder = orders[0];

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

      {/* One continuous full-width page */}
      <section className="w-full px-6 py-8 sm:px-10 sm:py-10 lg:px-14">
        <Link
          href="/publisher/dashboard"
          className="mb-5 inline-flex items-center gap-2 rounded-md text-[13px] font-medium text-[#82918b] transition-colors hover:text-[#0e7a5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
        >
          <ArrowLeft size={15} />
          Publisher dashboard
        </Link>

        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0b2e24] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] bg-[length:22px_22px] px-7 py-9 text-white sm:px-10 sm:py-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 -top-24 size-64 rounded-full bg-[#0e7a5a]/30 blur-3xl"
          />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                <span className="size-1.5 rounded-full bg-emerald-300" />
                Publisher workspace
              </div>

              <h1 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[50px]">
                Incoming orders
              </h1>

              <p className="mt-3 max-w-[560px] text-[16px] leading-relaxed text-emerald-50/75">
                Review confirmed purchases made for your websites and manage
                your incoming orders.
              </p>
            </div>

            {latestOrder && (
              <dl className="grid shrink-0 grid-cols-2 gap-3 xl:w-[440px]">
                <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
                  <dt className="text-xs text-emerald-100/70">Orders received</dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums">
                    {orderCount}
                  </dd>
                </div>
                <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
                  <dt className="text-xs text-emerald-100/70">Latest order</dt>
                  <dd className="mt-1 text-2xl font-semibold">
                    {formatDate(latestOrder.createdAt)}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>

        {/* Notice */}
        <div className="mt-5 flex items-center gap-4 rounded-2xl border border-[#dcebe3] bg-[#edf6f1] px-5 py-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#0e7a5a]">
            <CheckCircle2 size={19} />
          </span>
          <p className="text-[13px] leading-relaxed text-[#5f6f69]">
            All orders placed for your websites are displayed here, including orders with pending payment.
          </p>
        </div>

        {/* Order filters */}
        <form
          method="GET"
          action="/publisher/orders"
          className="mt-5 rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_12px_30px_-28px_rgba(18,33,28,0.3)]"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-[15px] font-semibold text-[#12211c]">Filter orders</h2>
              <p className="mt-1 text-[12px] text-[#82918b]">
                Narrow incoming orders by received date, status, or service.
              </p>
            </div>
            {hasActiveFilters && (
              <Link
                href="/publisher/orders"
                className="text-[12px] font-semibold text-[#0e7a5a] hover:text-[#0a6149]"
              >
                Clear all filters
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-[#5f6f69]">
                Received from
              </span>
              <input
                type="date"
                name="from"
                defaultValue={params.from ?? ""}
                max={params.to || undefined}
                className="h-11 w-full rounded-lg border border-[#dce5e0] bg-white px-3 text-[13px] text-[#12211c] outline-none focus:border-[#0e7a5a] focus:ring-2 focus:ring-[#0e7a5a]/10"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-[#5f6f69]">
                Received to
              </span>
              <input
                type="date"
                name="to"
                defaultValue={params.to ?? ""}
                min={params.from || undefined}
                className="h-11 w-full rounded-lg border border-[#dce5e0] bg-white px-3 text-[13px] text-[#12211c] outline-none focus:border-[#0e7a5a] focus:ring-2 focus:ring-[#0e7a5a]/10"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-[#5f6f69]">
                Order status
              </span>
              <select
                name="status"
                defaultValue={filters.status ? statusFilter : ""}
                className="h-11 w-full rounded-lg border border-[#dce5e0] bg-white px-3 text-[13px] text-[#12211c] outline-none focus:border-[#0e7a5a] focus:ring-2 focus:ring-[#0e7a5a]/10"
              >
                <option value="">All statuses</option>
                {validStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-[#5f6f69]">
                Service type
              </span>
              <select
                name="serviceType"
                defaultValue={filters.serviceTypeSnapshot ? serviceTypeFilter : ""}
                className="h-11 w-full rounded-lg border border-[#dce5e0] bg-white px-3 text-[13px] text-[#12211c] outline-none focus:border-[#0e7a5a] focus:ring-2 focus:ring-[#0e7a5a]/10"
              >
                <option value="">All services</option>
                {validServiceTypes.map((serviceType) => (
                  <option key={serviceType} value={serviceType}>
                    {formatServiceType(serviceType)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#0e7a5a] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#0a6149] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
            >
              Apply filters
            </button>
            <span className="text-[12px] text-[#82918b]">
              {orderCount} {orderCount === 1 ? "order" : "orders"} found
            </span>
          </div>
        </form>

        {/* Orders table */}
        <div className="mt-5">
          {orderCount ? (
            <div className="overflow-x-auto rounded-2xl border border-[#e5eae8] bg-white shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)]">
              <table className="w-full min-w-[980px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="bg-[#f3f8f5] text-[12px] font-semibold text-[#5f6f69]">
                    <th className="whitespace-nowrap px-6 py-4">Website &amp; service</th>
                    <th className="whitespace-nowrap px-4 py-4">Advertiser</th>
                    <th className="whitespace-nowrap px-4 py-4">Purchase requirements</th>
                    <th className="whitespace-nowrap px-4 py-4">Price</th>
                    <th className="whitespace-nowrap px-4 py-4">Status</th>
                    <th className="whitespace-nowrap px-4 py-4">Received</th>
                    <th className="px-6 py-4">
                      <span className="sr-only">Open order</span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="group border-t border-[#eef2f0] transition-colors hover:bg-[#fafcfb]"
                    >
                      {/* Website and service */}
                      <td className="px-6 py-5 align-middle">
                        <span className="flex items-center gap-2 break-words text-[14px] font-semibold text-[#12211c]">
                          <Globe2 size={14} className="shrink-0 text-[#0e7a5a]" />
                          {order.websiteNameSnapshot}
                        </span>
                        <span className="mt-1 block break-words text-[12px] text-[#5f6f69]">
                          {order.serviceNameSnapshot}
                        </span>
                        <span className="mt-2 inline-block rounded-full bg-[#e7f4ed] px-2.5 py-0.5 text-[11px] font-medium text-[#0a6149]">
                          {formatServiceType(order.serviceTypeSnapshot)}
                        </span>
                      </td>

                      {/* Advertiser */}
                      <td className="px-4 py-5 align-middle">
                        <span className="flex items-center gap-2 break-words text-[14px] font-semibold text-[#12211c]">
                          <UserRound size={14} className="shrink-0 text-[#0e7a5a]" />
                          {order.advertiser.fullName}
                        </span>
                        <span className="mt-1 block break-all text-[12px] text-[#5f6f69]">
                          {order.advertiser.email}
                        </span>
                      </td>

                      {/* Purchase requirements */}
                      <td className="px-4 py-5 align-middle">
                        <div className="max-w-[220px]">
                          <span className="flex items-start gap-2 break-words text-[13px] font-semibold text-[#12211c]">
                            <FileText size={14} className="mt-0.5 shrink-0 text-[#0e7a5a]" />
                            {order.topic?.trim() || "No topic specified"}
                          </span>
                          <span className="mt-1 block break-words text-[12px] text-[#5f6f69]">
                            {order.anchorText?.trim()
                              ? `Anchor: ${order.anchorText}`
                              : "No anchor text specified"}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-5 align-middle">
                        <span className="whitespace-nowrap text-[15px] font-semibold tabular-nums text-[#203d33]">
                          {new Intl.NumberFormat("en", {
                            style: "currency",
                            currency: order.agreedCurrency,
                          }).format(Number(order.agreedPrice))}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-5 align-middle">
                        <OrderStatusBadge status={order.status} />
                      </td>

                      {/* Received */}
                      <td className="px-4 py-5 align-middle">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] text-[#5f6f69]">
                          <CalendarDays size={13} className="text-[#0e7a5a]" />
                          {formatDate(order.createdAt)}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="px-6 py-5 text-right align-middle">
                        <Link
                          href={`/publisher/orders/${order.id}`}
                          className="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#0e7a5a] px-4 text-[13px] font-semibold !text-white transition-colors hover:bg-[#0a6149] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
                        >
                          Details
                          <ArrowRight
                            size={14}
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                          />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty state */
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#b8d9cb] bg-white px-6 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-[#e7f4ed] text-[#0e7a5a]">
                <Inbox size={28} />
              </span>

              <h2 className="mt-5 text-[22px] font-semibold tracking-tight">
                {hasActiveFilters ? "No matching orders" : "No incoming orders"}
              </h2>

              <p className="mt-2 max-w-[460px] text-sm leading-relaxed text-[#5f6f69]">
                {hasActiveFilters
                  ? "No paid orders match the selected filters. Try changing the date range, status, or service type."
                  : "Purchases for your websites will appear here. Once an advertiser purchases one of your services, you can review the order details here."}
              </p>

              {hasActiveFilters ? (
                <Link
                  href="/publisher/orders"
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#cfe2d8] px-5 text-sm font-semibold text-[#0e7a5a] transition-colors hover:bg-[#f3f8f5]"
                >
                  Clear filters
                </Link>
              ) : (
              <Link
                href="/publisher/websites"
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0e7a5a] px-5 text-sm font-semibold !text-white transition-colors hover:bg-[#0a6149] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
              >
                Review your websites
                <ArrowRight size={15} />
              </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
