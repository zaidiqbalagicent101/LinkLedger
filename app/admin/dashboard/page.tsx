import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  await connection();
  const [totalUsers, publishers, advertisers, websites, pending, approved, rejected] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "PUBLISHER" } }),
    prisma.user.count({ where: { role: "ADVERTISER" } }),
    prisma.publisherWebsite.count(),
    prisma.publisherWebsite.count({ where: { approvalStatus: "PENDING" } }),
    prisma.publisherWebsite.count({ where: { approvalStatus: "APPROVED" } }),
    prisma.publisherWebsite.count({ where: { approvalStatus: "REJECTED" } }),
  ]);

  const metrics = [
    { label: "Total users", value: totalUsers, href: "/admin/users", accent: "green" },
    { label: "Publishers", value: publishers, href: "/admin/users?role=PUBLISHER", accent: "coral" },
    { label: "Advertisers", value: advertisers, href: "/admin/users?role=ADVERTISER", accent: "blue" },
    { label: "Total websites", value: websites, href: "/admin/websites", accent: "green" },
    { label: "Pending approvals", value: pending, href: "/admin/websites/pending", accent: "amber" },
    { label: "Approved websites", value: approved, href: "/admin/websites/approved", accent: "green" },
    { label: "Rejected websites", value: rejected, href: "/admin/websites/rejected", accent: "red" },
  ];

  return (
    <section className="admin-content">
      <div className="admin-page-heading"><div><p className="eyebrow">Overview</p><h1>Admin dashboard</h1><p className="workspace-intro">A current view of LinkLedger accounts and publisher submissions.</p></div></div>
      <div className="metric-grid">
        {metrics.map((metric, index) => <Link className={`metric-card metric-card--${metric.accent}`} href={metric.href} key={metric.label}><span className="metric-card__index">0{index + 1}</span><span className="metric-card__label">{metric.label}</span><strong>{metric.value.toLocaleString()}</strong><ArrowRight size={16} /></Link>)}
      </div>
      <div className="admin-action-band"><div><p className="eyebrow">Publisher-first workflow</p><h2>{pending ? `${pending} website${pending === 1 ? "" : "s"} need review` : "Review queue is clear"}</h2><p>Only approved websites are eligible for future marketplace visibility.</p></div><Link className="primary-button" href="/admin/websites/pending">Open approvals <ArrowRight size={16} /></Link></div>
    </section>
  );
}