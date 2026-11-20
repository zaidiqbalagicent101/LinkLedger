import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { requirePublisherProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type WebsitePageProps = { params: Promise<{ websiteId: string }> };

export default async function PublisherWebsiteDetailsPage({ params }: WebsitePageProps) {
  await connection();
  const user = await requirePublisherProfile();
  const { websiteId } = await params;
  const website = await prisma.publisherWebsite.findFirst({
    where: { id: websiteId, publisherProfile: { userId: user.id } },
    include: { reviews: { orderBy: { reviewedAt: "desc" }, take: 1 } },
  });

  if (!website) notFound();

  return (
    <main className="workspace-page">
      <header className="workspace-header"><Link className="brand" href="/"><span className="brand-mark">L</span><span>linkledger</span></Link><Link className="workspace-header__link" href="/publisher/websites">My websites</Link></header>
      <section className="workspace-content workspace-content--narrow">
        <Link className="back-link" href="/publisher/websites"><ArrowLeft size={15} /> My websites</Link>
        <div className="workspace-title-row">
          <div><p className="eyebrow">Website details</p><h1>{website.websiteName}</h1></div>
          <div className="flex flex-wrap gap-2">
            <Link className="primary-button" href={`/publisher/websites/${website.id}/services`}>Services &amp; pricing</Link>
            <Link className="secondary-button" href={`/publisher/websites/${website.id}/edit`}>Edit website</Link>
          </div>
        </div>
        <dl className="details-grid">
          <div><dt>Website URL</dt><dd><a href={website.websiteUrl} target="_blank" rel="noreferrer">{website.websiteUrl}<ExternalLink size={14} /></a></dd></div>
          <div><dt>Approval status</dt><dd><span className={`status-label status-label--${website.approvalStatus.toLowerCase()}`}>{website.approvalStatus.toLowerCase()}</span></dd></div>
          <div><dt>Niche</dt><dd>{website.websiteNiche}</dd></div>
          <div><dt>Monthly traffic</dt><dd>{website.monthlyTraffic.toLocaleString()} <small>self-reported</small></dd></div>
          <div><dt>Language</dt><dd>{website.websiteLanguage}</dd></div>
          <div><dt>Target audience country</dt><dd>{website.targetAudienceCountry}</dd></div>
          <div><dt>Domain Rating</dt><dd>{website.domainRating ?? "Not provided"} <small>self-reported</small></dd></div>
          <div><dt>Domain Authority</dt><dd>{website.domainAuthority ?? "Not provided"} <small>self-reported</small></dd></div>
          <div className="details-grid__wide"><dt>Description</dt><dd>{website.websiteDescription}</dd></div>
          {website.rejectionReason && <div className="details-grid__wide"><dt>Latest review note</dt><dd>{website.rejectionReason}</dd></div>}
          <div><dt>Submitted</dt><dd>{website.createdAt.toLocaleDateString()}</dd></div>
        </dl>
        <p className="metrics-disclaimer">Traffic and domain metrics are publisher-reported and not independently verified.</p>
      </section>
    </main>
  );
}