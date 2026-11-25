
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe2,
  Languages,
  MapPin,
  Pencil,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { notFound } from "next/navigation";
import { PublisherAccountMenu } from "@/components/publisher/PublisherAccountMenu";
import { requirePublisherProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type WebsitePageProps = {
  params: Promise<{ websiteId: string }>;
};

export default async function PublisherWebsiteDetailsPage({
  params,
}: WebsitePageProps) {
  await connection();

  const user = await requirePublisherProfile();
  const { websiteId } = await params;

  const website = await prisma.publisherWebsite.findFirst({
    where: {
      id: websiteId,
      publisherProfile: { userId: user.id },
    },
    include: {
      reviews: {
        orderBy: { reviewedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!website) notFound();

  const status = website.approvalStatus.toLowerCase();

  const statusConfig = {
    approved: {
      label: "Approved",
      description: "Your website is approved and ready for business.",
      icon: CheckCircle2,
    },
    pending: {
      label: "Under review",
      description: "Your website is waiting for an approval review.",
      icon: Clock3,
    },
    rejected: {
      label: "Rejected",
      description: "Review the latest note and update your website.",
      icon: XCircle,
    },
  }[status] ?? {
    label: website.approvalStatus,
    description: "Your website approval status.",
    icon: ShieldCheck,
  };

  const StatusIcon = statusConfig.icon;

  const details = [
    {
      label: "Website niche",
      value: website.websiteNiche,
      icon: Target,
    },
    {
      label: "Website language",
      value: website.websiteLanguage,
      icon: Languages,
    },
    {
      label: "Target audience country",
      value: website.targetAudienceCountry,
      icon: MapPin,
    },
    {
      label: "Submitted on",
      value: website.createdAt.toLocaleDateString(),
      icon: CalendarDays,
    },
  ];

  return (
    <main className="min-h-screen w-full bg-[#f6f8f7] text-[#12211c]">
      {/* Full-width header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#e5eae8] bg-white/85 backdrop-blur-xl">
        <div className="flex h-[72px] w-full items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b2e24] text-lg font-bold text-white shadow-sm transition-transform group-hover:scale-105">
              L
            </span>
            <span className="text-[19px] font-bold tracking-tight text-[#12211c]">
              LinkLedger
            </span>
          </Link>

          <PublisherAccountMenu />
        </div>
      </header>

      {/* Full-width page content */}
      <div className="w-full px-5 pb-16 pt-7 sm:px-8 lg:px-12 2xl:px-16">
        {/* Back navigation */}
        <Link
          href="/publisher/websites"
          className="group mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#687870] transition-colors hover:text-[#0e7a5a]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5eae8] bg-white transition-all group-hover:border-[#b8d9cb] group-hover:bg-[#edf7f2]">
            <ArrowLeft size={15} />
          </span>
          Back to my websites
        </Link>

        {/* Hero */}
        <section className="relative isolate w-full overflow-hidden rounded-[28px] bg-[#0b2e24] shadow-[0_18px_50px_-25px_rgba(11,46,36,0.45)]">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] bg-[length:22px_22px]" />
          <div className="pointer-events-none absolute -right-24 -top-36 -z-10 h-[420px] w-[420px] rounded-full bg-[#0e7a5a]/30 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-40 left-1/3 -z-10 h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[90px]" />

          <div className="relative px-6 py-8 sm:px-9 sm:py-10 lg:px-14 lg:py-12">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-emerald-100">
                  <Sparkles size={13} />
                  PUBLISHER WORKSPACE
                </div>

                <h1 className="max-w-2xl break-words text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[42px]">
                  {website.websiteName}
                </h1>

                <a
                  href={website.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex max-w-full items-center gap-2 break-all text-sm !text-white"
                >
                  <Globe2 size={15} className="shrink-0" />
                  <span>{website.websiteUrl}</span>
                  <ExternalLink size={14} className="shrink-0" />
                </a>

                <p className="mt-5 max-w-xl text-sm leading-6 text-emerald-50/65 sm:text-base">
                  Manage your website profile, review its performance details,
                  and keep your publisher listing up to date.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href={`/publisher/websites/${website.id}/services`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0b2e24] shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
                  >
                    Manage services
                    <ArrowUpRight size={16} />
                  </Link>

                  <Link
                    href={`/publisher/websites/${website.id}/edit`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0b2e24] shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
                  >
                    <Pencil size={15} />
                    Edit website
                  </Link>
                </div>
              </div>

              {/* Approval status panel */}
              <div className="w-full rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-md lg:w-[300px] lg:shrink-0 xl:w-[340px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/60">
                    Approval status
                  </span>
                  <ShieldCheck size={18} className="text-emerald-200/70" />
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                    <StatusIcon size={22} className="text-emerald-200" />
                  </span>
                  <div>
                    <p className="text-lg font-bold text-white">
                      {statusConfig.label}
                    </p>
                    <p className="mt-0.5 text-xs text-emerald-100/60">
                      Website listing status
                    </p>
                  </div>
                </div>

                <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-emerald-50/65">
                  {statusConfig.description}
                </p>
              </div>
            </div>

            {/* Hero metrics */}
            <div className="mt-9 grid grid-cols-1 gap-3 border-t border-white/15 pt-6 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-200">
                  <Users size={19} />
                </span>
                <div>
                  <p className="text-xl font-bold tabular-nums text-white">
                    {website.monthlyTraffic.toLocaleString()}
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-100/60">
                    Monthly visitors
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-200">
                  <BarChart3 size={19} />
                </span>
                <div>
                  <p className="text-xl font-bold tabular-nums text-white">
                    {website.domainRating ?? "—"}
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-100/60">
                    Domain Rating
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-200">
                  <TrendingUp size={19} />
                </span>
                <div>
                  <p className="text-xl font-bold tabular-nums text-white">
                    {website.domainAuthority ?? "—"}
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-100/60">
                    Domain Authority
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="mt-8 grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-6">
            {/* Website information */}
            <section className="overflow-hidden rounded-2xl border border-[#e5eae8] bg-white shadow-[0_3px_16px_rgba(18,33,28,0.025)]">
              <div className="flex flex-col justify-between gap-3 border-b border-[#edf0ee] px-6 py-5 sm:flex-row sm:items-center sm:px-7">
                <div>
                  <p className="text-base font-bold text-[#12211c]">
                    Website information
                  </p>
                  <p className="mt-1 text-sm text-[#82918b]">
                    Basic details associated with your listing
                  </p>
                </div>
                <Link
                  href={`/publisher/websites/${website.id}/edit`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0e7a5a] transition-colors hover:text-[#0a6149]"
                >
                  <Pencil size={14} />
                  Edit details
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-x-8 px-6 py-2 sm:grid-cols-2 sm:px-7 xl:grid-cols-2 2xl:grid-cols-3">
                {details.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 border-b border-[#edf0ee] py-5 last:border-0"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf7f2] text-[#0e7a5a]">
                        <Icon size={17} />
                      </span>
                      <div className="min-w-0">
                        <dt className="text-xs font-medium text-[#82918b]">
                          {item.label}
                        </dt>
                        <dd className="mt-1 break-words text-sm font-semibold text-[#263b32]">
                          {item.value}
                        </dd>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Website description */}
            <section className="rounded-2xl border border-[#e5eae8] bg-white p-6 shadow-[0_3px_16px_rgba(18,33,28,0.025)] sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7f2] text-[#0e7a5a]">
                  <Globe2 size={19} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#12211c]">
                    About this website
                  </h2>
                  <p className="mt-0.5 text-xs text-[#82918b]">
                    Publisher-provided website description
                  </p>
                </div>
              </div>

              <p className="whitespace-pre-line text-sm leading-7 text-[#5f6f69]">
                {website.websiteDescription}
              </p>
            </section>

            {/* Latest review note */}
            {website.rejectionReason && (
              <section className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm">
                    <ShieldCheck size={19} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-rose-900">
                      Latest review note
                    </h2>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-rose-800/80">
                      {website.rejectionReason}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="min-w-0 space-y-5">
            {/* Domain metrics */}
            <section className="rounded-2xl border border-[#e5eae8] bg-white p-6 shadow-[0_3px_16px_rgba(18,33,28,0.025)]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7f2] text-[#0e7a5a]">
                  <TrendingUp size={19} />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#12211c]">
                    Domain metrics
                  </h2>
                  <p className="text-xs text-[#82918b]">
                    Reported domain statistics
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#edf0ee] pb-4">
                  <span className="text-sm text-[#687870]">
                    Domain Rating
                  </span>
                  <span className="text-lg font-bold tabular-nums text-[#12211c]">
                    {website.domainRating ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#687870]">
                    Domain Authority
                  </span>
                  <span className="text-lg font-bold tabular-nums text-[#12211c]">
                    {website.domainAuthority ?? "—"}
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-[#f6f8f7] p-3">
                <p className="text-xs leading-5 text-[#82918b]">
                  These metrics are self-reported by the publisher and have not
                  been independently verified.
                </p>
              </div>
            </section>

            {/* Quick actions */}
            <section className="rounded-2xl border border-[#e5eae8] bg-white p-6 shadow-[0_3px_16px_rgba(18,33,28,0.025)]">
              <h2 className="text-sm font-bold text-[#12211c]">
                Manage your website
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#82918b]">
                Keep your listing accurate and your services up to date.
              </p>

              <div className="mt-5 space-y-2.5">
                <Link
                  href={`/publisher/websites/${website.id}/services`}
                  className="group flex items-center justify-between rounded-xl border border-[#e5eae8] px-4 py-3.5 transition-all hover:border-[#b8d9cb] hover:bg-[#f4faf6]"
                >
                  <span className="text-sm font-semibold text-[#263b32]">
                    Services &amp; pricing
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="text-[#82918b] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0e7a5a]"
                  />
                </Link>

                <Link
                  href={`/publisher/websites/${website.id}/edit`}
                  className="group flex items-center justify-between rounded-xl border border-[#e5eae8] px-4 py-3.5 transition-all hover:border-[#b8d9cb] hover:bg-[#f4faf6]"
                >
                  <span className="text-sm font-semibold text-[#263b32]">
                    Edit website profile
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="text-[#82918b] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0e7a5a]"
                  />
                </Link>

                <a
                  href={website.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between rounded-xl border border-[#e5eae8] px-4 py-3.5 transition-all hover:border-[#b8d9cb] hover:bg-[#f4faf6]"
                >
                  <span className="text-sm font-semibold text-[#263b32]">
                    Visit live website
                  </span>
                  <ExternalLink
                    size={15}
                    className="text-[#82918b] transition-colors group-hover:text-[#0e7a5a]"
                  />
                </a>
              </div>
            </section>

            {/* Trust note */}
            <div className="rounded-2xl border border-[#dcece3] bg-[#edf7f2] p-5">
              <div className="flex items-center gap-2 text-[#0e7a5a]">
                <ShieldCheck size={17} />
                <p className="text-sm font-bold">Keep it up to date</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#5f756a]">
                Accurate website details help advertisers understand your
                audience and evaluate your publishing opportunities.
              </p>
            </div>
          </aside>
        </div>

        {/* Footer disclaimer */}
        <div className="mt-7 flex flex-col gap-2 border-t border-[#e5eae8] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-[#82918b]">
            Website traffic and domain metrics are publisher-reported and not
            independently verified.
          </p>
          <p className="text-xs text-[#a0aaa5]">
            Website submitted on {website.createdAt.toLocaleDateString()}
          </p>
        </div>
      </div>
    </main>
  );
}
