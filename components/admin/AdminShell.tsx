
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BadgeCheck,
  Building2,
  CircleUserRound,
  LayoutDashboard,
  ListChecks,
  Users,
  XCircle,
  ShieldCheck,
} from "lucide-react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Manage users", icon: Users },
  {
    href: "/admin/users?role=PUBLISHER",
    label: "Manage publishers",
    icon: CircleUserRound,
  },
  {
    href: "/admin/users?role=ADVERTISER",
    label: "Manage advertisers",
    icon: Building2,
  },
  {
    href: "/admin/websites",
    label: "Manage websites",
    icon: Activity,
  },
  {
    href: "/admin/websites/pending",
    label: "Pending approvals",
    icon: ListChecks,
  },
  {
    href: "/admin/websites/approved",
    label: "Approved websites",
    icon: BadgeCheck,
  },
  {
    href: "/admin/websites/rejected",
    label: "Rejected websites",
    icon: XCircle,
  },
];

export function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    const path = href.split("?")[0];

    if (href === "/admin/dashboard") {
      return pathname === path;
    }

    if (href === "/admin/users") {
      return (
        pathname === "/admin/users" &&
        !links.some(
          (link) =>
            link.href.startsWith("/admin/users?") &&
            typeof window !== "undefined" &&
            window.location.search === link.href.split("?")[1]
        )
      );
    }

    return pathname === path;
  };

  return (
    <div className="min-h-screen bg-[#f6f8f7] text-[#12211c] lg:flex">
      {/* Sidebar */}
      <aside className="flex w-full shrink-0 flex-col border-b border-[#e5eae8] bg-[#102c23] text-white lg:sticky lg:top-0 lg:h-screen lg:w-[260px] lg:border-b-0 lg:border-r lg:border-[#1d4034]">
        {/* Brand */}
        <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5 sm:px-7 lg:px-6">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2.5 text-[19px] font-bold tracking-tight"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-[#0e7a5a] text-[17px] text-white">
              L
            </span>
            <span>linkledger</span>
          </Link>

          <span className="rounded-md border border-white/15 px-2 py-1 text-[9px] font-bold tracking-[1.2px] text-[#b7d6c7] lg:hidden">
            ADMIN
          </span>
        </div>

        {/* Navigation */}
        <div className="px-4 py-5 lg:flex-1 lg:px-4 lg:py-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.5px] text-[#91afa1]">
            Administration
          </p>

          <nav
            aria-label="Admin navigation"
            className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {links.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);

              return (
                <Link
                  href={href}
                  key={href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-h-10 shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors lg:w-full ${
                    active
                      ? "bg-[#0e7a5a] text-white shadow-sm"
                      : "text-[#c0d1c8] hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  <Icon
                    size={17}
                    className={`shrink-0 ${
                      active
                        ? "text-white"
                        : "text-[#91afa1] group-hover:text-white"
                    }`}
                  />
                  <span className="whitespace-nowrap">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="hidden border-t border-white/10 p-5 lg:block">
          <div className="flex items-center gap-3 rounded-lg bg-white/[0.06] p-3">
            <div className="grid size-9 place-items-center rounded-lg bg-[#1c4939] text-[#b7d6c7]">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                Administrator console
              </p>
              <p className="mt-0.5 text-[10px] text-[#91afa1]">
                Secure workspace
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="min-w-0 flex-1">
        {/* Topbar */}
        <header className="sticky top-0 z-20 hidden h-[72px] items-center justify-between border-b border-[#e5eae8] bg-white/95 px-6 backdrop-blur sm:flex lg:px-9">
          <div className="flex items-center gap-2 text-[13px]">
            <span className="font-medium text-[#82918b]">LinkLedger</span>
            <span className="text-[#c4cec8]">/</span>
            <span className="font-semibold text-[#203d33]">Admin</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#dcebe3] bg-[#eaf5ef] px-3 py-1.5 text-[10px] font-bold tracking-[1px] text-[#0a6149]">
            <span className="size-1.5 rounded-full bg-[#0e7a5a]" />
            ADMIN WORKSPACE
          </div>
        </header>

        {/* Page Content */}
        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
