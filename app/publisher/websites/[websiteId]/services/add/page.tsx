
import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { PublisherServiceForm } from "@/components/publisher/PublisherServiceForm";
import { requirePublisherProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AddServicePageProps = {
  params: Promise<{ websiteId: string }>;
};

export default async function AddWebsiteServicePage({
  params,
}: AddServicePageProps) {
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

  const servicesUrl = `/publisher/websites/${website.id}/services`;

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

          <Link
            href={servicesUrl}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5f6f69] transition-colors hover:text-[#0e7a5a]"
          >
            <ArrowLeft size={16} />
            Services &amp; pricing
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <section className="mx-auto w-[calc(100%-40px)] max-w-[720px] py-10 sm:py-14">

        {/* Breadcrumb */}
        <div className="mb-7 flex flex-wrap items-center gap-2 text-[13px] text-[#82918b]">
          <Link
            href={`/publisher/websites/${website.id}`}
            className="transition-colors hover:text-[#0e7a5a]"
          >
            My websites
          </Link>
          <span>/</span>
          <Link
            href={servicesUrl}
            className="transition-colors hover:text-[#0e7a5a]"
          >
            Services &amp; pricing
          </Link>
          <span>/</span>
          <span className="font-medium text-[#12211c]">
            Add service
          </span>
        </div>

        {/* Page Heading */}
        <div className="mb-8">
          <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-[#dcebe3] bg-[#eaf5ef] px-3 py-1.5 text-xs font-semibold text-[#0a6149]">
            <BriefcaseBusiness size={14} />
            <span className="truncate">{website.websiteName}</span>
          </div>

          <h1 className="text-[32px] font-semibold tracking-[-1px] sm:text-[38px]">
            Add a service
          </h1>

          <p className="mt-3 max-w-[590px] text-[15px] leading-relaxed text-[#5f6f69] sm:text-[16px]">
            Create a named offer with clear pricing and publishing terms.
            You can add multiple offers of the same type.
          </p>
        </div>

        {/* Information Notice */}
        <div className="mb-7 flex gap-3 rounded-xl border border-[#dcebe3] bg-[#edf6f1] p-4">
          <div className="mt-0.5 shrink-0 text-[#0e7a5a]">
            <ShieldCheck size={19} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#12211c]">
              Keep your offers clear
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#5f6f69]">
              Provide accurate pricing and publishing terms so advertisers
              can understand exactly what each service includes.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-[#e5eae8] bg-white p-5 shadow-[0_8px_30px_-25px_rgba(18,33,28,0.2)] sm:p-8">
          <div className="mb-7 border-b border-[#e5eae8] pb-5">
            <h2 className="text-[18px] font-semibold">
              Service information
            </h2>

            <p className="mt-1.5 text-sm text-[#5f6f69]">
              Enter the offer details and pricing below.
            </p>
          </div>

          <PublisherServiceForm websiteId={website.id} />
        </div>

        {/* Back Link */}
        <Link
          href={servicesUrl}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#5f6f69] transition-colors hover:text-[#0e7a5a]"
        >
          <ArrowLeft size={15} />
          Back to services
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-[#e5eae8] bg-white">
        <div className="mx-auto flex w-[calc(100%-40px)] max-w-[1040px] flex-col justify-between gap-2 py-6 text-[13px] text-[#82918b] sm:flex-row">
          <span>© 2026 LinkLedger</span>

          <Link
            href={servicesUrl}
            className="inline-flex items-center gap-1 font-medium transition-colors hover:text-[#0e7a5a]"
          >
            Services &amp; pricing
            <ArrowRight size={13} />
          </Link>
        </div>
      </footer>
    </main>
  );
}
