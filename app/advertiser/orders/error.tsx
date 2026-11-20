"use client";

export default function AdvertiserOrdersError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-[60vh] bg-[#f6f8f7] px-5 py-12">
      <section className="mx-auto max-w-[680px] border border-[#e0e7e2] bg-white p-6 sm:p-8">
        <p className="eyebrow">Advertiser workspace</p>
        <h1 className="mt-2 text-2xl font-semibold">We couldn&apos;t load your orders</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#5f6f69]">Please try again in a moment.</p>
        <button className="primary-button mt-5" onClick={reset} type="button">Try again</button>
      </section>
    </main>
  );
}