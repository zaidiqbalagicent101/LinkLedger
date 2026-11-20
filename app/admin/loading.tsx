export default function AdminLoading() {
  return (
    <section className="admin-content" aria-live="polite" aria-busy="true">
      <div className="h-8 w-56 animate-pulse bg-[#e0e7e2]" />
      <div className="mt-6 h-48 animate-pulse border border-[#e0e7e2] bg-white" />
    </section>
  );
}