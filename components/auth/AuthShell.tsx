
import Link from "next/link";
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  Globe2,
  PenLine,
} from "lucide-react";

type AuthShellProps = {
  children: React.ReactNode;
  role?: "advertiser" | "publisher" | "login";
};

const copy = {
  advertiser: {
    eyebrow: "For advertisers",
    title: "Put your next story in the right place.",
    text: "Find independent publishers with the audiences and expertise your brand needs.",
    stat: "A better way to build reach",
    icon: ChartNoAxesCombined,
  },
  publisher: {
    eyebrow: "For publishers",
    title: "Make your editorial work count.",
    text: "Meet brands that value your voice, your audience, and the work behind every story.",
    stat: "Your publication, your terms",
    icon: PenLine,
  },
  login: {
    eyebrow: "The content partnership platform",
    title: "Good partnerships start with a good match.",
    text: "LinkLedger brings thoughtful advertisers and trusted publishers to the same table.",
    stat: "Built for lasting partnerships",
    icon: Globe2,
  },
};

export function AuthShell({
  children,
  role = "login",
}: AuthShellProps) {
  const story = copy[role];
  const StoryIcon = story.icon;

  return (
    <main className="grid min-h-screen bg-white text-[#12211c] antialiased lg:grid-cols-2">

      {/* Left Story Panel */}
      <aside className="relative hidden min-h-screen flex-col justify-between overflow-hidden border-r border-[#e5eae8] bg-[radial-gradient(circle_at_85%_75%,rgba(14,122,90,0.09),transparent_36%),linear-gradient(145deg,#f6faf8_0%,#edf6f1_100%)] px-10 py-9 lg:flex xl:px-16">

        <Link
          href="/"
          aria-label="LinkLedger home"
          className="inline-flex w-fit items-center gap-2.5 text-[19px] font-bold tracking-tight"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-[#0e7a5a] text-[17px] text-white">
            L
          </span>
          LinkLedger
        </Link>

        <div className="relative z-10 my-auto w-full max-w-[490px] py-14">

          <p className="mb-5 text-xs font-bold uppercase tracking-[1.4px] text-[#0a6149]">
            {story.eyebrow}
          </p>

          <h1 className="max-w-[470px] text-[clamp(38px,4.1vw,54px)] font-semibold leading-[1.1] tracking-[-2px]">
            {story.title}
          </h1>

          <p className="mt-5 max-w-[410px] text-[17px] leading-[1.75] text-[#5f6f69]">
            {story.text}
          </p>

          {/* Illustration */}
          <div
            className="relative mx-auto my-10 grid h-[260px] w-full max-w-[390px] place-items-center"
            aria-hidden="true"
          >
            <div className="absolute size-[215px] rounded-full border border-[#0e7a5a]/15" />

            <div className="absolute h-[160px] w-[310px] rotate-[-28deg] rounded-[50%] border border-[#0e7a5a]/15" />

            {/* Center */}
            <div className="relative z-10 flex size-28 flex-col items-center justify-center gap-2 rounded-[25px] border border-[#d9ebe2] bg-white text-center text-[13px] font-bold leading-tight text-[#0a6149] shadow-[0_15px_40px_-22px_rgba(18,33,28,0.25)]">
              <span className="grid size-9 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
                <StoryIcon size={25} strokeWidth={1.7} />
              </span>
              <span>
                link
                <br />
                ledger
              </span>
            </div>

            {/* Floating icons */}
            <span className="absolute left-[47%] top-[15px] z-20 grid size-[43px] place-items-center rounded-xl border border-[#dce9e2] bg-white text-[#0e7a5a] shadow-md">
              <PenLine size={18} />
            </span>

            <span className="absolute bottom-[10px] left-[19%] z-20 grid size-[43px] place-items-center rounded-xl border border-[#dce9e2] bg-white text-[#0e7a5a] shadow-md">
              <ChartNoAxesCombined size={18} />
            </span>

            <span className="absolute right-[13%] top-[45%] z-20 grid size-[43px] place-items-center rounded-xl border border-[#dce9e2] bg-white text-[#0e7a5a] shadow-md">
              <Globe2 size={18} />
            </span>
          </div>

          {/* Bottom highlight */}
          <div className="flex w-fit items-center gap-3 rounded-xl border border-[#dce9e2] bg-white/80 px-4 py-3">
            <span className="grid size-7 place-items-center rounded-lg bg-[#e7f4ed] text-[#0e7a5a]">
              <StoryIcon size={17} />
            </span>

            <span className="text-[13px] font-semibold text-[#12211c]">
              {story.stat}
            </span>

            <ArrowUpRight size={17} className="ml-2 text-[#0e7a5a]" />
          </div>
        </div>

        <p className="text-xs text-[#82918b]">
          © 2026 LinkLedger
        </p>
      </aside>

      {/* Right Form Panel */}
      <section className="flex min-h-screen min-w-0 flex-col justify-center bg-white px-5 py-8 sm:px-10 lg:px-12 xl:px-20">

        {/* Mobile Brand */}
        <div className="mb-10 lg:hidden">
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
        </div>

        <div className="mx-auto w-full max-w-[430px]">
          {children}
        </div>

      </section>
    </main>
  );
}
