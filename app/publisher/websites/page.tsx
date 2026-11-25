
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Plus,
  Globe2,
  LayoutGrid,
  Clock3,
  CheckCircle2,
  ChevronDown,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Pencil,
  Layers3,
  CircleDot,
} from "lucide-react";
import { requirePublisherProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PublisherAccountMenu } from "@/components/publisher/PublisherAccountMenu";

export default async function PublisherWebsitesPage() {
  const user = await requirePublisherProfile();

  const websites = await prisma.publisherWebsite.findMany({
    where: {
      publisherProfile: { userId: user.id },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      websiteName: true,
      websiteUrl: true,
      websiteNiche: true,
      monthlyTraffic: true,
      approvalStatus: true,
      createdAt: true,
      services: {
        orderBy: { serviceName: "asc" },
        select: { id: true, serviceName: true },
      },
    },
  });

  const totalWebsites = websites.length;
  const approvedWebsites = websites.filter(
    (website) => website.approvalStatus.toLowerCase() === "approved",
  ).length;
  const pendingWebsites = websites.filter(
    (website) => website.approvalStatus.toLowerCase() === "pending",
  ).length;
  const totalServices = websites.reduce(
    (total, website) => total + website.services.length,
    0,
  );
  const totalTraffic = websites.reduce(
    (total, website) => total + website.monthlyTraffic,
    0,
  );

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US", {
      notation: value >= 1000000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(value);

  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return {
          className: "border-[#cce9dc] bg-[#eaf6f0] text-[#0a6149]",
          icon: <CheckCircle2 size={13} />,
          label: "Approved",
        };
      case "pending":
        return {
          className: "border-[#f0dfb9] bg-[#fff8e9] text-[#936313]",
          icon: <Clock3 size={13} />,
          label: "Under review",
        };
      case "rejected":
        return {
          className: "border-[#f0d2d2] bg-[#fff0f0] text-[#a33d3d]",
          icon: <CircleDot size={13} />,
          label: "Rejected",
        };
      default:
        return {
          className: "border-[#e5eae8] bg-[#f6f8f7] text-[#5f6f69]",
          icon: <Clock3 size={13} />,
          label: status.replaceAll("_", " "),
        };
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#f6f8f7] text-[#12211c] antialiased">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#e5eae8] bg-white/85 backdrop-blur-xl">
        <div className="flex min-h-[72px] w-full items-center justify-between gap-4 px-5 sm:px-8 lg:px-12 2xl:px-16">
          <Link
            href="/"
            aria-label="LinkLedger home"
            className="group flex items-center gap-2.5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0e7a5a] text-lg font-bold text-white shadow-[0_4px_12px_rgba(14,122,90,0.2)] transition-transform group-hover:scale-105">
              L
            </span>
            <span className="text-[19px] font-extrabold tracking-[-0.7px] text-[#12211c]">
              LinkLedger
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#dcebe2] bg-[#f3f8f5] px-3 py-1.5 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0e7a5a]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#28634d]">
                Publisher workspace
              </span>
            </div>
            <PublisherAccountMenu />
          </div>
        </div>
      </header>

      {/* Full-width page content */}
      <div className="w-full px-5 pb-12 pt-6 sm:px-8 sm:pb-16 lg:px-12 lg:pt-9 2xl:px-16">
        {/* Hero */}
        <section className="relative isolate w-full overflow-hidden rounded-[28px] bg-[#0b2e24] px-6 py-8 text-white shadow-[0_20px_55px_-30px_rgba(11,46,36,0.55)] sm:px-9 sm:py-10 lg:px-12 lg:py-11">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] bg-[length:22px_22px]" />
          <div className="pointer-events-none absolute -right-20 -top-36 -z-10 h-[380px] w-[380px] rounded-full bg-[#168a65]/25 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-44 left-[35%] -z-10 h-[300px] w-[400px] rounded-full bg-[#0e7a5a]/20 blur-[90px]" />

          <div className="relative flex flex-col justify-between gap-9 xl:flex-row xl:items-end">
            <div className="max-w-[720px]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5">
                <Sparkles size={13} className="text-[#8de0b9]" />
                <span className="text-[11px] font-semibold tracking-wide text-[#d6eee2]">
                  YOUR PUBLISHER DASHBOARD
                </span>
              </div>

              <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.17em] text-[#8de0b9]">
                Manage your digital presence
              </p>

              <h1 className="max-w-[680px] text-[34px] font-bold leading-[1.12] tracking-[-1.5px] sm:text-[43px] lg:text-[48px]">
                Your websites.
                <br />
                <span className="text-[#8de0b9]">
                  Your publishing business.
                </span>
              </h1>

              <p className="mt-4 max-w-[570px] text-[14px] leading-7 text-[#c0d7cc] sm:text-[15px]">
                Keep your publications organized, track approval progress, and
                manage the services you offer to advertisers.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/publisher/websites/add"
                  className="group inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-[13px] font-bold !text-black shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-[#eaf6f0]"
                >
                  <Plus size={17} />
                  Add a website
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <span className="inline-flex items-center gap-2 px-2 text-[12px] font-medium text-[#c0d7cc]">
                  <ShieldCheck size={15} className="text-[#8de0b9]" />
                  Manage your listed publications
                </span>
              </div>
            </div>

            {/* Hero summary */}
            <div className="grid grid-cols-2 gap-3 xl:w-[430px] xl:shrink-0">
              <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#c0d7cc]">
                    Total websites
                  </span>
                  <Globe2 size={17} className="text-[#8de0b9]" />
                </div>
                <p className="text-[30px] font-bold tracking-tight text-white tabular-nums">
                  {totalWebsites}
                </p>
                <p className="mt-1 text-[11px] text-[#a8c6b8]">
                  Your listed publications
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#c0d7cc]">
                    Active services
                  </span>
                  <Layers3 size={17} className="text-[#8de0b9]" />
                </div>
                <p className="text-[30px] font-bold tracking-tight text-white tabular-nums">
                  {totalServices}
                </p>
                <p className="mt-1 text-[11px] text-[#a8c6b8]">
                  Across all websites
                </p>
              </div>

              <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold text-[#c0d7cc]">
                      Combined monthly traffic
                    </p>
                    <p className="mt-1 text-[25px] font-bold tracking-tight text-white tabular-nums">
                      {formatNumber(totalTraffic)}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8de0b9]/10 text-[#8de0b9]">
                    <BarChart3 size={21} />
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-[#a8c6b8]">
                  Based on your submitted website traffic
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Page content */}
        <section className="mt-9 w-full">
          {/* Section heading */}
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0e7a5a]" />
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e7a5a]">
                  Your portfolio
                </p>
              </div>
              <h2 className="text-[25px] font-bold tracking-[-0.8px] text-[#12211c] sm:text-[28px]">
                My websites
              </h2>
              <p className="mt-1.5 text-[13px] leading-6 text-[#718078]">
                Manage your publications, services, and approval status.
              </p>
            </div>

            <Link
              href="/publisher/websites/add"
              className="inline-flex min-h-[43px] items-center justify-center gap-2 self-start rounded-xl bg-[#0e7a5a] px-4 text-[13px] font-bold !text-white shadow-[0_5px_15px_-7px_rgba(14,122,90,0.6)] transition-all hover:-translate-y-0.5 hover:bg-[#0a6149] sm:self-auto"
            >
              <Plus size={16} />
              Add website
            </Link>
          </div>

          {/* Overview cards */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-2xl border border-[#e5eae8] bg-white p-4 shadow-[0_4px_18px_-15px_rgba(18,33,28,0.2)]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf6f0] text-[#0e7a5a]">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[23px] font-bold tracking-tight text-[#12211c] tabular-nums">
                  {approvedWebsites}
                </p>
                <p className="text-[12px] font-medium text-[#718078]">
                  Approved websites
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-[#e5eae8] bg-white p-4 shadow-[0_4px_18px_-15px_rgba(18,33,28,0.2)]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff6e6] text-[#b17b20]">
                <Clock3 size={20} />
              </div>
              <div>
                <p className="text-[23px] font-bold tracking-tight text-[#12211c] tabular-nums">
                  {pendingWebsites}
                </p>
                <p className="text-[12px] font-medium text-[#718078]">
                  Awaiting review
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-[#e5eae8] bg-white p-4 shadow-[0_4px_18px_-15px_rgba(18,33,28,0.2)]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf2fa] text-[#5273a6]">
                <Layers3 size={20} />
              </div>
              <div>
                <p className="text-[23px] font-bold tracking-tight text-[#12211c] tabular-nums">
                  {totalServices}
                </p>
                <p className="text-[12px] font-medium text-[#718078]">
                  Listed services
                </p>
              </div>
            </div>
          </div>

          {/* Websites list */}
          {websites.length ? (
            <div className="w-full overflow-hidden rounded-2xl border border-[#e5eae8] bg-white shadow-[0_12px_35px_-28px_rgba(18,33,28,0.28)]">
              <div className="flex flex-col justify-between gap-2 border-b border-[#edf0ee] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                <div>
                  <h3 className="text-[14px] font-bold text-[#203d33]">
                    All publications
                  </h3>
                  <p className="mt-0.5 text-[12px] text-[#82918b]">
                    {totalWebsites} website{totalWebsites === 1 ? "" : "s"} in
                    your portfolio
                  </p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f3f8f5] px-3 py-1.5 text-[11px] font-semibold text-[#28634d]">
                  <LayoutGrid size={13} />
                  Website overview
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden w-full overflow-x-auto md:block">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead>
                    <tr className="bg-[#f8faf9]">
                      <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.11em] text-[#82918b]">
                        Website
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.11em] text-[#82918b]">
                        Niche
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.11em] text-[#82918b]">
                        Monthly traffic
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.11em] text-[#82918b]">
                        Services
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.11em] text-[#82918b]">
                        Status
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.11em] text-[#82918b]">
                        Added
                      </th>
                      <th className="px-4 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.11em] text-[#82918b]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {websites.map((website) => {
                      const status = getStatusStyle(website.approvalStatus);

                      return (
                        <tr
                          key={website.id}
                          className="group border-t border-[#edf0ee] transition-colors hover:bg-[#fbfdfc]"
                        >
                          <td className="px-6 py-4">
                            <div className="flex min-w-[220px] items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dcebe2] bg-[#f0f7f3] text-[12px] font-extrabold text-[#0e7a5a]">
                                {getInitials(website.websiteName)}
                              </div>
                              <div className="min-w-0">
                                <Link
                                  className="block truncate text-[13px] font-bold text-[#203d33] transition-colors hover:text-[#0e7a5a]"
                                  href={`/publisher/websites/${website.id}`}
                                >
                                  {website.websiteName}
                                </Link>
                                <a
                                  className="mt-1 inline-flex max-w-[210px] items-center gap-1 truncate text-[11px] text-[#82918b] transition-colors hover:text-[#0e7a5a]"
                                  href={website.websiteUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <span className="truncate">
                                    {website.websiteUrl}
                                  </span>
                                  <ExternalLink size={11} className="shrink-0" />
                                </a>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="inline-flex max-w-[150px] items-center rounded-lg bg-[#f6f8f7] px-2.5 py-1.5 text-[11px] font-semibold text-[#5f6f69]">
                              {website.websiteNiche}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span className="text-[13px] font-bold tabular-nums text-[#203d33]">
                              {website.monthlyTraffic.toLocaleString()}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            {website.services.length ? (
                              <details className="group/services relative">
                                <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-[#dcebe2] bg-[#f3f8f5] px-2.5 py-1.5 text-[11px] font-bold text-[#28634d] transition-colors hover:bg-[#eaf6f0] [&::-webkit-details-marker]:hidden">
                                  {website.services.length} service
                                  {website.services.length === 1 ? "" : "s"}
                                  <ChevronDown
                                    size={13}
                                    className="transition-transform group-open/services:rotate-180"
                                  />
                                </summary>
                                <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-[#e5eae8] bg-white p-3 shadow-[0_14px_35px_-15px_rgba(18,33,28,0.3)]">
                                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#82918b]">
                                    Listed services
                                  </p>
                                  <ul className="grid gap-1.5">
                                    {website.services.map((service) => (
                                      <li key={service.id}>
                                        <Link
                                          href={`/publisher/websites/${website.id}/services/${service.id}`}
                                          className="block rounded-lg px-2 py-1.5 text-[12px] font-medium text-[#40584e] transition-colors hover:bg-[#f3f8f5] hover:text-[#0e7a5a]"
                                        >
                                          {service.serviceName}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                  <Link
                                    className="mt-2 flex items-center justify-between border-t border-[#edf0ee] pt-2 text-[11px] font-bold text-[#0e7a5a] hover:text-[#0a6149]"
                                    href={`/publisher/websites/${website.id}/services`}
                                  >
                                    Manage services
                                    <ArrowUpRight size={13} />
                                  </Link>
                                </div>
                              </details>
                            ) : (
                              <Link
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0e7a5a] hover:text-[#0a6149]"
                                href={`/publisher/websites/${website.id}/services/add`}
                              >
                                <Plus size={13} />
                                Add service
                              </Link>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[10px] font-bold ${status.className}`}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-[11px] font-medium text-[#82918b]">
                            {website.createdAt.toLocaleDateString()}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <Link
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5eae8] bg-white text-[#718078] transition-all hover:border-[#b8d5c8] hover:bg-[#eaf6f0] hover:text-[#0e7a5a]"
                              href={`/publisher/websites/${website.id}/edit`}
                              title="Edit website"
                              aria-label={`Edit ${website.websiteName}`}
                            >
                              <Pencil size={14} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile website cards */}
              <div className="grid gap-3 p-4 md:hidden">
                {websites.map((website) => {
                  const status = getStatusStyle(website.approvalStatus);

                  return (
                    <article
                      key={website.id}
                      className="rounded-2xl border border-[#e5eae8] bg-white p-4 transition-all hover:border-[#cbded3] hover:shadow-[0_8px_25px_-20px_rgba(14,122,90,0.4)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#dcebe2] bg-[#f0f7f3] text-[12px] font-extrabold text-[#0e7a5a]">
                            {getInitials(website.websiteName)}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/publisher/websites/${website.id}`}
                              className="block truncate text-[14px] font-bold text-[#203d33] hover:text-[#0e7a5a]"
                            >
                              {website.websiteName}
                            </Link>
                            <a
                              href={website.websiteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-flex max-w-full items-center gap-1 text-[11px] text-[#82918b]"
                            >
                              <span className="truncate">
                                {website.websiteUrl}
                              </span>
                              <ExternalLink size={11} className="shrink-0" />
                            </a>
                          </div>
                        </div>

                        <Link
                          href={`/publisher/websites/${website.id}/edit`}
                          title="Edit website"
                          aria-label={`Edit ${website.websiteName}`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e5eae8] text-[#718078] hover:border-[#b8d5c8] hover:bg-[#eaf6f0] hover:text-[#0e7a5a]"
                        >
                          <Pencil size={14} />
                        </Link>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold ${status.className}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                        <span className="rounded-full bg-[#f6f8f7] px-2.5 py-1.5 text-[10px] font-semibold text-[#5f6f69]">
                          {website.websiteNiche}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#edf0ee] pt-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9aa59f]">
                            Monthly traffic
                          </p>
                          <p className="mt-1 text-[14px] font-bold text-[#203d33] tabular-nums">
                            {website.monthlyTraffic.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9aa59f]">
                            Services
                          </p>
                          {website.services.length ? (
                            <details className="group/mobile-services relative mt-1">
                              <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-[12px] font-bold text-[#0e7a5a] [&::-webkit-details-marker]:hidden">
                                {website.services.length} listed
                                <ChevronDown
                                  size={13}
                                  className="transition-transform group-open/mobile-services:rotate-180"
                                />
                              </summary>
                              <ul className="mt-2 grid gap-1.5">
                                {website.services.map((service) => (
                                  <li key={service.id}>
                                    <Link
                                      href={`/publisher/websites/${website.id}/services/${service.id}`}
                                      className="text-[11px] font-medium text-[#5f6f69] hover:text-[#0e7a5a]"
                                    >
                                      {service.serviceName}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                              <Link
                                href={`/publisher/websites/${website.id}/services`}
                                className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#0e7a5a]"
                              >
                                Manage services
                                <ArrowUpRight size={12} />
                              </Link>
                            </details>
                          ) : (
                            <Link
                              href={`/publisher/websites/${website.id}/services/add`}
                              className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#0e7a5a]"
                            >
                              <Plus size={12} />
                              Add service
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-[#edf0ee] pt-3">
                        <span className="text-[10px] text-[#9aa59f]">
                          Added {website.createdAt.toLocaleDateString()}
                        </span>
                        <Link
                          href={`/publisher/websites/${website.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0e7a5a]"
                        >
                          View website
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="relative isolate w-full overflow-hidden rounded-[26px] border border-dashed border-[#cbdad2] bg-white px-6 py-14 text-center sm:px-10 sm:py-20">
              <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-56 w-56 rounded-full bg-[#eaf6f0] blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-12 -z-10 h-52 w-52 rounded-full bg-[#f0f7f3] blur-3xl" />

              <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-[24px] border border-[#dcebe2] bg-[#f0f7f3] text-[#0e7a5a] shadow-[0_10px_30px_-20px_rgba(14,122,90,0.45)]">
                <Globe2 size={33} strokeWidth={1.5} />
              </div>

              <div className="mx-auto mt-6 max-w-[440px]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f7f3] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#28634d]">
                  <Sparkles size={12} />
                  Start building your portfolio
                </span>

                <h3 className="mt-4 text-[25px] font-bold tracking-[-0.8px] text-[#12211c] sm:text-[29px]">
                  Your first website starts here.
                </h3>

                <p className="mt-3 text-[13px] leading-6 text-[#718078]">
                  Add your publication to LinkLedger and start showcasing
                  your publishing opportunities to advertisers.
                </p>

                <Link
                  href="/publisher/websites/add"
                  className="group mt-7 inline-flex min-h-[47px] items-center justify-center gap-2 rounded-xl bg-[#0e7a5a] px-5 text-[13px] font-bold text-white shadow-[0_7px_20px_-8px_rgba(14,122,90,0.55)] transition-all hover:-translate-y-0.5 hover:bg-[#0a6149]"
                >
                  <Plus size={17} />
                  Add your first website
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>

              <div className="mx-auto mt-10 grid max-w-[540px] grid-cols-1 gap-3 border-t border-[#edf0ee] pt-7 text-left sm:grid-cols-3">
                <div className="flex items-center gap-2.5 sm:flex-col sm:items-center sm:text-center">
                  <Globe2 size={17} className="shrink-0 text-[#0e7a5a]" />
                  <span className="text-[11px] font-medium text-[#718078]">
                    List your websites
                  </span>
                </div>
                <div className="flex items-center gap-2.5 sm:flex-col sm:items-center sm:text-center">
                  <Layers3 size={17} className="shrink-0 text-[#0e7a5a]" />
                  <span className="text-[11px] font-medium text-[#718078]">
                    Add publishing services
                  </span>
                </div>
                <div className="flex items-center gap-2.5 sm:flex-col sm:items-center sm:text-center">
                  <ShieldCheck size={17} className="shrink-0 text-[#0e7a5a]" />
                  <span className="text-[11px] font-medium text-[#718078]">
                    Submit for review
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Disclaimer */}
        <div className="mt-6 flex flex-col gap-2 border-t border-[#e5eae8] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-[11px] leading-5 text-[#82918b]">
            <LayoutGrid size={14} className="mt-0.5 shrink-0" />
            Traffic and domain metrics are self-reported and not independently
            verified.
          </p>
          <p className="text-[10px] font-medium tracking-wide text-[#a0aaa5]">
            LINKLEDGER · PUBLISHER WORKSPACE
          </p>
        </div>
      </div>
    </main>
  );
}
