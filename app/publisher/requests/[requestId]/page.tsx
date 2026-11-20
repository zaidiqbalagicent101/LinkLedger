import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { PublisherRequestResponseForm } from "@/components/CollaborationForms";
import { getCurrencyOptions } from "@/lib/currency-options";
import { formatServiceType } from "@/components/publisher/service-options";
import { requirePublisherProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RequestPageProps = { params: Promise<{ requestId: string }> };

export default function PublisherRequestDetailsPage({ params }: RequestPageProps) {
  return <Suspense fallback={<div className="workspace-page" />}><PublisherRequestDetails params={params} /></Suspense>;
}

async function PublisherRequestDetails({ params }: RequestPageProps) {
  await connection();
  const user = await requirePublisherProfile();
  const { requestId } = await params;
  const request = await prisma.collaborationRequest.findFirst({
    where: { id: requestId, website: { publisherProfile: { userId: user.id } } },
    select: {
      id: true,
      websiteNameSnapshot: true,
      websiteUrlSnapshot: true,
      serviceNameSnapshot: true,
      serviceTypeSnapshot: true,
      originalPrice: true,
      originalCurrency: true,
      topic: true,
      targetUrl: true,
      anchorText: true,
      proposedBudget: true,
      proposedCurrency: true,
      contentRequirements: true,
      additionalInstructions: true,
      status: true,
      publisherResponse: true,
      revisedPrice: true,
      revisedCurrency: true,
      revisedTerms: true,
      revisedAt: true,
      acceptedAt: true,
      createdAt: true,
    },
  });

  if (!request) notFound();

  return (
    <main className="workspace-page">
      <header className="workspace-header"><Link className="brand" href="/"><span className="brand-mark">L</span><span>LinkLedger</span></Link><nav className="workspace-nav"><Link href="/publisher/requests">Incoming requests</Link><Link href="/publisher/dashboard">Dashboard</Link></nav></header>
      <section className="workspace-content workspace-content--narrow">
        <Link className="back-link" href="/publisher/requests"><ArrowLeft size={15} /> Incoming requests</Link>
        <div className="workspace-title-row">
          <div className="min-w-0"><p className="eyebrow">Collaboration request</p><h1>{request.websiteNameSnapshot}</h1><p className="workspace-intro">{request.serviceNameSnapshot} · {formatServiceType(request.serviceTypeSnapshot)}</p></div>
          <span className={`status-label status-label--${request.status.toLowerCase()}`}>{request.status.toLowerCase()}</span>
        </div>
        <dl className="details-grid">
          <div><dt>Website snapshot</dt><dd><a href={request.websiteUrlSnapshot} target="_blank" rel="noreferrer">{request.websiteUrlSnapshot}<ArrowUpRight size={13} /></a></dd></div>
          <div><dt>Received</dt><dd>{request.createdAt.toLocaleDateString()}</dd></div>
          <div><dt>Original service price</dt><dd>{new Intl.NumberFormat("en", { style: "currency", currency: request.originalCurrency }).format(Number(request.originalPrice))}</dd></div>
          <div><dt>Advertiser proposed budget</dt><dd>{new Intl.NumberFormat("en", { style: "currency", currency: request.proposedCurrency }).format(Number(request.proposedBudget))}</dd></div>
          <div className="details-grid__wide"><dt>Article or campaign topic</dt><dd>{request.topic}</dd></div>
          <div><dt>Target URL</dt><dd><a href={request.targetUrl} target="_blank" rel="noreferrer">{request.targetUrl}<ArrowUpRight size={13} /></a></dd></div>
          <div><dt>Anchor text</dt><dd>{request.anchorText}</dd></div>
          <div className="details-grid__wide"><dt>Content requirements</dt><dd className="whitespace-pre-wrap">{request.contentRequirements}</dd></div>
          {request.additionalInstructions && <div className="details-grid__wide"><dt>Additional instructions</dt><dd className="whitespace-pre-wrap">{request.additionalInstructions}</dd></div>}
          {request.publisherResponse && <div className="details-grid__wide"><dt>Your response</dt><dd className="whitespace-pre-wrap">{request.publisherResponse}</dd></div>}
          {request.revisedPrice !== null && <div><dt>Revised price</dt><dd>{new Intl.NumberFormat("en", { style: "currency", currency: request.revisedCurrency ?? request.originalCurrency }).format(Number(request.revisedPrice))}</dd></div>}
          {request.revisedTerms && <div className="details-grid__wide"><dt>Revised terms</dt><dd className="whitespace-pre-wrap">{request.revisedTerms}</dd></div>}
          {request.revisedAt && <div><dt>Proposal sent</dt><dd>{request.revisedAt.toLocaleDateString()}</dd></div>}
          {request.acceptedAt && <div><dt>Accepted</dt><dd>{request.acceptedAt.toLocaleDateString()}</dd></div>}
        </dl>
        {request.status === "PENDING" ? (
          <section className="mt-8"><p className="eyebrow">Your decision</p><h2 className="mt-2 mb-4 text-[21px] font-semibold text-[#17352f]">Respond to request</h2><PublisherRequestResponseForm requestId={request.id} currencyOptions={getCurrencyOptions(request.revisedCurrency ?? undefined)} /></section>
        ) : (
          <p className="mt-6 border border-[#e0e7e2] bg-white p-4 text-[12px] text-[#65726d]">This request is {request.status.toLowerCase()}; it can no longer be changed from the publisher side.</p>
        )}
      </section>
    </main>
  );
}