import Link from "next/link";
import { connection } from "next/server";
import { Search, UserRound } from "lucide-react";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

type AdminUsersPageProps = { searchParams: Promise<{ q?: string; role?: string }> };

const roleSchema = z.enum(["ADMIN", "PUBLISHER", "ADVERTISER"]);

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await connection();
  const params = await searchParams;
  const query = params.q?.trim().slice(0, 120) ?? "";
  const role = roleSchema.safeParse(params.role);
  const users = await prisma.user.findMany({
    where: {
      ...(role.success ? { role: role.data } : {}),
      ...(query ? { OR: [{ fullName: { contains: query } }, { email: { contains: query } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      lastLoginAt: true,
      publisherProfile: { select: { publisherName: true } },
      _count: { select: { sessions: true } },
    },
  });

  return (
    <section className="admin-content">
      <div className="admin-page-heading"><div><p className="eyebrow">Account directory</p><h1>Manage users</h1><p className="workspace-intro">Search accounts, inspect details, and manage account access.</p></div></div>
      <form className="user-filters" action="/admin/users">
        <label className="search-box"><Search size={16} /><input type="search" name="q" defaultValue={query} placeholder="Search name or email" /></label>
        <select name="role" defaultValue={role.success ? role.data : "ALL"} aria-label="Filter by role"><option value="ALL">All roles</option><option value="ADMIN">Admin</option><option value="PUBLISHER">Publisher</option><option value="ADVERTISER">Advertiser</option></select>
        <button className="secondary-button" type="submit">Filter users</button>
      </form>
      <div className="table-wrap">
        <table className="data-table admin-table">
          <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Created</th><th>Last login</th><th /></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id}><td><Link className="table-primary" href={`/admin/users/${user.id}`}>{user.fullName}</Link><span className="table-secondary">{user.email}</span>{user.publisherProfile && <span className="table-secondary">{user.publisherProfile.publisherName}</span>}</td><td><span className={`role-label role-label--${user.role.toLowerCase()}`}>{user.role.toLowerCase()}</span></td><td><span className={`status-label status-label--${user.status.toLowerCase()}`}>{user.status.toLowerCase()}</span></td><td>{user.createdAt.toLocaleDateString()}</td><td>{user.lastLoginAt?.toLocaleDateString() ?? "Never"}</td><td><Link className="icon-link" href={`/admin/users/${user.id}`} title="View user"><UserRound size={16} /><span className="sr-only">View {user.fullName}</span></Link></td></tr>)}</tbody>
        </table>
      </div>
      <p className="admin-table-note">Showing up to 100 matching users. Password hashes are never selected for this view.</p>
    </section>
  );
}