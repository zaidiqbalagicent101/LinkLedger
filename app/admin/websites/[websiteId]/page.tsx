import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminReviewForm } from "@/components/admin/AdminReviewForm";
import { prisma } from "@/lib/prisma";

type AdminWebsitePageProps = { params: Promise<{ websiteId: string }> };

export default async function AdminWebsiteDetailsPage({ params }: AdminWebsitePageProps) {
  await connection();
  const { websiteId } = await params;
  const website = await prisma.publisherWebsite.findUnique({
    where: { id: websiteId },
    include: {
      publisherProfile: { include: { user: { select: { id: true, fullName: true, email: true, createdAt: true } } } },
      reviewedBy: { select: { fullName: true, email: true } },
      reviews: { orderBy: { reviewedAt: "desc" }, include: { admin: { select: { fullName: true, email: true } } } },
    },
  });

  if (!website) notFound();

  return (
    <section className="admin-content">
      <Link className="back-link" href="/admin/websites"><ArrowLeft size={15} /> All websites</Link>
      <div className="admin-page-heading"><div><p className="eyebrow">Website review</p><h1>{website.websiteName}</h1><a className="table-secondary" href={website.websiteUrl} target="_blank" rel="noreferrer">{website.websiteUrl}<ExternalLink size={13} /></a></div><span className={`status-label status-label--${website.approvalStatus.toLowerCase()}`}>{website.approvalStatus.toLowerCase()}</span></div>
      <div className="admin-detail-columns">
        <div className="admin-detail-main">
          <section className="admin-section"><h2>Submitted details</h2><dl className="details-grid">
            <div><dt>Niche</dt><dd>{website.websiteNiche}</dd></div>
            <div><dt>Monthly traffic</dt><dd>{website.monthlyTraffic.toLocaleString()} <small>self-reported</small></dd></div>
            <div><dt>Language</dt><dd>{website.websiteLanguage}</dd></div>
            <div><dt>Target audience country</dt><dd>{website.targetAudienceCountry}</dd></div>
            <div><dt>Domain Rating</dt><dd>{website.domainRating ?? "Not provided"} <small>self-reported</small></dd></div>
            <div><dt>Domain Authority</dt><dd>{website.domainAuthority ?? "Not provided"} <small>self-reported</small></dd></div>
            <div><dt>Website logo</dt><dd>{website.websiteLogo ? <a href={website.websiteLogo} target="_blank" rel="noreferrer">View submitted logo <ExternalLink size={13} /></a> : "Not provided"}</dd></div>
            <div className="details-grid__wide"><dt>Description</dt><dd>{website.websiteDescription}</dd></div>
            <div><dt>Submitted</dt><dd>{website.createdAt.toLocaleString()}</dd></div>
            <div><dt>Latest review</dt><dd>{website.reviewedAt?.toLocaleString() ?? "Not reviewed"}{website.reviewedBy ? ` by ${website.reviewedBy.fullName}` : ""}</dd></div>
          </dl><p className="metrics-disclaimer">Traffic, DR, and DA are publisher-reported and have not been independently verified.</p></section>
          <section className="admin-section"><h2>Review history</h2>{website.reviews.length ? <ol className="review-history">{website.reviews.map((review) => <li key={review.id}><span className={`status-label status-label--${review.status.toLowerCase()}`}>{review.status.toLowerCase()}</span><span>{review.admin.fullName}</span><time>{review.reviewedAt.toLocaleString()}</time>{review.rejectionReason && <p>{review.rejectionReason}</p>}</li>)}</ol> : <p className="muted-copy">No decisions have been recorded.</p>}</section>
        </div>
        <aside className="admin-side-card"><p className="eyebrow">Publisher</p><h2>{website.publisherProfile.publisherName}</h2><p>{website.publisherProfile.user.fullName}</p><a href={`mailto:${website.publisherProfile.user.email}`}>{website.publisherProfile.user.email}</a><dl><div><dt>Country</dt><dd>{website.publisherProfile.country}</dd></div><div><dt>Member since</dt><dd>{website.publisherProfile.user.createdAt.toLocaleDateString()}</dd></div></dl><Link className="text-link" href={`/admin/users/${website.publisherProfile.user.id}`}>View publisher account <ExternalLink size={14} /></Link></aside>
      </div>
      <section className="admin-section admin-review-panel"><div><p className="eyebrow">Decision</p><h2>Review this submission</h2><p>Changing a decision adds a new item to the review history.</p></div><AdminReviewForm websiteId={website.id} /></section>
    </section>
  );
}