export default function MarketplaceLoading() {
  return (
    <main className="workspace-page" aria-live="polite" aria-busy="true">
      <section className="workspace-content">
        <p className="eyebrow">Advertiser workspace</p>
        <h1>Loading marketplace</h1>
        <div className="mt-6 grid gap-3" aria-hidden="true">
          <div className="h-12 animate-pulse border border-[#e0e7e2] bg-white" />
          <div className="h-44 animate-pulse border border-[#e0e7e2] bg-white" />
          <div className="h-44 animate-pulse border border-[#e0e7e2] bg-white" />
        </div>
      </section>
    </main>
  );
}