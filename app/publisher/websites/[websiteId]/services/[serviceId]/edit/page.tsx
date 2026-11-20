import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { PublisherServiceForm } from "@/components/publisher/PublisherServiceForm";
import { requirePublisherProfile } from "@/lib/auth";
import { getCurrencyOptions } from "@/lib/currency-options";
import { prisma } from "@/lib/prisma";

type EditServicePageProps = { params: Promise<{ websiteId: string; serviceId: string }> };

export default async function EditPublisherServicePage({ params }: EditServicePageProps) {
  await connection();
  const user = await requirePublisherProfile();
  const { websiteId, serviceId } = await params;
  const service = await prisma.publisherService.findFirst({
    where: {
      id: serviceId,
      publisherWebsiteId: websiteId,
      archivedAt: null,
      website: { publisherProfile: { userId: user.id } },
    },
    include: { website: { select: { websiteName: true } } },
  });

  if (!service) notFound();

  const currencyOptions = getCurrencyOptions(service.currency);

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#12211c] antialiased">
      <header className="border-b border-[#e5eae8] bg-white">
        <div className="mx-auto flex h-[72px] w-[calc(100%-40px)] max-w-[1040px] items-center justify-between">
          <Link href="/" aria-label="LinkLedger home" className="inline-flex items-center gap-2.5 text-[19px] font-bold">
            <span className="grid size-8 place-items-center rounded-lg bg-[#0e7a5a] text-[17px] text-white">L</span>
            LinkLedger
          </Link>
          <Link href={`/publisher/websites/${websiteId}/services/${serviceId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#5f6f69] hover:text-[#0e7a5a]">
            <ArrowLeft size={16} /> Service details
          </Link>
        </div>
      </header>

      <section className="mx-auto w-[calc(100%-40px)] max-w-[720px] py-10 sm:py-14">
        <div className="mb-7 flex flex-wrap items-center gap-2 text-[13px] text-[#82918b]">
          <Link href={`/publisher/websites/${websiteId}/services`} className="hover:text-[#0e7a5a]">Services &amp; pricing</Link>
          <span>/</span>
          <Link href={`/publisher/websites/${websiteId}/services/${serviceId}`} className="hover:text-[#0e7a5a]">{service.serviceName}</Link>
          <span>/</span><span className="font-medium text-[#12211c]">Edit</span>
        </div>
        <div className="mb-8">
          <p className="eyebrow">{service.website.websiteName}</p>
          <h1 className="mt-2 break-words text-[30px] font-semibold tracking-[-1px] sm:text-[38px]">Edit {service.serviceName}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[#5f6f69]">Update the price, delivery details, and publishing terms for this offer.</p>
        </div>

        <div className="rounded-lg border border-[#e5eae8] bg-white p-5 shadow-[0_8px_30px_-25px_rgba(18,33,28,0.2)] sm:p-8">
          <PublisherServiceForm
            websiteId={websiteId}
            currencyOptions={currencyOptions}
            service={{
              id: service.id,
              serviceName: service.serviceName,
              serviceType: service.serviceType,
              price: service.price.toString(),
              currency: service.currency,
              deliveryTimeDays: service.deliveryTimeDays,
              contentWritingIncluded: service.contentWritingIncluded,
              linkType: service.linkType,
              maximumLinks: service.maximumLinks,
              homepageLinkAvailable: service.homepageLinkAvailable,
              description: service.description,
              publishingGuidelines: service.publishingGuidelines,
              additionalConditions: service.additionalConditions,
            }}
          />
        </div>
        <Link href={`/publisher/websites/${websiteId}/services/${serviceId}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#5f6f69] hover:text-[#0e7a5a]">
          <ArrowLeft size={15} /> Cancel and return to service
        </Link>
      </section>
    </main>
  );
}