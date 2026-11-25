import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  PackageCheck,
} from "lucide-react";
import { OrderStatusBadge } from "@/components/advertiser/OrderStatusBadge";
import { AdvertiserAccountMenu } from "@/components/advertiser/AdvertiserAccountMenu";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default function AdvertiserOrdersPage() {
  return (
    <Suspense fallback={<div className="workspace-page" aria-busy="true" />}>
      <AdvertiserOrdersContent />
    </Suspense>
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function AdvertiserOrdersContent() {
  await connection();
  const user = await requireRole("ADVERTISER");
  const orders = await prisma.order.findMany({
    where: { advertiserId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      websiteNameSnapshot: true,
      websiteUrlSnapshot: true,
      serviceNameSnapshot: true,
      agreedPrice: true,
      agreedCurrency: true,
      createdAt: true,
      status: true,
      paymentStatus: true,
    },
  });

  const orderCount = orders.length;
  const latestOrder = orders[0];

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
          href="/advertiser/dashboard"
          className="mb-5 inline-flex items-center gap-2 rounded-md text-[13px] font-medium text-[#82918b] transition-colors hover:text-[#0e7a5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
        >
          <ArrowLeft size={15} />
          Advertiser dashboard
        </Link>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0b2e24] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] bg-[length:22px_22px] px-7 py-9 text-white sm:px-10 sm:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 -top-24 size-64 rounded-full bg-[#0e7a5a]/30 blur-3xl"
          />

          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                <span className="size-1.5 rounded-full bg-emerald-300" />
                Advertiser workspace
              </div>
              <h1 className="text-[38px] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[52px]">
                My orders
              </h1>
              <p className="mt-3 text-[16px] leading-relaxed text-emerald-50/75">
                Purchases and their current status.
              </p>
            </div>

            <div className="flex flex-col items-start gap-5 md:items-end">
              {latestOrder && (
                <dl className="flex gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3">
                    <dt className="text-xs text-emerald-100/70">Total orders</dt>
                    <dd className="mt-0.5 text-2xl font-semibold tabular-nums">
                      {orderCount}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3">
                    <dt className="text-xs text-emerald-100/70">Latest order</dt>
                    <dd className="mt-0.5 text-2xl font-semibold">
                      {formatDate(latestOrder.createdAt)}
                    </dd>
                  </div>
                </dl>
              )}

              <Link
                href="/advertiser/marketplace"
                className="group inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold !text-[#0b2e24] transition-colors hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Browse marketplace
                <ArrowUpRight
                  size={15}
                  className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="mt-8">
          {orderCount ? (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="group grid gap-5 rounded-2xl border border-[#e5eae8] bg-white p-5 transition-all duration-200 hover:border-[#b8d9cb] hover:shadow-[0_18px_36px_-26px_rgba(14,122,90,0.5)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <span
                      aria-hidden="true"
                      className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#e7f4ed] text-lg font-semibold text-[#0e7a5a] transition-colors duration-200 group-hover:bg-[#0e7a5a] group-hover:text-white"
                    >
                      {order.websiteNameSnapshot.trim().charAt(0).toUpperCase() || "L"}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="break-words text-[17px] font-semibold tracking-tight text-[#203d33]">
                          {order.serviceNameSnapshot}
                        </h2>
                        <OrderStatusBadge status={order.status} />
                        <OrderStatusBadge status={order.paymentStatus} kind="payment" />
                      </div>

                      <a
                        href={order.websiteUrlSnapshot}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex max-w-full items-center gap-1 break-all text-[13px] font-semibold text-[#286d5d] transition-colors hover:text-[#0a6149]"
                      >
                        {order.websiteNameSnapshot} · {order.websiteUrlSnapshot}
                        <ArrowUpRight size={13} className="shrink-0" />
                      </a>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-[#78847e]">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={13} />
                          {formatDate(order.createdAt)}
                        </span>
                        <span>
                          Order ID: <span className="font-mono">{order.id}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-[#eef2f0] pt-4 sm:flex-col sm:items-end sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                    <strong className="whitespace-nowrap text-[22px] font-semibold tracking-tight tabular-nums text-[#203d33]">
                      {new Intl.NumberFormat("en", {
                        style: "currency",
                        currency: order.agreedCurrency,
                      }).format(Number(order.agreedPrice))}
                    </strong>
                    <Link
                      href={`/advertiser/orders/${order.id}`}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0e7a5a] px-4 text-sm font-semibold !text-white transition-colors hover:bg-[#0a6149] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
                    >
                      Details
                      <ArrowRight
                        size={15}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#b8d9cb] bg-white px-6 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-[#e7f4ed] text-[#0e7a5a]">
                <PackageCheck size={28} />
              </span>
              <h2 className="mt-5 text-[22px] font-semibold tracking-tight">
                No orders yet
              </h2>
              <p className="mt-2 max-w-[420px] text-sm leading-relaxed text-[#5f6f69]">
                Your confirmed service purchases will appear here.
              </p>
              <Link
                href="/advertiser/marketplace"
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0e7a5a] px-5 text-sm font-semibold !text-white transition-colors hover:bg-[#0a6149] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
              >
                Browse marketplace
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}