
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  BriefcaseBusiness,
  PackageOpen,
} from "lucide-react";
import { notFound } from "next/navigation";
import { requirePublisherProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatServiceType } from "@/components/publisher/service-options";
import { PublisherServiceControls } from "@/components/publisher/PublisherServiceControls";
import { PublisherAccountMenu } from "@/components/publisher/PublisherAccountMenu";

type WebsiteServicesPageProps = {
  params: Promise<{ websiteId: string }>;
};

export default async function WebsiteServicesPage({
  params,
}: WebsiteServicesPageProps) {
  await connection();

  const user = await requirePublisherProfile();
  const { websiteId } = await params;

  const website = await prisma.publisherWebsite.findFirst({
    where: {
      id: websiteId,
      publisherProfile: { userId: user.id },
    },
    select: {
      id: true,
      websiteName: true,
    },
  });

  if (!website) notFound();

  const services = await prisma.publisherService.findMany({
    where: { publisherWebsiteId: website.id },
    orderBy: [
      { serviceType: "asc" },
      { serviceName: "asc" },
      { createdAt: "desc" },
    ],
  });

  const addServiceUrl = `/publisher/websites/${website.id}/services/add`;
  const websiteUrl = `/publisher/websites/${website.id}`;

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#12211c] antialiased">

      {/* Header */}
      <header className="border-b border-[#e5eae8] bg-white">
        <div className="mx-auto flex h-[72px] w-[calc(100%-40px)] max-w-[1040px] items-center justify-between">
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

      {/* Main Content */}
      <section className="mx-auto w-[calc(100%-40px)] max-w-[1040px] py-10 sm:py-14">

        {/* Page Heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <Link
              href={websiteUrl}
              className="mb-6 inline-flex items-center gap-2 text-[13px] text-[#82918b] transition-colors hover:text-[#0e7a5a]"
            >
              <ArrowLeft size={14} />
              Website details
            </Link>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#dcebe3] bg-[#eaf5ef] px-3 py-1.5 text-xs font-semibold text-[#0a6149]">
              <BriefcaseBusiness size={14} />
              Publisher workspace
            </div>

            <h1 className="break-words text-[30px] font-semibold tracking-[-1px] sm:text-[38px]">
              Services &amp; pricing
            </h1>

            <p className="mt-2 break-words text-[15px] text-[#5f6f69]">
              {website.websiteName}
            </p>
          </div>

          <Link
            href={addServiceUrl}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0e7a5a] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0a6149] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
          >
            <Plus size={17} />
            Add service
          </Link>
        </div>

        {/* Service Summary */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e5eae8] bg-white px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-[#12211c]">
              Your service listings
            </p>
            <p className="mt-1 text-xs text-[#82918b]">
              Manage your offers, pricing and availability.
            </p>
          </div>

          <span className="rounded-lg border border-[#dcebe3] bg-[#eaf5ef] px-3 py-1.5 text-xs font-semibold text-[#0a6149] tabular-nums">
            {services.length} {services.length === 1 ? "service" : "services"}
          </span>
        </div>

        {/* Services List */}
        {services.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-[#e5eae8] bg-white shadow-[0_8px_30px_-25px_rgba(18,33,28,0.2)]">
            {services.map((service) => {
              const status = service.archivedAt
                ? "Archived"
                : service.isActive
                  ? "Active"
                  : "Inactive";

              const statusStyle =
                status === "Active"
                  ? "border-[#dcebe3] bg-[#eaf5ef] text-[#0a6149]"
                  : status === "Inactive"
                    ? "border-[#e5eae8] bg-[#f6f8f7] text-[#65726d]"
                    : "border-[#f0dfc9] bg-[#fff5e9] text-[#895b27]";

              return (
                <article
                  key={service.id}
                  className="flex flex-col gap-5 border-b border-[#edf1ee] p-5 last:border-b-0 transition-colors hover:bg-[#fcfdfc] sm:flex-row sm:items-center sm:justify-between sm:p-6"
                >
                  {/* Service Details */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`${websiteUrl}/services/${service.id}`}
                        className="break-words text-[16px] font-semibold text-[#12211c] transition-colors hover:text-[#0e7a5a]"
                      >
                        {service.serviceName}
                      </Link>

                      <span className="rounded-md border border-[#e5eae8] bg-[#f6f8f7] px-2 py-1 text-[11px] font-semibold text-[#52615b]">
                        {formatServiceType(service.serviceType)}
                      </span>

                      <span
                        className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${statusStyle}`}
                      >
                        {status}
                      </span>
                    </div>

                    <p className="mt-2 text-[13px] leading-relaxed text-[#78847e]">
                      {service.deliveryTimeDays} day
                      {service.deliveryTimeDays === 1 ? "" : "s"} delivery
                      {service.maximumLinks
                        ? ` · Up to ${service.maximumLinks} links`
                        : ""}
                    </p>
                  </div>

                  {/* Price and Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
                    <strong className="text-[19px] font-semibold tabular-nums text-[#12211c]">
                      {new Intl.NumberFormat("en", {
                        style: "currency",
                        currency: service.currency,
                      }).format(Number(service.price))}
                    </strong>

                    {!service.archivedAt && (
                      <PublisherServiceControls
                        websiteId={website.id}
                        serviceId={service.id}
                        isActive={service.isActive}
                      />
                    )}

                    {service.archivedAt && (
                      <span className="text-[12px] text-[#78847e]">
                        Archived {service.archivedAt.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-[#cbd7cf] bg-white px-6 py-10 text-center">
            <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-[#e7f4ed] text-[#0e7a5a]">
              <PackageOpen size={27} strokeWidth={1.7} />
            </div>

            <h2 className="text-[20px] font-semibold tracking-tight">
              No services listed yet
            </h2>

            <p className="mt-2 max-w-[440px] text-sm leading-relaxed text-[#78847e]">
              Add a named service with its price and publishing terms.
              You can list more than one offer for each service type.
            </p>

            <Link
              href={addServiceUrl}
              className="mt-6 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#0e7a5a] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0a6149]"
            >
              <Plus size={16} />
              Add your first service
            </Link>
          </div>
        )}

        {/* Back Link */}
        <Link
          href={websiteUrl}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#5f6f69] transition-colors hover:text-[#0e7a5a]"
        >
          <ArrowLeft size={15} />
          Back to website
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-[#e5eae8] bg-white">
        <div className="mx-auto flex w-[calc(100%-40px)] max-w-[1040px] flex-col justify-between gap-2 py-6 text-[13px] text-[#82918b] sm:flex-row">
          <span>© 2026 LinkLedger</span>

          <Link
            href={websiteUrl}
            className="inline-flex items-center gap-1 font-medium transition-colors hover:text-[#0e7a5a]"
          >
            Website details
            <ArrowRight size={13} />
          </Link>
        </div>
      </footer>
    </main>
  );
}
