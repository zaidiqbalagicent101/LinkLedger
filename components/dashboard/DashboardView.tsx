import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ClipboardList,
  Globe2,
  LogOut,
  Search,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";
import type { AuthenticatedUser } from "@/lib/auth";
import { AdvertiserAccountMenu } from "@/components/advertiser/AdvertiserAccountMenu";
import { PublisherAccountMenu } from "@/components/publisher/PublisherAccountMenu";

type WorkspaceAction = {
  href: string;
  title: string;
  description: string;
  cta: string;
  icon: LucideIcon;
};

type Step = {
  title: string;
  description: string;
  href?: string;
};

const PUBLISHER_ACTIONS: WorkspaceAction[] = [
  {
    href: "/publisher/websites",
    title: "My websites",
    description:
      "Add the sites you publish on, keep their details current, and get them in front of advertisers.",
    cta: "Manage websites",
    icon: Globe2,
  },
  {
    href: "/publisher/onboarding",
    title: "Edit profile",
    description: "Keep your publisher profile and business details up to date.",
    cta: "Update profile",
    icon: UserRound,
  },
];

const ADVERTISER_ACTIONS: WorkspaceAction[] = [
  {
    href: "/advertiser/marketplace",
    title: "Browse marketplace",
    description:
      "Discover publishers, filter by what matters to you, and find the right sites for your content.",
    cta: "Browse marketplace",
    icon: Search,
  },
  {
    href: "/advertiser/orders",
    title: "My orders",
    description: "Follow every sponsored content order from request to delivery.",
    cta: "View orders",
    icon: ClipboardList,
  },
];

const PUBLISHER_STEPS: Step[] = [
  {
    title: "Add your website",
    description: "List the sites you want advertisers to find.",
    href: "/publisher/websites",
  },
  {
    title: "Complete your profile",
    description: "Business details help advertisers trust your listings.",
    href: "/publisher/onboarding",
  },
  {
    title: "Fulfil orders",
    description: "Sponsored content orders will show up in your workspace.",
  },
];

const ADVERTISER_STEPS: Step[] = [
  {
    title: "Discover publishers",
    description: "Filter the marketplace to find sites in your niche.",
    href: "/advertiser/marketplace",
  },
  {
    title: "Compare websites",
    description: "Review each site's details before you decide.",
    href: "/advertiser/marketplace",
  },
  {
    title: "Place and track orders",
    description: "Keep every sponsored content order in one place.",
    href: "/advertiser/orders",
  },
];

/* Decorative network of listings: one moment of motion on page load. */
const MOTIF_PATHS = [
  "M40 250 C120 250 120 150 200 150",
  "M200 150 C280 150 280 70 360 70",
  "M200 150 C280 150 300 240 380 240",
  "M360 70 L440 110",
  "M380 240 L450 190",
];

const MOTIF_NODES = [
  { x: 40, y: 250 },
  { x: 360, y: 70 },
  { x: 380, y: 240 },
  { x: 440, y: 110 },
  { x: 450, y: 190 },
];

