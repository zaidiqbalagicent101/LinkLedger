
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  ExternalLink,
  Globe2,
  CalendarDays,
  Users,
  Eye,
  Inbox,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { WebsiteApprovalStatus } from "@/generated/prisma/enums";

const labels: Record<string, string> = {
  all: "All websites",
  PENDING: "Pending approvals",
  APPROVED: "Approved websites",
  REJECTED: "Rejected websites",
};

const statusStyles: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-green-200 bg-green-50 text-green-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
};

export async function AdminWebsiteList({
  status,
}: {
  status?: WebsiteApprovalStatus;
}) {
  await connection();

  const websites = await prisma.publisherWebsite.findMany({
    where: status ? { approvalStatus: status } : undefined,
    orderBy: [{ approvalStatus: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      websiteName: true,
      websiteUrl: true,
      websiteNiche: true,
      monthlyTraffic: true,
      approvalStatus: true,
      createdAt: true,
      publisherProfile: {
        select: {
          publisherName: true,
          user: { select: { email: true } },
        },
      },
    },
  });

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-7 sm:py-10 lg:px-9">
      {/* Page Heading */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dcebe3] bg-[#eaf5ef] px-3 py-1 text-[11px] font-semibold text-[#0a6149]">
            <Globe2 size={13} />
            Website management
          </span>

          <h1 className="mt-4 text-[28px] font-semibold tracking-[-1px] text-[#12211c] sm:text-[34px]">
            {labels[status ?? "all"]}
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[#5f6f69]">
            Review publisher websites, check submitted details and manage approval status.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#e5eae8] bg-white px-4 py-3">
          <Globe2 size={17} className="text-[#0e7a5a]" />
          <span className="text-sm font-semibold tabular-nums text-[#203d33]">
            {websites.length.toLocaleString()}
          </span>
          <span className="text-xs text-[#82918b]">records</span>
        </div>
      </div>

      {/* Website Table */}
      {websites.length ? (
        <div className="overflow-hidden rounded-xl border border-[#e5eae8] bg-white shadow-[0_8px_30px_-25px_rgba(18,33,28,0.2)]">
          <div className="flex items-center justify-between border-b border-[#e5eae8] px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-semibold text-[#203d33]">
                Website submissions
              </h2>
              <p className="mt-1 text-xs text-[#82918b]">
                Publisher website records and review information
              </p>
            </div>
            <span className="hidden items-center gap-1.5 text-xs text-[#82918b] sm:inline-flex">
              <Users size={14} />
              Publisher directory
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#e5eae8] bg-[#f8faf9]">
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b] sm:px-6">
                    Website
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                    Publisher
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                    Niche
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                    Traffic*
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                    Submitted
                  </th>
                  <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#edf1ee]">
                {websites.map((website) => (
                  <tr
                    key={website.id}
                    className="transition-colors hover:bg-[#fbfcfb]"
                  >
                    {/* Website */}
                    <td className="max-w-[240px] px-5 py-4 sm:px-6">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-[#eaf5ef] text-[#0e7a5a]">
                          <Globe2 size={17} />
                        </div>

                        <div className="min-w-0">
                          <Link
                            href={`/admin/websites/${website.id}`}
                            className="block break-words text-[13px] font-semibold text-[#203d33] transition-colors hover:text-[#0e7a5a]"
                          >
                            {website.websiteName}
                          </Link>

                          <a
                            href={website.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex max-w-full items-center gap-1 break-all text-[11px] text-[#82918b] transition-colors hover:text-[#0e7a5a]"
                          >
                            {website.websiteUrl}
                            <ExternalLink size={11} className="shrink-0" />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Publisher */}
                    <td className="max-w-[190px] px-5 py-4">
                      <p className="break-words text-[12px] font-semibold text-[#203d33]">
                        {website.publisherProfile.publisherName}
                      </p>
                      <p className="mt-1 break-all text-[11px] text-[#82918b]">
                        {website.publisherProfile.user.email}
                      </p>
                    </td>

                    {/* Niche */}
                    <td className="px-5 py-4">
                      <span className="inline-block max-w-[130px] truncate rounded-md bg-[#f2f5f3] px-2.5 py-1.5 text-[11px] font-medium text-[#5f6f69]">
                        {website.websiteNiche}
                      </span>
                    </td>

                    {/* Traffic */}
                    <td className="px-5 py-4">
                      <span className="text-[13px] font-semibold tabular-nums text-[#203d33]">
                        {website.monthlyTraffic.toLocaleString()}
                      </span>
                      <p className="mt-0.5 text-[10px] text-[#a0aaa4]">
                        Monthly visits
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                          statusStyles[website.approvalStatus] ??
                          "border-gray-200 bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {website.approvalStatus.toLowerCase()}
                      </span>
                    </td>

                    {/* Submitted */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] text-[#5f6f69]">
                        <CalendarDays size={13} className="text-[#a0aaa4]" />
                        {website.createdAt.toLocaleDateString()}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/websites/${website.id}`}
                        title="Review website"
                        aria-label={`Review ${website.websiteName}`}
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-[#e5eae8] text-[#5f6f69] transition-all hover:border-[#b8d9cb] hover:bg-[#eaf5ef] hover:text-[#0e7a5a]"
                      >
                        <ArrowRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#e5eae8] bg-[#fbfcfb] px-5 py-3.5 sm:px-6">
            <p className="text-[11px] leading-relaxed text-[#82918b]">
              * Traffic and domain metrics are publisher-reported and have not been independently verified.
            </p>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-xl border border-dashed border-[#cbd7cf] bg-white px-6 py-14 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#eaf5ef] text-[#0e7a5a]">
            <Inbox size={27} />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-[#12211c]">
            No websites in this view
          </h2>

          <p className="mx-auto mt-2 max-w-[360px] text-sm leading-relaxed text-[#78847e]">
            Submitted websites will appear here for review.
          </p>
        </div>
      )}
    </section>
  );
}
