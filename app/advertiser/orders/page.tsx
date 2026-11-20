import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, PackageCheck } from "lucide-react";
import { OrderStatusBadge } from "@/components/advertiser/OrderStatusBadge";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default function AdvertiserOrdersPage() {
  return (
    <Suspense fallback={<div className="workspace-page" aria-busy="true" />}>
      <AdvertiserOrdersContent />
    </Suspense>
  );
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
            <Link href="/advertiser/dashboard" className="hover:text-[#0e7a5a]">Dashboard</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto w-[calc(100%-40px)] max-w-[1040px] py-9 sm:py-12">
        <Link href="/advertiser/dashboard" className="mb-7 inline-flex items-center gap-2 text-[13px] font-medium text-[#82918b] hover:text-[#0e7a5a]">
          <ArrowLeft size={15} />Advertiser dashboard
        </Link>
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Advertiser workspace</p>
            <h1 className="mt-2 text-[32px] font-semibold tracking-[-1px] sm:text-[38px]">My Orders</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[#5f6f69]">Purchases and their current status.</p>
          </div>
          <Link href="/advertiser/marketplace" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#0e7a5a] hover:text-[#0a6149]">
            Browse marketplace<ArrowUpRight size={15} />
          </Link>
        </div>

        {orders.length ? (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <article key={order.id} className="grid gap-4 border border-[#e0e7e2] bg-white p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words text-[17px] font-semibold text-[#203d33]">{order.serviceNameSnapshot}</h2>
                    <OrderStatusBadge status={order.status} />
                    <OrderStatusBadge status={order.paymentStatus} kind="payment" />
                  </div>
                  <a href={order.websiteUrlSnapshot} target="_blank" rel="noreferrer" className="mt-2 inline-flex max-w-full items-center gap-1 break-all text-[13px] font-semibold text-[#286d5d] hover:text-[#0a6149]">
                    {order.websiteNameSnapshot} · {order.websiteUrlSnapshot}<ArrowUpRight size={13} className="shrink-0" />
                  </a>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-[#78847e]">
                    <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} />{order.createdAt.toLocaleDateString()}</span>
                    <span>Order ID: <span className="font-mono">{order.id}</span></span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <strong className="whitespace-nowrap text-[20px] font-semibold tabular-nums text-[#203d33]">
                    {new Intl.NumberFormat("en", { style: "currency", currency: order.agreedCurrency }).format(Number(order.agreedPrice))}
                  </strong>
                  <Link href={`/advertiser/orders/${order.id}`} className="inline-flex min-h-10 items-center gap-2 bg-[#0e7a5a] px-4 text-sm font-semibold text-white hover:bg-[#0a6149]">
                    Details<ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[280px] flex-col items-center justify-center border border-dashed border-[#cbd7cf] bg-white px-6 text-center">
            <PackageCheck size={30} className="text-[#0e7a5a]" />
            <h2 className="mt-4 text-[20px] font-semibold">No orders yet</h2>
            <p className="mt-2 max-w-[420px] text-sm leading-relaxed text-[#78847e]">Your confirmed service purchases will appear here.</p>
            <Link href="/advertiser/marketplace" className="primary-button mt-5">Browse marketplace<ArrowRight size={15} /></Link>
          </div>
        )}
      </section>
    </main>
  );
}