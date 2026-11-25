
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Compass,
  Filter,
  Globe2,
  House,
  Link2,
  PenLine,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { BuyNowButton } from "@/components/advertiser/BuyNowButton";
import { AddToCartButton } from "@/components/advertiser/CartActions";
import { AdvertiserAccountMenu } from "@/components/advertiser/AdvertiserAccountMenu";
import { MarketplaceWebsitePreview } from "@/components/advertiser/MarketplaceWebsitePreview";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  formatServiceLinkType,
  formatServiceType,
} from "@/components/publisher/service-options";

type SearchParams = Record<string, string | string[] | undefined>;

function valueOf(params: SearchParams, key: string): string {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function boundedNumber(value: string, integer = false): number | undefined {
  if (!value.trim()) return undefined;
  const number = Number(value);

  return Number.isFinite(number) &&
    number >= 0 &&
    (!integer || Number.isInteger(number))
    ? number
    : undefined;
}

function pageHref(params: SearchParams, page: number): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || value === undefined) continue;
    query.set(key, Array.isArray(value) ? value[0] ?? "" : value);
  }

  query.set("page", String(page));
  return `/advertiser/marketplace?${query.toString()}`;
}

export default function AdvertiserMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f6f8f7] px-6 py-10">
          <div className="mx-auto max-w-[1200px] animate-pulse">
            <div className="h-64 rounded-3xl bg-[#e7eee9]" />
            <div className="mt-8 h-32 rounded-2xl bg-white" />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-80 rounded-2xl bg-white" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <MarketplaceListings searchParams={searchParams} />
    </Suspense>
  );
}

