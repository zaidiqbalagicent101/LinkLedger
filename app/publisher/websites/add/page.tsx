import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { PublisherWebsiteForm } from "@/components/publisher/PublisherWebsiteForm";
import { PublisherAccountMenu } from "@/components/publisher/PublisherAccountMenu";
import { requirePublisherProfile } from "@/lib/auth";

const steps = [
  { title: "Submit details", description: "Tell us about your site." },
  { title: "Pending review", description: "New websites start as pending." },
  { title: "Admin approval", description: "An administrator approves it." },
];

export default async function AddPublisherWebsitePage() {
  await connection();
  await requirePublisherProfile();

  return (
    <main className="min-h-screen w-full bg-[#f6f8f7] text-[#12211c] antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#e5eae8] bg-white/80 backdrop-blur-md">
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

          <PublisherAccountMenu />
        </div>
      </header>

      {/* One continuous full-width page */}
      <section className="w-full px-6 py-8 sm:px-10 sm:py-10 lg:px-14">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex flex-wrap items-center gap-2 text-[13px] text-[#82918b]"
        >
          <Link
            href="/publisher/websites"
            className="rounded-md transition-colors hover:text-[#0e7a5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
          >
            My websites
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-[#12211c]">Add website</span>
        </nav>

        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0b2e24] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] bg-[length:22px_22px] px-7 py-9 text-white sm:px-10 sm:py-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 -top-24 size-64 rounded-full bg-[#0e7a5a]/30 blur-3xl"
          />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                <span className="size-1.5 rounded-full bg-emerald-300" />
                Publisher workspace
              </div>

              <h1 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[50px]">
                Add a website
              </h1>

              <p className="mt-3 max-w-[560px] text-[16px] leading-relaxed text-emerald-50/75">
                Submit a publication to LinkLedger and start connecting with
                advertisers looking for quality websites.
              </p>
            </div>

            <ol className="grid shrink-0 gap-3 sm:grid-cols-3 xl:w-[620px]">
              {steps.map((step, i) => (
                <li
                  key={step.title}
                  className="min-w-0 rounded-2xl border border-white/10 bg-white/10 px-5 py-4"
                >
                  <span className="grid size-7 place-items-center rounded-full bg-[#0e7a5a] text-xs font-semibold text-white ring-1 ring-emerald-300/40">
                    {i + 1}
                  </span>
                  <p className="mt-3 text-[15px] font-semibold">{step.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-emerald-50/70">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Review Notice */}
        <div className="mt-5 flex items-start gap-4 rounded-2xl border border-[#dcebe3] bg-[#edf6f1] px-5 py-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#0e7a5a]">
            <ShieldCheck size={19} />
          </span>

          <div>
            <p className="text-sm font-semibold text-[#12211c]">
              Website review process
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#5f6f69]">
              New websites are automatically marked as pending until an
              administrator reviews and approves them.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="mt-5 rounded-2xl border border-[#e5eae8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(18,33,28,0.3)] sm:p-8 xl:p-10">
          <div className="mb-8 border-b border-[#e5eae8] pb-5">
            <h2 className="text-[22px] font-semibold tracking-tight">
              Website information
            </h2>
            <p className="mt-1.5 text-sm text-[#5f6f69]">
              Enter your publication details below.
            </p>
          </div>

          <PublisherWebsiteForm />
        </div>

        {/* Back Link */}
        <Link
          href="/publisher/websites"
          className="group mt-6 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-[#5f6f69] transition-colors hover:text-[#0e7a5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]"
        >
          <ArrowLeft
            size={15}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          Back to my websites
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-6 border-t border-[#e5eae8] bg-white">
        <div className="flex w-full flex-col justify-between gap-2 px-6 py-6 text-[13px] text-[#82918b] sm:flex-row sm:px-10 lg:px-14">
          <span>© 2026 LinkLedger</span>
          <Link
            href="/publisher/websites"
            className="inline-flex items-center gap-1 font-medium transition-colors hover:text-[#0e7a5a]"
          >
            My websites
            <ArrowRight size={13} />
          </Link>
        </div>
      </footer>
    </main>
  );
}