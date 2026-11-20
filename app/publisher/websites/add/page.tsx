
import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft, ArrowRight, Globe2 } from "lucide-react";
import { PublisherWebsiteForm } from "@/components/publisher/PublisherWebsiteForm";
import { requirePublisherProfile } from "@/lib/auth";

export default async function AddPublisherWebsitePage() {
  await connection();
  await requirePublisherProfile();

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#12211c] antialiased">

      {/* Header */}
      <header className="border-b border-[#e5eae8] bg-white">
        <div className="mx-auto flex h-[72px] w-[calc(100%-40px)] max-w-[1040px] items-center justify-between">

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

          <Link
            href="/publisher/websites"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5f6f69] transition-colors hover:text-[#0e7a5a]"
          >
            <ArrowLeft size={16} />
            My websites
          </Link>
        </div>
      </header>

      {/* Page Content */}
      <section className="mx-auto w-[calc(100%-40px)] max-w-[720px] py-10 sm:py-14">

        {/* Breadcrumb */}
        <div className="mb-7 flex items-center gap-2 text-[13px] text-[#82918b]">
          <Link
            href="/publisher/websites"
            className="transition-colors hover:text-[#0e7a5a]"
          >
            My websites
          </Link>
          <span>/</span>
          <span className="font-medium text-[#12211c]">
            Add website
          </span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#dcebe3] bg-[#eaf5ef] px-3 py-1.5 text-xs font-semibold text-[#0a6149]">
            <Globe2 size={14} />
            Publisher workspace
          </div>

          <h1 className="text-[32px] font-semibold tracking-[-1px] sm:text-[38px]">
            Add a website
          </h1>

          <p className="mt-3 max-w-[590px] text-[15px] leading-relaxed text-[#5f6f69] sm:text-[16px]">
            Submit a publication to LinkLedger and start connecting with
            advertisers looking for quality websites.
          </p>
        </div>

        {/* Review Notice */}
        <div className="mb-7 flex gap-3 rounded-xl border border-[#dcebe3] bg-[#edf6f1] p-4">
          <div className="mt-0.5 shrink-0 text-[#0e7a5a]">
            <Globe2 size={19} />
          </div>

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
        <div className="rounded-xl border border-[#e5eae8] bg-white p-5 shadow-[0_8px_30px_-25px_rgba(18,33,28,0.2)] sm:p-8">
          <div className="mb-7 border-b border-[#e5eae8] pb-5">
            <h2 className="text-[18px] font-semibold">
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
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#5f6f69] transition-colors hover:text-[#0e7a5a]"
        >
          <ArrowLeft size={15} />
          Back to my websites
        </Link>

      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-[#e5eae8] bg-white">
        <div className="mx-auto flex w-[calc(100%-40px)] max-w-[1040px] flex-col justify-between gap-2 py-6 text-[13px] text-[#82918b] sm:flex-row">
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