async function MarketplaceListings({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await connection();

  const user = await requireRole("ADVERTISER");
  const params = await searchParams;

  const search = valueOf(params, "q").trim().slice(0, 100);
  const niche = valueOf(params, "niche").slice(0, 120);

  const serviceTypeValue = valueOf(params, "serviceType");
  const serviceType = [
    "GUEST_POST",
    "SPONSORED_ARTICLE",
    "LINK_INSERTION",
    "BANNER_ADVERTISEMENT",
  ].includes(serviceTypeValue)
    ? (serviceTypeValue as
        | "GUEST_POST"
        | "SPONSORED_ARTICLE"
        | "LINK_INSERTION"
        | "BANNER_ADVERTISEMENT")
    : undefined;

  const linkTypeValue = valueOf(params, "linkType");
  const linkType = [
    "DOFOLLOW",
    "NOFOLLOW",
    "BOTH",
    "NOT_APPLICABLE",
  ].includes(linkTypeValue)
    ? (linkTypeValue as
        | "DOFOLLOW"
        | "NOFOLLOW"
        | "BOTH"
        | "NOT_APPLICABLE")
    : undefined;

  const contentWriting = ["yes", "no"].includes(
    valueOf(params, "contentWriting"),
  )
    ? valueOf(params, "contentWriting") === "yes"
    : undefined;

  const minPrice = boundedNumber(valueOf(params, "minPrice"));
  const maxPrice = boundedNumber(valueOf(params, "maxPrice"));
  const minTraffic = boundedNumber(valueOf(params, "minTraffic"), true);
  const maxTraffic = boundedNumber(valueOf(params, "maxTraffic"), true);

  const sortValue = valueOf(params, "sort");
  const sort = [
    "price-asc",
    "price-desc",
    "traffic-asc",
    "traffic-desc",
  ].includes(sortValue)
    ? sortValue
    : "price-asc";

  const requestedPage = boundedNumber(valueOf(params, "page"), true) ?? 1;
  const pageSize = 12;

  const where = {
    isActive: true,
    archivedAt: null,
    ...(serviceType ? { serviceType } : {}),
    ...(linkType ? { linkType } : {}),
    ...(contentWriting === undefined
      ? {}
      : { contentWritingIncluded: contentWriting }),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    website: {
      approvalStatus: "APPROVED" as const,
      ...(niche ? { websiteNiche: niche } : {}),
      ...(minTraffic !== undefined || maxTraffic !== undefined
        ? {
            monthlyTraffic: {
              ...(minTraffic !== undefined ? { gte: minTraffic } : {}),
              ...(maxTraffic !== undefined ? { lte: maxTraffic } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { websiteName: { contains: search } },
              { websiteUrl: { contains: search } },
            ],
          }
        : {}),
    },
  };

  const orderBy =
    sort === "price-desc"
      ? [{ price: "desc" as const }, { createdAt: "desc" as const }]
      : sort === "traffic-asc"
        ? [
            { website: { monthlyTraffic: "asc" as const } },
            { createdAt: "desc" as const },
          ]
        : sort === "traffic-desc"
          ? [
              { website: { monthlyTraffic: "desc" as const } },
              { createdAt: "desc" as const },
            ]
          : [{ price: "asc" as const }, { createdAt: "desc" as const }];

  const [total, niches, purchasedOrders, cartItems] = await Promise.all([
    prisma.publisherService.count({ where }),

    prisma.publisherWebsite.findMany({
      where: {
        approvalStatus: "APPROVED",
        services: {
          some: {
            isActive: true,
            archivedAt: null,
          },
        },
      },
      distinct: ["websiteNiche"],
      orderBy: { websiteNiche: "asc" },
      select: { websiteNiche: true },
    }),

    prisma.order.findMany({
      where: {
        advertiserId: user.id,
        source: "DIRECT_PURCHASE",
        paymentStatus: "PAID",
        publisherServiceId: { not: null },
      },
      select: { publisherServiceId: true },
    }),

    prisma.advertiserCartItem.findMany({
      where: { advertiserId: user.id },
      select: { publisherServiceId: true },
    }),
  ]);

  const purchasedServiceIds = new Set(
    purchasedOrders
      .map((order) => order.publisherServiceId)
      .filter((serviceId): serviceId is string => Boolean(serviceId)),
  );
  const cartServiceIds = new Set(
    cartItems.map((item) => item.publisherServiceId),
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);

  const services = await prisma.publisherService.findMany({
    where,
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
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
      website: {
        select: {
          id: true,
          websiteName: true,
          websiteUrl: true,
          websiteLogo: true,
          websiteNiche: true,
          monthlyTraffic: true,
          domainRating: true,
          domainAuthority: true,
          metricsVerified: true,
        },
      },
    },
  });

  const serviceTypes = [
    ["GUEST_POST", "Guest post"],
    ["SPONSORED_ARTICLE", "Sponsored article"],
    ["LINK_INSERTION", "Link insertion"],
    ["BANNER_ADVERTISEMENT", "Banner advertisement"],
  ];

  const hasActiveFilters = Boolean(
    search ||
      niche ||
      serviceType ||
      linkType ||
      contentWriting !== undefined ||
      minPrice !== undefined ||
      maxPrice !== undefined ||
      minTraffic !== undefined ||
      maxTraffic !== undefined ||
      (sortValue && sortValue !== "price-asc"),
  );

  const labelCls =
    "text-[11px] font-bold uppercase tracking-[0.09em] text-[#65766e]";

  const inputCls =
    "h-11 w-full rounded-xl border border-[#dfe8e2] bg-[#fbfdfb] px-3.5 text-[13px] font-medium text-[#203d33] outline-none transition-all placeholder:font-normal placeholder:text-[#9aa8a1] hover:border-[#b9cbbf] focus:border-[#0e7a5a] focus:bg-white focus:ring-4 focus:ring-[#0e7a5a]/10";

  const selectCls = `${inputCls} cursor-pointer appearance-none pr-10`;

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#12211c] antialiased">
      {/* Navigation */}
      <header className="sticky top-0 z-30 border-b border-[#e5eae8] bg-white/85 backdrop-blur-xl">
        <div className="flex h-[72px] w-full items-center justify-between px-6 sm:px-10 lg:px-14">
          <Link
            href="/"
            aria-label="LinkLedger home"
            className="group inline-flex items-center gap-2.5 text-[19px] font-bold tracking-tight"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-[#0e7a5a] text-[18px] text-white shadow-[0_4px_12px_rgba(14,122,90,0.2)] transition-transform duration-200 group-hover:rotate-[-5deg]">
              L
            </span>
            <span>LinkLedger</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/advertiser/cart"
              aria-label={`Cart, ${cartItems.length} ${cartItems.length === 1 ? "item" : "items"}`}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#dcebe2] px-3 text-[13px] font-semibold text-[#52665b] transition-colors hover:bg-[#f1f7f2] hover:text-[#0e7a5a]"
            >
              <ShoppingCart size={16} />
              <span>Cart</span>
              <span className="grid min-w-5 place-items-center rounded-full bg-[#e8f3ed] px-1.5 py-0.5 text-[11px] font-bold text-[#0e7a5a]">
                {cartItems.length}
              </span>
            </Link>
            <Link
              href="/advertiser/orders"
              className="hidden items-center gap-2 text-[13px] font-semibold text-[#65766e] transition-colors hover:text-[#0e7a5a] sm:inline-flex"
            >
              <CalendarDays size={15} />
              My orders
            </Link>
            <AdvertiserAccountMenu />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1440px] px-6 pb-16 pt-7 sm:px-10 lg:px-14">
        {/* Hero */}
        <section className="relative isolate overflow-hidden rounded-3xl bg-[#0b2e24] text-white shadow-[0_22px_55px_-35px_rgba(11,46,36,0.65)]">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.075)_1px,transparent_0)] bg-[length:22px_22px]"
          />
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-36 -z-10 size-[440px] rounded-full bg-[#0e7a5a]/30 blur-[90px]"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-40 left-[35%] -z-10 size-[300px] rounded-full bg-emerald-400/10 blur-[85px]"
          />

          <div className="relative grid gap-10 px-7 py-9 sm:px-10 sm:py-11 lg:grid-cols-[1fr_auto] lg:items-end lg:px-12 lg:py-12">
            <div className="max-w-[680px]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100/15 bg-white/[0.08] px-3.5 py-2 text-[11px] font-semibold tracking-wide text-emerald-100">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-50" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-300" />
                </span>
                ADVERTISER WORKSPACE
              </div>

              <h1 className="max-w-[620px] text-[36px] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-[48px] lg:text-[56px]">
                Find the right
                <span className="block text-emerald-300">
                  place to publish.
                </span>
              </h1>

              <p className="mt-5 max-w-[540px] text-[14px] leading-7 text-emerald-50/70 sm:text-[15px]">
                Discover quality publishers, compare website metrics and find
                publishing opportunities that fit your campaign.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#marketplace-results"
                  className="group inline-flex min-h-11 items-center gap-2 rounded-xl  px-5 text-[13px] font-bold text-[#0b2e24] shadow-sm transition-all duration-200 hover:-translate-y-0.5  hover:shadow-lg"
                >
                  Explore publishers
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>
                <span className="inline-flex items-center gap-2 px-2 text-[12px] font-medium text-emerald-100/65">
                  <BadgeCheck size={15} className="text-emerald-300" />
                  Approved websites only
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:min-w-[300px]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-100/65">
                    Matching services 
                  </span>
                  {/* <Globe2 size={16} className="text-emerald-300" /> */}
                </div>
                <p className="mt-3 text-[32px] font-semibold tracking-tight tabular-nums">
                  {total.toLocaleString()}
                </p>
           
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-100/65">
                    Available niches
                  </span>
                </div>
                <p className="mt-3 text-[32px] font-semibold tracking-tight tabular-nums">
                  {niches.length.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/[0.10] px-7 py-3.5 text-[11px] text-emerald-50/60 sm:px-10 lg:px-12">
            <span className="inline-flex items-center gap-2">
              <Sparkles size={13} className="text-emerald-300" />
              Find publishing opportunities for your next campaign
            </span>
          </div>
        </section>

        {/* Filters */}
        <section className="relative z-10 mt-7">
          <form
            method="get"
            className="overflow-hidden rounded-2xl border border-[#e3ebe6] bg-white shadow-[0_8px_30px_-24px_rgba(18,33,28,0.22)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf1ee] px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[#e8f3ed] text-[#0e7a5a]">
                  <SlidersHorizontal size={18} />
                </span>
                <div>
                  <h2 className="text-[15px] font-bold tracking-tight text-[#203d33]">
                    Discover your ideal publisher
                  </h2>
                  <p className="mt-0.5 text-[11px] text-[#82918b]">
                    Refine your search to find the right match.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f3ed] px-3 py-1.5 text-[10px] font-bold text-[#0e7a5a]">
                    <CheckCircle2 size={12} />
                    Filters active
                  </span>
                )}
                <Link
                  href="/advertiser/marketplace"
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold text-[#7a8981] transition-colors hover:bg-[#f2f7f3] hover:text-[#0e7a5a]"
                >
                  <X size={14} />
                  Reset
                </Link>
              </div>
            </div>

            <div className="px-5 py-6 sm:px-7">
              <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                <label className="flex flex-col gap-2 sm:col-span-2 lg:col-span-4">
                  <span className={labelCls}>Search websites</span>
                  <span className="group relative block">
                    <Search
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#93a199] transition-colors group-focus-within:text-[#0e7a5a]"
                    />
                    <input
                      className={`${inputCls} h-12 rounded-xl pl-11 pr-4`}
                      name="q"
                      defaultValue={search}
                      placeholder="Search by website name or URL..."
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 text-[10px] text-[#a0aca5] sm:block">
                      WEBSITE SEARCH
                    </span>
                  </span>
                </label>

                <label className="flex flex-col gap-2">
                  <span className={labelCls}>Website niche</span>
                  <span className="relative block">
                    <select
                      className={selectCls}
                      name="niche"
                      defaultValue={niche}
                    >
                      <option value="">All niches</option>
                      {niches.map(({ websiteNiche }) => (
                        <option value={websiteNiche} key={websiteNiche}>
                          {websiteNiche}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#899890]"
                    />
                  </span>
                </label>

                <label className="flex flex-col gap-2">
                  <span className={labelCls}>Service type</span>
                  <span className="relative block">
                    <select
                      className={selectCls}
                      name="serviceType"
                      defaultValue={serviceType ?? ""}
                    >
                      <option value="">All services</option>
                      {serviceTypes.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#899890]"
                    />
                  </span>
                </label>

                <label className="flex flex-col gap-2">
                  <span className={labelCls}>Link type</span>
                  <span className="relative block">
                    <select
                      className={selectCls}
                      name="linkType"
                      defaultValue={linkType ?? ""}
                    >
                      <option value="">Any link type</option>
                      <option value="DOFOLLOW">Do-follow</option>
                      <option value="NOFOLLOW">No-follow</option>
                      <option value="BOTH">Both</option>
                      <option value="NOT_APPLICABLE">Not applicable</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#899890]"
                    />
                  </span>
                </label>

                <label className="flex flex-col gap-2">
                  <span className={labelCls}>Content writing</span>
                  <span className="relative block">
                    <select
                      className={selectCls}
                      name="contentWriting"
                      defaultValue={valueOf(params, "contentWriting")}
                    >
                      <option value="">Any option</option>
                      <option value="yes">Writing included</option>
                      <option value="no">Content supplied</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#899890]"
                    />
                  </span>
                </label>
              </div>

              {/* Advanced filters */}
              <details
                className="group mt-6 overflow-hidden rounded-2xl border border-[#e5ede7] bg-[#fbfdfb]"
                open={Boolean(
                  valueOf(params, "minPrice") ||
                    valueOf(params, "maxPrice") ||
                    valueOf(params, "minTraffic") ||
                    valueOf(params, "maxTraffic") ||
                    (sortValue && sortValue !== "price-asc"),
                )}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-[#f3f8f4] [&::-webkit-details-marker]:hidden sm:px-5">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e8f3ed] text-[#0e7a5a]">
                      <Filter size={16} />
                    </span>
                    <span>
                      <span className="block text-[13px] font-bold text-[#203d33]">
                        Advanced filters
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[#82918b]">
                        Set your budget, traffic requirements and sorting
                        preferences
                      </span>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-[11px] font-semibold text-[#6e7f75]">
                    Customize
                    <ChevronDown
                      size={17}
                      className="transition-transform duration-200 group-open:rotate-180"
                    />
                  </span>
                </summary>

                <div className="border-t border-[#e8eee9] px-4 py-5 sm:px-5">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="flex flex-col gap-2">
                      <span className={labelCls}>Minimum price</span>
                      <input
                        className={inputCls}
                        name="minPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 50"
                        defaultValue={valueOf(params, "minPrice")}
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className={labelCls}>Maximum price</span>
                      <input
                        className={inputCls}
                        name="maxPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="No limit"
                        defaultValue={valueOf(params, "maxPrice")}
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className={labelCls}>Minimum monthly traffic</span>
                      <input
                        className={inputCls}
                        name="minTraffic"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="e.g. 1,000"
                        defaultValue={valueOf(params, "minTraffic")}
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className={labelCls}>Maximum monthly traffic</span>
                      <input
                        className={inputCls}
                        name="maxTraffic"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="No limit"
                        defaultValue={valueOf(params, "maxTraffic")}
                      />
                    </label>

                    <label className="flex flex-col gap-2 sm:col-span-2">
                      <span className={labelCls}>Sort results by</span>
                      <span className="relative block">
                        <select
                          className={selectCls}
                          name="sort"
                          defaultValue={sort}
                        >
                          <option value="price-asc">Price: low to high</option>
                          <option value="price-desc">Price: high to low</option>
                          <option value="traffic-asc">
                            Traffic: low to high
                          </option>
                          <option value="traffic-desc">
                            Traffic: high to low
                          </option>
                        </select>
                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#899890]"
                        />
                      </span>
                    </label>
                  </div>
                </div>
              </details>

              <div className="mt-5 flex flex-col-reverse gap-3 border-t border-[#edf1ee] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] leading-relaxed text-[#82918b]">
                  Combine filters to narrow down your publishing opportunities.
                </p>

                <button
                  type="submit"
                  className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0e7a5a] px-7 text-[13px] font-bold text-white shadow-[0_5px_14px_rgba(14,122,90,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0a6149] hover:shadow-[0_9px_20px_rgba(14,122,90,0.24)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a] sm:w-auto"
                >
                  <Search size={15} />
                  Apply filters
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Marketplace results */}
        <section id="marketplace-results" className="mt-10 scroll-mt-24">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0e7a5a]">
                <span className="size-1.5 rounded-full bg-[#0e7a5a]" />
                EXPLORE PUBLISHERS
              </div>
              <h2 className="text-[25px] font-semibold tracking-[-0.035em] text-[#172d24] sm:text-[30px]">
                Publishing opportunities
              </h2>
              <p className="mt-2 text-[13px] text-[#78877f]">
                Compare services and find the right fit for your campaign.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-xl border border-[#e2ebe5] bg-white px-3.5 py-2.5 text-[11px] font-semibold text-[#52665b] shadow-sm">
                <BarChart3 size={14} className="text-[#0e7a5a]" />
                {total.toLocaleString()} result{total === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-[#e2ebe5] bg-white px-3.5 py-2.5 text-[11px] font-semibold text-[#52665b] shadow-sm">
                Page {page} / {totalPages}
              </span>
            </div>
          </div>

          {services.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {services.map((service) => (
                <article
                  key={service.id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e3eae5] bg-white shadow-[0_3px_14px_-12px_rgba(18,33,28,0.2)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b8d9cb] hover:shadow-[0_22px_38px_-25px_rgba(14,122,90,0.35)]"
                >
                  {/* Website preview */}
                  <div className="relative h-[158px] overflow-hidden bg-[#e8f0ea]">
                    <MarketplaceWebsitePreview
                      logoUrl={service.website.websiteLogo}
                      websiteName={service.website.websiteName}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#102b21]/45 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

                    <span className="absolute left-3.5 top-3.5 max-w-[58%] truncate rounded-lg border border-white/60 bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-[#40564c] shadow-sm backdrop-blur-sm">
                      {service.website.websiteNiche}
                    </span>

                    <span className="absolute right-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#0b2e24]/90 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
                      <CheckCircle2 size={11} className="text-emerald-300" />
                      {service.website.metricsVerified
                        ? "Verified"
                        : "Approved"}
                    </span>

                    <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 px-3.5 pb-3.5">
                      {service.website.domainRating !== null && (
                        <span className="rounded-lg border border-white/30 bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-[#264b3e] shadow-sm">
                          DR{" "}
                          <span className="text-[#0e7a5a]">
                            {service.website.domainRating}
                          </span>
                        </span>
                      )}

                      {service.website.domainAuthority !== null && (
                        <span className="rounded-lg border border-white/30 bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-[#264b3e] shadow-sm">
                          DA{" "}
                          <span className="text-[#0e7a5a]">
                            {service.website.domainAuthority}
                          </span>
                        </span>
                      )}

                      <span className="rounded-lg border border-white/30 bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-[#264b3e] shadow-sm">
                        <span className="text-[#0e7a5a]">
                          {service.website.monthlyTraffic.toLocaleString()}
                        </span>{" "}
                        monthly visits
                      </span>
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <Link
                        href={`/advertiser/marketplace/${service.website.id}`}
                        className="min-w-0 truncate text-[12px] font-bold text-[#426052] transition-colors hover:text-[#0e7a5a]"
                      >
                        {service.website.websiteName}
                      </Link>

                      <span className="shrink-0 rounded-md bg-[#f0f5f1] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#5e7467]">
                        {formatServiceType(service.serviceType)}
                      </span>
                    </div>

                    <h3 className="mt-3 min-h-[48px] break-words text-[17px] font-bold leading-[1.4] tracking-[-0.02em] text-[#172d24] transition-colors group-hover:text-[#0e7a5a]">
                      {service.serviceName}
                    </h3>

                    <a
                      href={service.website.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate text-[11px] font-medium text-[#7b8c82] transition-colors hover:text-[#0e7a5a]"
                    >
                      <Globe2 size={12} className="shrink-0" />
                      <span className="truncate">
                        {service.website.websiteUrl}
                      </span>
                      <ArrowUpRight size={11} className="shrink-0" />
                    </a>

                    <p className="mt-3 min-h-[4.7rem] line-clamp-3 whitespace-pre-wrap text-[12px] leading-[1.7] text-[#718078]">
                      {service.description}
                    </p>

                    {/* Service features */}
                    <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-3 border-t border-[#edf1ee] py-4">
                      <span className="inline-flex min-w-0 items-center gap-2 text-[10px] font-medium text-[#62736a]">
                        <Clock3
                          size={13}
                          className="shrink-0 text-[#0e7a5a]"
                        />
                        <span className="truncate">
                          {service.deliveryTimeDays} day
                          {service.deliveryTimeDays === 1 ? "" : "s"}
                        </span>
                      </span>

                      <span className="inline-flex min-w-0 items-center gap-2 text-[10px] font-medium text-[#62736a]">
                        <PenLine
                          size={13}
                          className="shrink-0 text-[#0e7a5a]"
                        />
                        <span className="truncate">
                          {service.contentWritingIncluded
                            ? "Writing included"
                            : "Content supplied"}
                        </span>
                      </span>

                      <span className="inline-flex min-w-0 items-center gap-2 text-[10px] font-medium text-[#62736a]">
                        <Link2
                          size={13}
                          className="shrink-0 text-[#0e7a5a]"
                        />
                        <span className="truncate">
                          {formatServiceLinkType(service.linkType)}
                          {service.maximumLinks
                            ? ` · ${service.maximumLinks} max`
                            : ""}
                        </span>
                      </span>

                      <span className="inline-flex min-w-0 items-center gap-2 text-[10px] font-medium text-[#62736a]">
                        <House
                          size={13}
                          className="shrink-0 text-[#0e7a5a]"
                        />
                        <span className="truncate">
                          {service.homepageLinkAvailable
                            ? "Homepage link"
                            : "No homepage link"}
                        </span>
                      </span>
                    </div>

                    {/* Price and details */}
                    <div className="mt-auto flex items-end justify-between gap-2 border-t border-[#edf1ee] pt-4">
                      <div className="min-w-0">
                        <span className="mb-1 block text-[10px] font-medium text-[#89978f]">
                          Starting at
                        </span>
                        <strong className="whitespace-nowrap text-[22px] font-bold tracking-tight tabular-nums text-[#17382b]">
                          {new Intl.NumberFormat("en", {
                            style: "currency",
                            currency: service.currency,
                          }).format(Number(service.price))}
                        </strong>
                      </div>

                      <Link
                        href={`/advertiser/marketplace/${service.website.id}`}
                        aria-label={`View ${service.website.websiteName} details`}
                        className="group/details inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-2 text-[11px] font-bold text-[#0e7a5a] transition-colors hover:bg-[#edf6f0]"
                      >
                        Details
                        <ArrowRight
                          size={13}
                          className="transition-transform group-hover/details:translate-x-0.5"
                        />
                      </Link>
                    </div>

                    {!purchasedServiceIds.has(service.id) && (
                      <div className="mt-4">
                        <AddToCartButton
                          serviceId={service.id}
                          alreadyInCart={cartServiceIds.has(service.id)}
                        />
                      </div>
                    )}

                    <div className="mt-2">
                      <BuyNowButton
                        serviceId={service.id}
                        alreadyPurchased={purchasedServiceIds.has(service.id)}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="relative flex min-h-[350px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-[#c5d9cc] bg-white px-6 py-12 text-center">
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-20 size-56 rounded-full bg-[#e8f3ed] blur-3xl"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-20 -left-16 size-56 rounded-full bg-[#edf5ef] blur-3xl"
              />

              <div className="relative">
                <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-[#dcebe0] bg-[#eaf5ed] text-[#0e7a5a] shadow-sm">
                  <Globe2 size={28} />
                </span>

                <h3 className="mt-5 text-[22px] font-bold tracking-tight text-[#203d33]">
                  No matching services found
                </h3>

                <p className="mx-auto mt-2 max-w-[440px] text-[13px] leading-6 text-[#78877f]">
                  We couldn&apos;t find any services matching your current
                  selection. Try adjusting your filters to discover more
                  publishing opportunities.
                </p>

                <Link
                  href="/advertiser/marketplace"
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0e7a5a] px-5 text-[12px] font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#0a6149] hover:shadow-md"
                >
                  <X size={14} />
                  Clear all filters
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Marketplace pages"
              className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#e3ebe6] bg-white px-5 py-4 shadow-sm sm:flex-row sm:px-6"
            >
              <p className="text-[11px] text-[#82918b]">
                Showing page{" "}
                <span className="font-bold text-[#203d33]">{page}</span> of{" "}
                <span className="font-bold text-[#203d33]">{totalPages}</span>
              </p>

              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <Link
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e1e9e3] bg-white px-4 text-[12px] font-semibold text-[#52665b] transition-colors hover:border-[#b8d9cb] hover:bg-[#f1f7f2] hover:text-[#0e7a5a]"
                    href={pageHref(params, page - 1)}
                  >
                    <ArrowLeft size={14} />
                    Previous
                  </Link>
                ) : (
                  <span />
                )}

                <span className="grid size-10 place-items-center rounded-xl bg-[#e8f3ed] text-[12px] font-bold text-[#0e7a5a]">
                  {page}
                </span>

                {page < totalPages ? (
                  <Link
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#0e7a5a] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#0a6149]"
                    href={pageHref(params, page + 1)}
                  >
                    Next
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <span />
                )}
              </div>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
