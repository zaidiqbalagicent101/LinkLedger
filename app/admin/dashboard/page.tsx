
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  Users,
  CircleUserRound,
  Building2,
  Globe2,
  Clock3,
  BadgeCheck,
  XCircle,
  ClipboardCheck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  await connection();

  const [
    totalUsers,
    publishers,
    advertisers,
    websites,
    pending,
    approved,
    rejected,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "PUBLISHER" } }),
    prisma.user.count({ where: { role: "ADVERTISER" } }),
    prisma.publisherWebsite.count(),
    prisma.publisherWebsite.count({ where: { approvalStatus: "PENDING" } }),
    prisma.publisherWebsite.count({ where: { approvalStatus: "APPROVED" } }),
    prisma.publisherWebsite.count({ where: { approvalStatus: "REJECTED" } }),
  ]);

  const metrics = [
    {
      label: "Total users",
      value: totalUsers,
      href: "/admin/users",
      icon: Users,
      description: "All registered accounts",
    },
    {
      label: "Publishers",
      value: publishers,
      href: "/admin/users?role=PUBLISHER",
      icon: CircleUserRound,
      description: "Publisher accounts",
    },
    {
      label: "Advertisers",
      value: advertisers,
      href: "/admin/users?role=ADVERTISER",
      icon: Building2,
      description: "Advertiser accounts",
    },
    {
      label: "Total websites",
      value: websites,
      href: "/admin/websites",
      icon: Globe2,
      description: "Submitted websites",
    },
    {
      label: "Pending approvals",
      value: pending,
      href: "/admin/websites/pending",
      icon: Clock3,
      description: "Awaiting admin review",
    },
    {
      label: "Approved websites",
      value: approved,
      href: "/admin/websites/approved",
      icon: BadgeCheck,
      description: "Approved for marketplace",
    },
    {
      label: "Rejected websites",
      value: rejected,
      href: "/admin/websites/rejected",
      icon: XCircle,
      description: "Rejected submissions",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-7 sm:py-10 lg:px-9">

      {/* Page Heading */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dcebe3] bg-[#eaf5ef] px-3 py-1 text-[11px] font-semibold text-[#0a6149]">
            <ClipboardCheck size={13} />
            Administration overview
          </span>

          <h1 className="mt-4 text-[28px] font-semibold tracking-[-1px] text-[#12211c] sm:text-[34px]">
            Admin dashboard
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[#5f6f69]">
            A current view of LinkLedger accounts and publisher submissions.
          </p>
        </div>

        <span className="text-xs font-medium text-[#82918b]">
          Platform overview
        </span>
      </div>

      {/* Metrics */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#203d33]">
            Platform statistics
          </h2>
          <span className="text-xs text-[#82918b]">
            {metrics.length} key metrics
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <Link
                href={metric.href}
                key={metric.label}
                className="group rounded-xl border border-[#e5eae8] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b8d9cb] hover:shadow-[0_12px_28px_-20px_rgba(18,33,28,0.3)] sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-[#eaf5ef] text-[#0e7a5a] transition-colors group-hover:bg-[#dcefe4]">
                    <Icon size={20} />
                  </div>

                  <ArrowRight
                    size={17}
                    className="mt-1 text-[#a4b0a9] transition-all group-hover:translate-x-1 group-hover:text-[#0e7a5a]"
                  />
                </div>

                <p className="mt-6 text-[13px] font-medium text-[#5f6f69]">
                  {metric.label}
                </p>

                <strong className="mt-1 block text-[30px] font-semibold tracking-tight tabular-nums text-[#12211c]">
                  {metric.value.toLocaleString()}
                </strong>

                <p className="mt-1 text-[11px] text-[#929d97]">
                  {metric.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Approval Workflow */}
      <div className="overflow-hidden rounded-xl border border-[#dcebe3] bg-white">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#eaf5ef] text-[#0e7a5a]">
              <ClipboardCheck size={23} />
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#0a6149]">
                Publisher-first workflow
              </p>

              <h2 className="mt-2 text-[20px] font-semibold tracking-tight text-[#12211c] sm:text-[23px]">
                {pending
                  ? `${pending} website${pending === 1 ? "" : "s"} need review`
                  : "Review queue is clear"}
              </h2>

              <p className="mt-2 max-w-[520px] text-sm leading-relaxed text-[#5f6f69]">
                Only approved websites are eligible for future marketplace visibility.
              </p>
            </div>
          </div>

          <Link
            href="/admin/websites/pending"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0e7a5a] px-5 text-sm font-semibold !text-white "
          >
            Open approvals
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-3 border-t border-[#e5eae8] bg-[#fbfcfb]">
          <div className="px-3 py-4 text-center sm:px-5">
            <p className="text-[11px] text-[#82918b]">Pending</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-amber-600">
              {pending.toLocaleString()}
            </p>
          </div>

          <div className="border-x border-[#e5eae8] px-3 py-4 text-center sm:px-5">
            <p className="text-[11px] text-[#82918b]">Approved</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-[#0e7a5a]">
              {approved.toLocaleString()}
            </p>
          </div>

          <div className="px-3 py-4 text-center sm:px-5">
            <p className="text-[11px] text-[#82918b]">Rejected</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-red-600">
              {rejected.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
