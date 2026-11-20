import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminUserStatusForm } from "@/components/admin/AdminUserStatusForm";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AdminUserPageProps = { params: Promise<{ userId: string }> };

export default async function AdminUserDetailsPage({ params }: AdminUserPageProps) {
  await connection();
  const admin = await requireRole("ADMIN");
  const { userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
      country: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
      publisherProfile: {
        include: {
          websites: {
            orderBy: { createdAt: "desc" },
            select: { id: true, websiteName: true, websiteUrl: true, approvalStatus: true, createdAt: true },
          },
        },
      },
    },
  });

  if (!user) notFound();

  return (
    <section className="admin-content">
      <Link className="back-link" href="/admin/users"><ArrowLeft size={15} /> Manage users</Link>
      <div className="admin-page-heading"><div><p className="eyebrow">User account</p><h1>{user.fullName}</h1><p className="workspace-intro">{user.email}</p></div><span className={`role-label role-label--${user.role.toLowerCase()}`}>{user.role.toLowerCase()}</span></div>
      <div className="admin-detail-columns">
        <section className="admin-section"><h2>Account details</h2><dl className="details-grid"><div><dt>Status</dt><dd><span className={`status-label status-label--${user.status.toLowerCase()}`}>{user.status.toLowerCase()}</span></dd></div><div><dt>Country</dt><dd>{user.country}</dd></div><div><dt>Created</dt><dd>{user.createdAt.toLocaleString()}</dd></div><div><dt>Last updated</dt><dd>{user.updatedAt.toLocaleString()}</dd></div><div><dt>Last login</dt><dd>{user.lastLoginAt?.toLocaleString() ?? "Never"}</dd></div></dl><AdminUserStatusForm userId={user.id} status={user.status} isSelf={admin.id === user.id} /></section>
        {user.publisherProfile && <section className="admin-section"><h2>Publisher profile</h2><dl className="details-grid"><div><dt>Publisher name</dt><dd>{user.publisherProfile.publisherName}</dd></div><div><dt>Business name</dt><dd>{user.publisherProfile.businessName ?? "Not provided"}</dd></div><div><dt>Country</dt><dd>{user.publisherProfile.country}</dd></div><div><dt>Contact</dt><dd>{user.publisherProfile.contactNumber ?? "Not provided"}</dd></div><div className="details-grid__wide"><dt>Description</dt><dd>{user.publisherProfile.description}</dd></div></dl><h3>Websites ({user.publisherProfile.websites.length})</h3>{user.publisherProfile.websites.length ? <ul className="compact-list">{user.publisherProfile.websites.map((website) => <li key={website.id}><Link href={`/admin/websites/${website.id}`}>{website.websiteName} <ExternalLink size={13} /></Link><span className={`status-label status-label--${website.approvalStatus.toLowerCase()}`}>{website.approvalStatus.toLowerCase()}</span></li>)}</ul> : <p className="muted-copy">No websites submitted.</p>}</section>}
      </div>
    </section>
  );
}