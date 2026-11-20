import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, Search } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatServiceLinkType, formatServiceType } from "@/components/publisher/service-options";

type SearchParams = Record<string, string | string[] | undefined>;

function valueOf(params: SearchParams, key: string): string {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function boundedNumber(value: string, integer = false): number | undefined {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && (!integer || Number.isInteger(number))
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

export default function AdvertiserMarketplacePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <Suspense fallback={<div className="workspace-page"><p className="workspace-content">Loading marketplace...</p></div>}>
      <MarketplaceListings searchParams={searchParams} />
    </Suspense>
  );
}

async function MarketplaceListings({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await connection();
  await requireRole("ADVERTISER");
  const params = await searchParams;
  const search = valueOf(params, "q").trim().slice(0, 100);
  const niche = valueOf(params, "niche").slice(0, 120);
  const serviceTypeValue = valueOf(params, "serviceType");
  const serviceType = ["GUEST_POST", "SPONSORED_ARTICLE", "LINK_INSERTION", "BANNER_ADVERTISEMENT"].includes(serviceTypeValue)
    ? serviceTypeValue as "GUEST_POST" | "SPONSORED_ARTICLE" | "LINK_INSERTION" | "BANNER_ADVERTISEMENT"
    : undefined;
  const linkTypeValue = valueOf(params, "linkType");
  const linkType = ["DOFOLLOW", "NOFOLLOW", "BOTH", "NOT_APPLICABLE"].includes(linkTypeValue)
    ? linkTypeValue as "DOFOLLOW" | "NOFOLLOW" | "BOTH" | "NOT_APPLICABLE"
    : undefined;
  const contentWriting = ["yes", "no"].includes(valueOf(params, "contentWriting"))
    ? valueOf(params, "contentWriting") === "yes"
    : undefined;
  const minPrice = boundedNumber(valueOf(params, "minPrice"));
  const maxPrice = boundedNumber(valueOf(params, "maxPrice"));
  const minTraffic = boundedNumber(valueOf(params, "minTraffic"), true);
  const maxTraffic = boundedNumber(valueOf(params, "maxTraffic"), true);
  const sortValue = valueOf(params, "sort");
  const sort = ["price-asc", "price-desc", "traffic-asc", "traffic-desc"].includes(sortValue)
    ? sortValue
    : "price-asc";
  const requestedPage = boundedNumber(valueOf(params, "page"), true) ?? 1;
  const pageSize = 12;

  const where = {
    isActive: true,
    archivedAt: null,
    ...(serviceType ? { serviceType } : {}),
    ...(linkType ? { linkType } : {}),
    ...(contentWriting === undefined ? {} : { contentWritingIncluded: contentWriting }),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? { price: { ...(minPrice !== undefined ? { gte: minPrice } : {}), ...(maxPrice !== undefined ? { lte: maxPrice } : {}) } }
      : {}),
    website: {
      approvalStatus: "APPROVED" as const,
      ...(niche ? { websiteNiche: niche } : {}),
      ...(minTraffic !== undefined || maxTraffic !== undefined
        ? { monthlyTraffic: { ...(minTraffic !== undefined ? { gte: minTraffic } : {}), ...(maxTraffic !== undefined ? { lte: maxTraffic } : {}) } }
        : {}),
      ...(search ? { OR: [{ websiteName: { contains: search } }, { websiteUrl: { contains: search } }] } : {}),
    },
  };

  const orderBy = sort === "price-desc"
    ? [{ price: "desc" as const }, { createdAt: "desc" as const }]
    : sort === "traffic-asc"
      ? [{ website: { monthlyTraffic: "asc" as const } }, { createdAt: "desc" as const }]
      : sort === "traffic-desc"
        ? [{ website: { monthlyTraffic: "desc" as const } }, { createdAt: "desc" as const }]
        : [{ price: "asc" as const }, { createdAt: "desc" as const }];

  const [total, niches] = await Promise.all([
    prisma.publisherService.count({ where }),
    prisma.publisherWebsite.findMany({
      where: { approvalStatus: "APPROVED", services: { some: { isActive: true, archivedAt: null } } },
      distinct: ["websiteNiche"],
      orderBy: { websiteNiche: "asc" },
      select: { websiteNiche: true },
    }),
  ]);
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
          websiteNiche: true,
          monthlyTraffic: true,
          domainRating: true,
          domainAuthority: true,
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

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#12211c] antialiased">
      <header className="border-b border-[#e5eae8] bg-white">
        <div className="mx-auto flex h-[72px] w-[calc(100%-40px)] max-w-[1040px] items-center justify-between">
          <Link href="/" aria-label="LinkLedger home" className="inline-flex items-center gap-2.5 text-[19px] font-bold">
            <span className="grid size-8 place-items-center rounded-lg bg-[#0e7a5a] text-[17px] text-white">L</span>
            LinkLedger
          </Link>
          <nav className="flex items-center gap-5 text-sm font-semibold text-[#5f6f69]">
            <Link href="/advertiser/requests" className="hover:text-[#0e7a5a]">My requests</Link>
            <Link href="/advertiser/dashboard" className="hover:text-[#0e7a5a]">Dashboard</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto w-[calc(100%-40px)] max-w-[1040px] py-10 sm:py-14">
        <div className="mb-8">
          <p className="eyebrow">Advertiser workspace</p>
          <h1 className="mt-2 text-[32px] font-semibold tracking-[-1px] sm:text-[38px]">Publisher marketplace</h1>
          <p className="mt-3 max-w-[650px] text-[15px] leading-relaxed text-[#5f6f69]">Compare active publishing services from approved websites.</p>
        </div>

        <form method="get" className="mb-6 grid gap-3 border border-[#e0e7e2] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="field sm:col-span-2 lg:col-span-4">
            <span>Search websites</span>
            <span className="search-box"><Search size={16} /><input name="q" defaultValue={search} placeholder="Website name or URL" /></span>
          </label>
          <label className="field"><span>Niche</span><select className="h-[42px] border border-[#d5ded8] bg-white px-3 text-[12px]" name="niche" defaultValue={niche}><option value="">All niches</option>{niches.map(({ websiteNiche }) => <option value={websiteNiche} key={websiteNiche}>{websiteNiche}</option>)}</select></label>
          <label className="field"><span>Service type</span><select className="h-[42px] border border-[#d5ded8] bg-white px-3 text-[12px]" name="serviceType" defaultValue={serviceType ?? ""}><option value="">All services</option>{serviceTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="field"><span>Link type</span><select className="h-[42px] border border-[#d5ded8] bg-white px-3 text-[12px]" name="linkType" defaultValue={linkType ?? ""}><option value="">Any link type</option><option value="DOFOLLOW">Do-follow</option><option value="NOFOLLOW">No-follow</option><option value="BOTH">Both</option><option value="NOT_APPLICABLE">Not applicable</option></select></label>
          <label className="field"><span>Content writing</span><select className="h-[42px] border border-[#d5ded8] bg-white px-3 text-[12px]" name="contentWriting" defaultValue={valueOf(params, "contentWriting")}><option value="">Any</option><option value="yes">Included</option><option value="no">Not included</option></select></label>
          <label className="field"><span>Minimum price</span><input name="minPrice" type="number" min="0" step="0.01" defaultValue={valueOf(params, "minPrice")} /></label>
          <label className="field"><span>Maximum price</span><input name="maxPrice" type="number" min="0" step="0.01" defaultValue={valueOf(params, "maxPrice")} /></label>
          <label className="field"><span>Minimum monthly traffic</span><input name="minTraffic" type="number" min="0" step="1" defaultValue={valueOf(params, "minTraffic")} /></label>
          <label className="field"><span>Maximum monthly traffic</span><input name="maxTraffic" type="number" min="0" step="1" defaultValue={valueOf(params, "maxTraffic")} /></label>
          <label className="field"><span>Sort by</span><select className="h-[42px] border border-[#d5ded8] bg-white px-3 text-[12px]" name="sort" defaultValue={sort}><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="traffic-asc">Traffic: low to high</option><option value="traffic-desc">Traffic: high to low</option></select></label>
          <div className="flex items-end gap-3 pb-px"><button className="primary-button min-h-[42px]" type="submit"><Search size={15} />Apply filters</button><Link className="text-sm font-semibold text-[#65726d] hover:text-[#0e7a5a]" href="/advertiser/marketplace">Clear</Link></div>
        </form>

        <p className="mb-3 text-[12px] text-[#78847e]">{total.toLocaleString()} service{total === 1 ? "" : "s"} · page {page} of {totalPages}</p>

        {services.length ? (
          <div className="overflow-hidden rounded-lg border border-[#e0e7e2] bg-white">
            {services.map((service) => (
              <article className="grid gap-5 border-b border-[#edf1ee] p-5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6" key={service.id}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words text-[17px] font-semibold text-[#203d33]"><Link href={`/advertiser/marketplace/${service.website.id}`} className="hover:text-[#0e7a5a]">{service.website.websiteName}</Link></h2>
                    <span className="rounded border border-[#dce5df] bg-[#f6f8f7] px-2 py-1 text-[11px] font-semibold text-[#52615b]">{formatServiceType(service.serviceType)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#78847e]">
                    <a href={service.website.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#286d5d] hover:text-[#0a6149]">
                      {service.website.websiteUrl} <ArrowUpRight size={13} />
                    </a>
                    <span>{service.website.websiteNiche}</span>
                    <span>{service.website.monthlyTraffic.toLocaleString()} monthly visits</span>
                    {service.website.domainRating !== null && <span>DR {service.website.domainRating}</span>}
                    {service.website.domainAuthority !== null && <span>DA {service.website.domainAuthority}</span>}
                  </div>
                  <h3 className="mt-3 text-[14px] font-semibold text-[#203d33]">{service.serviceName}</h3>
                  <p className="mt-3 max-w-[740px] whitespace-pre-wrap text-[14px] leading-relaxed text-[#5f6f69]">{service.description}</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-[#65726d]">
                    <span>{service.deliveryTimeDays} day{service.deliveryTimeDays === 1 ? "" : "s"} delivery</span>
                    <span>{service.contentWritingIncluded ? "Writing included" : "Advertiser provides content"}</span>
                    <span>{formatServiceLinkType(service.linkType)} links{service.maximumLinks ? ` · up to ${service.maximumLinks}` : ""}</span>
                    {service.homepageLinkAvailable && <span>Homepage placement available</span>}
                    <span className="inline-flex items-center gap-1 text-[#2e7151]"><CheckCircle2 size={13} /> Approved website</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end">
                  <strong className="whitespace-nowrap text-[20px] font-semibold tabular-nums text-[#203d33]">
                    {new Intl.NumberFormat("en", { style: "currency", currency: service.currency }).format(Number(service.price))}
                  </strong>
                  <Link href={`/advertiser/marketplace/${service.website.id}?serviceId=${service.id}#request`} className="inline-flex min-h-10 items-center gap-2 bg-[#0e7a5a] px-4 text-sm font-semibold text-white hover:bg-[#0a6149]">View details <ArrowRight size={15} /></Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-[#cbd7cf] bg-white px-6 text-center">
            <h2 className="text-[20px] font-semibold">No services available yet</h2>
            <p className="mt-2 max-w-[440px] text-sm leading-relaxed text-[#78847e]">Active services appear here after their websites are approved.</p>
          </div>
        )}
        {totalPages > 1 && <nav aria-label="Marketplace pages" className="mt-5 flex items-center justify-between">
          {page > 1 ? <Link className="secondary-button min-h-10" href={pageHref(params, page - 1)}><ArrowLeft size={15} />Previous</Link> : <span />}
          <span className="text-[12px] text-[#78847e]">Page {page} of {totalPages}</span>
          {page < totalPages ? <Link className="secondary-button min-h-10" href={pageHref(params, page + 1)}>Next<ArrowRight size={15} /></Link> : <span />}
        </nav>}
      </section>
    </main>
  );
}