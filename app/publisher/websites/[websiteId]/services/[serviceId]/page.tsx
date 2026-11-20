import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { PublisherServiceControls } from "@/components/publisher/PublisherServiceControls";
import { formatServiceLinkType, formatServiceType } from "@/components/publisher/service-options";
import { requirePublisherProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ServiceDetailsPageProps = { params: Promise<{ websiteId: string; serviceId: string }> };

export default async function PublisherServiceDetailsPage({ params }: ServiceDetailsPageProps) {
  await connection();
  const user = await requirePublisherProfile();
  const { websiteId, serviceId } = await params;
  const service = await prisma.publisherService.findFirst({
    where: {
      id: serviceId,
      publisherWebsiteId: websiteId,
      website: { publisherProfile: { userId: user.id } },
    },
    include: { website: { select: { websiteName: true, websiteUrl: true } } },
  });

  if (!service) notFound();

  const archived = service.archivedAt !== null;
  const price = new Intl.NumberFormat("en", { style: "currency", currency: service.currency }).format(Number(service.price));

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#12211c] antialiased">
      <header className="border-b border-[#e5eae8] bg-white">
        <div className="mx-auto flex h-[72px] w-[calc(100%-40px)] max-w-[1040px] items-center justify-between">
          <Link href="/" aria-label="LinkLedger home" className="inline-flex items-center gap-2.5 text-[19px] font-bold">
            <span className="grid size-8 place-items-center rounded-lg bg-[#0e7a5a] text-[17px] text-white">L</span>
            LinkLedger
          </Link>
          <Link href={`/publisher/websites/${websiteId}/services`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#5f6f69] hover:text-[#0e7a5a]">
            <ArrowLeft size={16} /> Services &amp; pricing
          </Link>
        </div>
      </header>

      <section className="mx-auto w-[calc(100%-40px)] max-w-[820px] py-10 sm:py-14">
        <Link href={`/publisher/websites/${websiteId}/services`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#5f6f69] hover:text-[#0e7a5a]">
          <ArrowLeft size={15} /> All services
        </Link>

        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow">{service.website.websiteName}</p>
            <h1 className="mt-2 break-words text-[30px] font-semibold tracking-[-1px] sm:text-[38px]">{service.serviceName}</h1>
            <p className="mt-2 text-sm text-[#5f6f69]">{formatServiceType(service.serviceType)}</p>
          </div>
          {!archived && (
            <div className="flex flex-wrap gap-2">
              <Link href={`/publisher/websites/${websiteId}/services/${serviceId}/edit`} className="secondary-button min-h-10 text-[12px]">
                Edit service <ArrowRight size={14} />
              </Link>
              <PublisherServiceControls websiteId={websiteId} serviceId={serviceId} isActive={service.isActive} />
            </div>
          )}
        </div>

        <div className="mb-6 rounded-lg border border-[#e5eae8] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-[#82918b]">Price</p>
              <p className="mt-1 text-[28px] font-semibold tabular-nums text-[#203d33]">{price}</p>
            </div>
            <span className={`rounded px-2.5 py-1.5 text-xs font-semibold ${archived ? "bg-[#fff3e7] text-[#895b27]" : service.isActive ? "bg-[#e5f3e8] text-[#2e7151]" : "bg-[#f1f3f1] text-[#65726d]"}`}>
              {archived ? "Archived" : service.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <a href={service.website.websiteUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#286d5d] hover:text-[#0a6149]">
            {service.website.websiteUrl} <ExternalLink size={13} />
          </a>
        </div>

        <dl className="details-grid rounded-lg border border-[#e5eae8] bg-white px-5 sm:px-6">
          <div><dt>Delivery time</dt><dd>{service.deliveryTimeDays} day{service.deliveryTimeDays === 1 ? "" : "s"}</dd></div>
          <div><dt>Content writing</dt><dd>{service.contentWritingIncluded ? "Included" : "Not included"}</dd></div>
          <div><dt>Link type</dt><dd>{formatServiceLinkType(service.linkType)}</dd></div>
          <div><dt>Maximum links</dt><dd>{service.maximumLinks ?? "Not applicable"}</dd></div>
          <div><dt>Homepage link</dt><dd>{service.homepageLinkAvailable ? "Available" : "Not available"}</dd></div>
          <div><dt>Created</dt><dd>{service.createdAt.toLocaleDateString()}</dd></div>
          <div className="details-grid__wide"><dt>Description</dt><dd className="whitespace-pre-wrap">{service.description}</dd></div>
          <div className="details-grid__wide"><dt>Publishing guidelines</dt><dd className="whitespace-pre-wrap">{service.publishingGuidelines || "Not provided"}</dd></div>
          <div className="details-grid__wide"><dt>Additional conditions</dt><dd className="whitespace-pre-wrap">{service.additionalConditions || "None"}</dd></div>
          {service.archivedAt && <div><dt>Archived</dt><dd>{service.archivedAt.toLocaleDateString()}</dd></div>}
        </dl>
      </section>
    </main>
  );
}