function LedgerMotif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 320"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g className="ll-lines" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round">
        {MOTIF_PATHS.map((d) => (
          <path key={d} d={d} pathLength={1} />
        ))}
      </g>

      {MOTIF_NODES.map((n, i) => (
        <g
          key={`${n.x}-${n.y}`}
          className="ll-node"
          style={{ animationDelay: `${0.5 + i * 0.18}s` }}
        >
          <rect
            x={n.x - 15}
            y={n.y - 15}
            width="30"
            height="30"
            rx="9"
            fill="#0f3f31"
            stroke="#34d399"
            strokeWidth="1.5"
          />
          <path
            d={`M${n.x - 6} ${n.y - 3} H${n.x + 6} M${n.x - 6} ${n.y + 4} H${n.x + 2}`}
            stroke="#a7f3d0"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      ))}

      <g className="ll-node" style={{ animationDelay: "0.3s" }}>
        <rect x="176" y="126" width="48" height="48" rx="14" fill="#0e7a5a" />
        <rect
          x="176"
          y="126"
          width="48"
          height="48"
          rx="14"
          stroke="#6ee7b7"
          strokeWidth="1.5"
        />
        <path
          d="M192 158 L208 142 M200 142 H208 V150"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function DashboardView({ user }: { user: AuthenticatedUser }) {
  const roleName = user.role === "ADVERTISER" ? "Advertiser" : "Publisher";
  const firstName = user.fullName.split(" ")[0];
  const isPublisher = user.role === "PUBLISHER";
  const isAdvertiser = user.role === "ADVERTISER";

  const actions = isPublisher ? PUBLISHER_ACTIONS : ADVERTISER_ACTIONS;
  const steps = isPublisher ? PUBLISHER_STEPS : ADVERTISER_STEPS;
  const [featured, ...secondary] = actions;
  const FeaturedIcon = featured.icon;

  const heroLine = isPublisher
    ? "List your sites and start receiving sponsored content orders."
    : "Find the right publishers and keep every order in one place.";

  return (
    <main className="min-h-screen w-full bg-[#f6f8f7] text-[#12211c] antialiased">
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .ll-lines path {
            stroke-dasharray: 1;
            stroke-dashoffset: 1;
            animation: ll-draw 1.8s cubic-bezier(0.65, 0, 0.35, 1) 0.2s forwards;
          }
          .ll-node {
            opacity: 0;
            transform-box: fill-box;
            transform-origin: center;
            animation: ll-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          @keyframes ll-draw { to { stroke-dashoffset: 0; } }
          @keyframes ll-pop {
            from { opacity: 0; transform: scale(0.6); }
            to { opacity: 1; transform: scale(1); }
          }
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#e5eae8] bg-white/80 backdrop-blur-md">
        <div className="flex h-[72px] w-full items-center justify-between px-6 sm:px-10 lg:px-14">
          <Link
            href="/"
            aria-label="LinkLedger home"
            className="inline-flex items-center gap-2.5 text-[19px] font-bold tracking-tight"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-[#0e7a5a] text-[17px] text-white">
              L
            </span>
            LinkLedger
          </Link>

          <div className="flex items-center gap-4">
            {isPublisher ? (
              <PublisherAccountMenu />
            ) : isAdvertiser ? (
              <AdvertiserAccountMenu />
            ) : (
              <>
                <span className="hidden text-sm text-[#5f6f69] sm:block">
                  {user.email}
                </span>
                <form action={logoutAction}>
                  <button
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#e5eae8] bg-white px-3.5 text-sm font-semibold text-[#12211c] transition-colors hover:border-[#c3d3cc] hover:bg-[#f6f8f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
                    type="submit"
                    title="Sign out"
                  >
                    <LogOut size={16} />
                    <span>Sign out</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="w-full px-6 py-8 sm:px-10 sm:py-10 lg:px-14">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0b2e24] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] bg-[length:22px_22px] px-7 py-12 text-white sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-[#0e7a5a]/30 blur-3xl"
          />
          <LedgerMotif className="pointer-events-none absolute right-0 top-1/2 hidden h-[115%] -translate-y-1/2 md:block" />

          <div className="relative max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
              <span className="size-1.5 rounded-full bg-emerald-300" />
              {roleName} workspace
            </div>

            <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[58px]">
              Welcome, {firstName}.
            </h1>

            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-emerald-50/75">
              {heroLine}
            </p>
          </div>
        </div>

        {/* Workspace actions */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">Your workspace</h2>
          <p className="mt-1.5 text-sm text-[#5f6f69]">
            Manage your LinkLedger account and get started.
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {/* Featured action */}
            <Link
              href={featured.href}
              className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-2xl bg-[#0e7a5a] p-7 !text-white transition-colors duration-200 hover:bg-[#0b6a4e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a] lg:col-span-2"
            >
              <FeaturedIcon
                size={190}
                strokeWidth={1}
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 -right-8 text-white/10 transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3"
              />

              <div className="relative flex items-start justify-between">
                <span className="grid size-12 place-items-center rounded-xl bg-white/15 text-white">
                  <FeaturedIcon size={22} />
                </span>
                <span className="grid size-10 place-items-center rounded-full bg-white/15 text-white transition-colors duration-200 group-hover:bg-white group-hover:text-[#0e7a5a]">
                  <ArrowUpRight size={18} />
                </span>
              </div>

              <div className="relative">
                <h3 className="text-2xl font-semibold tracking-tight text-white">
                  {featured.title}
                </h3>
                <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-emerald-50/80">
                  {featured.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
                  {featured.cta}
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>

            {/* Secondary actions */}
            {secondary.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex min-h-[260px] flex-col justify-between rounded-2xl border border-[#e5eae8] bg-white p-7 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0e7a5a] hover:shadow-[0_18px_36px_-24px_rgba(14,122,90,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-12 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a] transition-colors duration-200 group-hover:bg-[#0e7a5a] group-hover:text-white">
                      <Icon size={22} />
                    </span>
                    <ArrowUpRight
                      size={19}
                      className="text-[#82918b] transition-colors group-hover:text-[#0e7a5a]"
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-[#12211c]">
                      {action.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#5f6f69]">
                      {action.description}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0e7a5a]">
                      {action.cta}
                      <ArrowRight
                        size={15}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Getting started: a real sequence, so numbered */}
        <div className="mt-10 rounded-2xl border border-[#e5eae8] bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">Getting started</h2>
          <p className="mt-1.5 text-sm text-[#5f6f69]">
            Three steps to get the most out of your {roleName.toLowerCase()} account.
          </p>

          <ol className="mt-7 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {steps.map((step, i) => (
              <li key={step.title}>
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e7f4ed] text-sm font-semibold text-[#0a6149]">
                    {i + 1}
                  </span>
                  {i < steps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="hidden h-px flex-1 border-t border-dashed border-[#c3d3cc] sm:block"
                    />
                  )}
                </div>

                <h3 className="mt-4 text-[15px] font-semibold">
                  {step.href ? (
                    <Link
                      href={step.href}
                      className="inline-flex items-center gap-1.5 text-[#12211c] transition-colors hover:text-[#0e7a5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
                    >
                      {step.title}
                      <ArrowRight size={14} />
                    </Link>
                  ) : (
                    step.title
                  )}
                </h3>
                <p className="mt-1.5 max-w-[260px] text-sm leading-relaxed text-[#5f6f69]">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5eae8] bg-white">
        <div className="flex w-full flex-col justify-between gap-2 px-6 py-6 text-[13px] text-[#82918b] sm:flex-row sm:px-10 lg:px-14">
          <span>Signed in as {user.email}</span>
          <span>© 2026 LinkLedger · {roleName}</span>
        </div>
      </footer>
    </main>
  );
}