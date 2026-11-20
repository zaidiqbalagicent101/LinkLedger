"use client";

export default function MarketplaceError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="workspace-page">
      <section className="workspace-content workspace-content--narrow">
        <p className="eyebrow">Marketplace unavailable</p>
        <h1>We couldn&apos;t load the listings</h1>
        <p className="workspace-intro">Please try again. Your filters and requests have not been changed.</p>
        <button className="primary-button" onClick={reset} type="button">Try again</button>
      </section>
    </main>
  );
}