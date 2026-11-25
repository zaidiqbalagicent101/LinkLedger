
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  Store,
  UserRound,
} from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";

export function AdvertiserAccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const menuItems = [
    {
      label: "Browse marketplace",
      href: "/advertiser/marketplace",
      icon: Store,
      description: "Discover publishing services",
    },
    {
      label: "My orders",
      href: "/advertiser/orders",
      icon: ShoppingBag,
      description: "Track your purchases",
    },
  ];

  return (
    <div ref={menuRef} className="relative z-50">
      {/* Account trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Open advertiser account menu"
        className={`group inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-1.5 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a] ${
          isOpen
            ? "border-[#b8d9cb] bg-[#f0f7f2] shadow-sm"
            : "border-[#e5eae8] bg-white hover:border-[#b8d9cb] hover:bg-[#fbfdfb] hover:shadow-sm"
        }`}
      >
        <span className="grid size-8 place-items-center rounded-lg bg-[#e8f3ed] text-[#0e7a5a] transition-colors duration-200 group-hover:bg-[#0e7a5a] group-hover:text-white">
          <UserRound size={16} />
        </span>

        <span className="hidden text-left sm:block">
          <span className="block text-[12px] font-bold leading-tight text-[#203d33]">
            Advertiser
          </span>
          <span className="mt-0.5 block text-[9px] font-medium text-[#82918b]">
            Account menu
          </span>
        </span>

        <ChevronDown
          size={15}
          className={`ml-0.5 shrink-0 text-[#718078] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#0e7a5a]" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="menu"
          aria-label="Advertiser account navigation"
          className="absolute right-0 mt-3 w-[290px] origin-top-right overflow-hidden rounded-2xl border border-[#e3ebe6] bg-white shadow-[0_22px_55px_-20px_rgba(11,46,36,0.25)]"
        >
          {/* Account identity */}
          <div className="relative overflow-hidden bg-[#0b2e24] px-5 py-5 text-white">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[length:18px_18px]"
            />

            <div
              aria-hidden="true"
              className="absolute -right-10 -top-12 size-32 rounded-full bg-[#0e7a5a]/40 blur-3xl"
            />

            <div className="relative flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-emerald-200 shadow-inner">
                <UserRound size={21} />
              </span>

              <div className="min-w-0">
                <p className="text-[14px] font-bold tracking-tight">
                  Advertiser workspace
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-emerald-100/65">
                  <span className="size-1.5 rounded-full bg-emerald-300" />
                  Manage your account
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-2.5">
            <p className="px-3 pb-2 pt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#9aa79f]">
              Workspace
            </p>

            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/advertiser/marketplace" &&
                    pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
                      isActive
                        ? "bg-[#edf6f0] text-[#0e7a5a]"
                        : "text-[#52665b] hover:bg-[#f5f8f5] hover:text-[#0e7a5a]"
                    }`}
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-[#dceee2] text-[#0e7a5a]"
                          : "bg-[#f2f6f3] text-[#788b7e] group-hover:bg-[#e5f2e9] group-hover:text-[#0e7a5a]"
                      }`}
                    >
                      <Icon size={16} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-bold">
                        {item.label}
                      </span>
                      <span
                        className={`mt-0.5 block text-[10px] ${
                          isActive
                            ? "text-[#5e8b72]"
                            : "text-[#94a098]"
                        }`}
                      >
                        {item.description}
                      </span>
                    </span>

                    {isActive ? (
                      <span className="size-1.5 shrink-0 rounded-full bg-[#0e7a5a]" />
                    ) : (
                      <span className="size-1.5 shrink-0 rounded-full bg-transparent transition-colors group-hover:bg-[#9ac9ad]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-[#edf1ee] bg-[#fcfdfc] p-2.5">
            <form action={logoutAction}>
              <button
                className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 hover:bg-[#fff2f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c44a40]"
                type="submit"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#fff0ee] text-[#b64b42] transition-colors duration-200 group-hover:bg-[#fce0dc]">
                  <LogOut size={16} />
                </span>

                <span className="flex-1">
                  <span className="block text-[12px] font-bold text-[#a63c34]">
                    Log out
                  </span>
                  <span className="mt-0.5 block text-[10px] text-[#bd817b]">
                    Sign out of your account
                  </span>
                </span>
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[#edf1ee] px-4 py-2.5">
            <span className="text-[9px] font-semibold tracking-wide text-[#a0aca5]">
              POWERED BY LINKLEDGER
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#0e7a5a]">
              <span className="size-1.5 rounded-full bg-[#0e7a5a]" />
              Active session
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
