"use client";

import Link from "next/link";
import { ChevronDown, Globe2, Inbox, LogOut, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/lib/auth-actions";

const menuItems = [
  { href: "/publisher/websites", label: "My websites", icon: Globe2 },
  { href: "/publisher/orders", label: "Incoming orders", icon: Inbox },
  { href: "/publisher/onboarding", label: "Edit profile", icon: UserRound },
];

export function PublisherAccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={menuRef} className="relative z-50">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-full border bg-white py-1 pl-1 pr-3.5 text-sm font-semibold text-[#12211c] transition-colors hover:border-[#b8d9cb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a] ${
          isOpen ? "border-[#0e7a5a]" : "border-[#e5eae8]"
        }`}
      >
        <span
          aria-hidden="true"
          className="grid size-8 place-items-center rounded-full bg-[#0e7a5a] text-[13px] font-semibold text-white"
        >
          P
        </span>
        Publisher
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#5f6f69] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-[#e5eae8] bg-white p-1.5 shadow-[0_24px_48px_-20px_rgba(18,33,28,0.4)]">
          {menuItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#203d33] transition-colors hover:bg-[#f3f8f5] focus-visible:outline-2 focus-visible:outline-[#0e7a5a]"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-[#e7f4ed] text-[#0e7a5a] transition-colors group-hover:bg-[#0e7a5a] group-hover:text-white">
                <Icon size={16} />
              </span>
              {label}
            </Link>
          ))}

          <div className="my-1.5 border-t border-[#eef2f0]" />

          <form action={logoutAction}>
            <button
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#9b2c25] transition-colors hover:bg-[#fff3f1] focus-visible:outline-2 focus-visible:outline-[#9b2c25]"
              type="submit"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-[#fdeceb]">
                <LogOut size={16} />
              </span>
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}