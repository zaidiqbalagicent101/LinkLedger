import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShoppingCart,
} from "lucide-react";
import { AdvertiserAccountMenu } from "@/components/advertiser/AdvertiserAccountMenu";
import { BuyNowButton } from "@/components/advertiser/BuyNowButton";
import { RemoveFromCartButton } from "@/components/advertiser/CartActions";
import { formatServiceType } from "@/components/publisher/service-options";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default function AdvertiserCartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-[#f6f8f7]" />}>
      <AdvertiserCartContent />
    </Suspense>
  );
}

async function AdvertiserCartContent() {
  const user = await requireRole("ADVERTISER");
  const items = await prisma.advertiserCartItem.findMany({
    where: { advertiserId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      publisherServiceId: true,
      createdAt: true,
      publisherService: {
        select: {
          id: true,
          serviceName: true,
          serviceType: true,
          price: true,
          currency: true,
          deliveryTimeDays: true,
          isActive: true,
          archivedAt: true,
          website: {
            select: {
              id: true,
              websiteName: true,
              websiteUrl: true,
              approvalStatus: true,
            },
          },
        },
      },
    },
  });

  const paidOrders = items.length
    ? await prisma.order.findMany({
        where: {
          advertiserId: user.id,
          paymentStatus: "PAID",
          publisherServiceId: {
            in: items.map((item) => item.publisherServiceId),
          },
        },
        select: { publisherServiceId: true },
      })
    : [];
  const purchasedServiceIds = new Set(
    paidOrders
      .map((order) => order.publisherServiceId)
      .filter((serviceId): serviceId is string => Boolean(serviceId)),
  );

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#12211c] antialiased">
      <header className="sticky top-0 z-30 border-b border-[#e5eae8] bg-white/85 backdrop-blur-xl">
        <div className="flex h-[72px] items-center justify-between px-6 sm:px-10 lg:px-14">
          <Link href="/advertiser/marketplace" className="inline-flex items-center gap-2.5 text-[19px] font-bold tracking-tight">
            <span className="grid size-9 place-items-center rounded-xl bg-[#0e7a5a] text-lg text-white">L</span>
            LinkLedger
          </Link>
          <AdvertiserAccountMenu />
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1100px] px-5 py-8 sm:px-8 lg:px-12">
        <Link
          href="/advertiser/marketplace"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#52665b] hover:text-[#0e7a5a]"
        >
          <ArrowLeft size={16} />
          Continue shopping
        </Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#dce5df] pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0e7a5a]">Advertiser workspace</p>
            <h1 className="mt-2 text-3xl font-bold text-[#12211c]">Your cart</h1>
          </div>
          <p className="text-sm font-medium text-[#718078]">
            {items.length} {items.length === 1 ? "saved service" : "saved services"}
          </p>
        </div>

        {items.length ? (
          <div className="mt-6 space-y-3">
            {items.map(({ publisherService: service, createdAt }) => {
              const isAvailable =
                service.isActive &&
                !service.archivedAt &&
                service.website.approvalStatus === "APPROVED";
              const isPurchased = purchasedServiceIds.has(service.id);

              return (
                <article
                  key={service.id}
                  className="grid gap-5 rounded-xl border border-[#e2eae5] bg-white p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-[#203d33]">{service.serviceName}</h2>
                      <span className="rounded-full bg-[#edf6f0] px-2.5 py-1 text-[11px] font-semibold text-[#28634d]">
                        {formatServiceType(service.serviceType)}
                      </span>
                    </div>
                    <Link
                      href={`/advertiser/marketplace/${service.website.id}`}
                      className="mt-1 inline-flex items-center gap-1 text-sm text-[#718078] hover:text-[#0e7a5a]"
                    >
                      {service.website.websiteName}
                      <ArrowRight size={13} />
                    </Link>
                    <p className="mt-2 text-xs text-[#82918b]">
                      Added {createdAt.toLocaleDateString()} · {service.deliveryTimeDays} day{service.deliveryTimeDays === 1 ? "" : "s"} delivery
                    </p>
                    {!isAvailable && (
                      <p className="mt-2 text-xs font-semibold text-[#a33d3d]" role="status">
                        This service is no longer available.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <strong className="min-w-[110px] text-right text-lg font-bold tabular-nums text-[#17382b]">
                      {new Intl.NumberFormat("en", {
                        style: "currency",
                        currency: service.currency,
                      }).format(Number(service.price))}
                    </strong>
                    {isAvailable && !isPurchased && (
                      <div className="w-[150px]">
                        <BuyNowButton
                          serviceId={service.id}
                        />
                      </div>
                    )}
                    {isPurchased && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16734e]">
                        <CheckCircle2 size={15} />
                        Already purchased
                      </span>
                    )}
                    <RemoveFromCartButton serviceId={service.id} />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-[#c5d9cc] bg-white px-6 py-14 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-xl bg-[#eaf5ed] text-[#0e7a5a]">
              <ShoppingCart size={24} />
            </span>
            <h2 className="mt-4 text-xl font-bold text-[#203d33]">Your cart is empty</h2>
            <p className="mt-2 text-sm text-[#718078]">Save services from the marketplace to compare them here.</p>
            <Link
              href="/advertiser/marketplace"
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0e7a5a] px-4 text-sm font-semibold text-white hover:bg-[#0a6149]"
            >
              Browse services
              <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}