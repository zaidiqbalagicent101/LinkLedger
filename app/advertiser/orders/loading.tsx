export default function AdvertiserOrdersLoading() {
  return (
    <main className="min-h-screen bg-[#f6f8f7] px-5 py-10" aria-live="polite" aria-busy="true">
      <section className="mx-auto max-w-[1040px]">
        <div className="h-8 w-48 animate-pulse bg-[#e0e7e2]" />
        <div className="mt-7 h-10 w-64 animate-pulse bg-[#e0e7e2]" />
        <div className="mt-5 h-36 animate-pulse border border-[#e0e7e2] bg-white" />
        <div className="mt-3 h-36 animate-pulse border border-[#e0e7e2] bg-white" />
      </section>
    </main>
  );
}