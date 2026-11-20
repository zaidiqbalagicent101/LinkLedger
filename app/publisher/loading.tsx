export default function PublisherLoading() {
  return (
    <main className="workspace-page" aria-live="polite" aria-busy="true">
      <section className="workspace-content">
        <div className="h-8 w-56 animate-pulse bg-[#e0e7e2]" />
        <div className="mt-6 h-12 animate-pulse border border-[#e0e7e2] bg-white" />
        <div className="mt-3 h-44 animate-pulse border border-[#e0e7e2] bg-white" />
      </section>
    </main>
  );
}