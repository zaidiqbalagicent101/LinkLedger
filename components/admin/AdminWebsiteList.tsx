import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { WebsiteApprovalStatus } from "@/generated/prisma/enums";

const labels: Record<string, string> = {
  all: "All websites",
  PENDING: "Pending approvals",
  APPROVED: "Approved websites",
  REJECTED: "Rejected websites",
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
    <section className="admin-content">
      <div className="admin-page-heading"><div><p className="eyebrow">Review queue</p><h1>{labels[status ?? "all"]}</h1></div><span className="admin-count">{websites.length} records</span></div>
      {websites.length ? (
        <div className="table-wrap">
          <table className="data-table admin-table">
            <thead><tr><th>Website</th><th>Publisher</th><th>Niche</th><th>Traffic*</th><th>Status</th><th>Submitted</th><th /></tr></thead>
            <tbody>
              {websites.map((website) => (
                <tr key={website.id}>
                  <td><Link className="table-primary" href={`/admin/websites/${website.id}`}>{website.websiteName}</Link><a className="table-secondary" href={website.websiteUrl} target="_blank" rel="noreferrer">{website.websiteUrl}<ExternalLink size={12} /></a></td>
                  <td><span className="table-primary">{website.publisherProfile.publisherName}</span><span className="table-secondary">{website.publisherProfile.user.email}</span></td>
                  <td>{website.websiteNiche}</td>
                  <td>{website.monthlyTraffic.toLocaleString()}</td>
                  <td><span className={`status-label status-label--${website.approvalStatus.toLowerCase()}`}>{website.approvalStatus.toLowerCase()}</span></td>
                  <td>{website.createdAt.toLocaleDateString()}</td>
                  <td><Link className="icon-link" href={`/admin/websites/${website.id}`} title="Review website"><ArrowRight size={16} /><span className="sr-only">Review {website.websiteName}</span></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="empty-state"><h2>No websites in this view</h2><p>Submitted websites will appear here for review.</p></div>}
      <p className="metrics-disclaimer">* Traffic and domain metrics are publisher-reported and have not been independently verified.</p>
    </section>
  );
}