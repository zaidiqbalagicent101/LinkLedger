import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { PublisherWebsiteForm } from "@/components/publisher/PublisherWebsiteForm";
import { PublisherAccountMenu } from "@/components/publisher/PublisherAccountMenu";
import { requirePublisherProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type EditWebsitePageProps = {
  params: Promise<{ websiteId: string }>;
};

export default async function EditPublisherWebsitePage({
  params,
}: EditWebsitePageProps) {
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
      websiteUrl: true,
      websiteNiche: true,
      monthlyTraffic: true,
      websiteLanguage: true,
      targetAudienceCountry: true,
      websiteDescription: true,
      websiteLogo: true,
      domainRating: true,
      domainAuthority: true,
    },
  });

  if (!website) notFound();

  const monogram = website.websiteName.trim().charAt(0).toUpperCase() || "L";

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
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex flex-wrap items-center gap-2 text-[13px] text-[#82918b]"
        >
          <Link
            href="/publisher/websites"
            className="rounded-md transition-colors hover:text-[#0e7a5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
          >
            My websites
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-[#12211c]">Edit website</span>
        </nav>

        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0b2e24] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] bg-[length:22px_22px] px-7 py-9 text-white sm:px-10 sm:py-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 -top-24 size-64 rounded-full bg-[#0e7a5a]/30 blur-3xl"
          />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-start gap-5">
              <span
                aria-hidden="true"
                className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#0e7a5a] text-3xl font-semibold text-white ring-1 ring-emerald-300/40 sm:size-20 sm:text-4xl"
              >
                {monogram}
              </span>

              <div className="min-w-0">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                  <span className="size-1.5 rounded-full bg-emerald-300" />
                  Publisher workspace
                </div>

                <h1 className="break-words text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[46px]">
                  Edit {website.websiteName}
                </h1>

                <a
                  href={website.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex max-w-full items-center gap-1 break-all text-[14px] font-medium text-emerald-100/80 transition-colors hover:text-white"
                >
                  {website.websiteUrl}
                  <ArrowUpRight size={14} className="shrink-0" />
                </a>

                <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-emerald-50/75">
                  Update your website information and keep your publication
                  details accurate for potential advertisers.
                </p>
              </div>
            </div>

            <dl className="grid shrink-0 grid-cols-3 gap-3 xl:w-[540px]">
              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
                <dt className="text-xs text-emerald-100/70">Monthly traffic</dt>
                <dd className="mt-1 break-words text-2xl font-semibold tabular-nums">
                  {website.monthlyTraffic.toLocaleString()}
                </dd>
              </div>
              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
                <dt className="text-xs text-emerald-100/70">Domain Rating</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">
                  {website.domainRating ?? "Not provided"}
                </dd>
              </div>
              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
                <dt className="text-xs text-emerald-100/70">Domain Authority</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">
                  {website.domainAuthority ?? "Not provided"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Review Notice */}
        <div className="mt-5 flex items-start gap-4 rounded-2xl border border-[#dcebe3] bg-[#edf6f1] px-5 py-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#0e7a5a]">
            <ShieldCheck size={19} />
          </span>

          <div>
            <p className="text-sm font-semibold text-[#12211c]">
              Approval status is protected
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#5f6f69]">
              You can update your submitted website details. Only an
              administrator can change its approval status.
            </p>
          </div>
        </div>

        {/* Website Form */}
        <div className="mt-5 rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)] sm:p-8 xl:p-10">
          <div className="mb-8 border-b border-[#e5eae8] pb-5">
            <h2 className="text-[22px] font-semibold tracking-tight">
              Website information
            </h2>
            <p className="mt-1.5 text-sm text-[#5f6f69]">
              Make changes to your submitted publication details below.
            </p>
          </div>

          <PublisherWebsiteForm website={website} />
        </div>

        {/* Back Link */}
        <Link
          href="/publisher/websites"
          className="group mt-6 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-[#5f6f69] transition-colors hover:text-[#0e7a5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
        >
          <ArrowLeft
            size={15}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          Back to my websites
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-6 border-t border-[#e5eae8] bg-white">
        <div className="flex w-full flex-col justify-between gap-2 px-6 py-6 text-[13px] text-[#82918b] sm:flex-row sm:px-10 lg:px-14">
          <span>© 2026 LinkLedger</span>

          <Link
            href="/publisher/websites"
            className="inline-flex items-center gap-1 font-medium transition-colors hover:text-[#0e7a5a]"
          >
            My websites
            <ArrowRight size={13} />
          </Link>
        </div>
      </footer>
    </main>
  );
}