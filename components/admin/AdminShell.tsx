import Link from "next/link";
import { Activity, BadgeCheck, Building2, CircleUserRound, LayoutDashboard, ListChecks, Users, XCircle } from "lucide-react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Manage users", icon: Users },
  { href: "/admin/users?role=PUBLISHER", label: "Manage publishers", icon: CircleUserRound },
  { href: "/admin/users?role=ADVERTISER", label: "Manage advertisers", icon: Building2 },
  { href: "/admin/websites", label: "Manage websites", icon: Activity },
  { href: "/admin/websites/pending", label: "Pending approvals", icon: ListChecks },
  { href: "/admin/websites/approved", label: "Approved websites", icon: BadgeCheck },
  { href: "/admin/websites/rejected", label: "Rejected websites", icon: XCircle },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link className="brand brand--light" href="/admin/dashboard"><span className="brand-mark">L</span><span>linkledger</span></Link>
        <p className="admin-sidebar__label">Administration</p>
        <nav className="admin-nav" aria-label="Admin navigation">
          {links.map(({ href, label, icon: Icon }) => <Link href={href} key={href}><Icon size={16} /><span>{label}</span></Link>)}
        </nav>
        <div className="admin-sidebar__foot"><span className="admin-indicator" /> Administrator console</div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar"><span>LinkLedger / Admin</span><span>ADMIN WORKSPACE</span></header>
        {children}
      </div>
    </div>
  );
}