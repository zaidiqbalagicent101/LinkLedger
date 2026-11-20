import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowLeft, ArrowRight, Inbox } from "lucide-react";
import { formatServiceType } from "@/components/publisher/service-options";
import { requirePublisherProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default function PublisherRequestsPage() {
  return <Suspense fallback={<div className="workspace-page" />}><PublisherRequestsContent /></Suspense>;
}

async function PublisherRequestsContent() {
  await connection();
  const user = await requirePublisherProfile();
  const requests = await prisma.collaborationRequest.findMany({
    where: { website: { publisherProfile: { userId: user.id } } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      websiteNameSnapshot: true,
      serviceNameSnapshot: true,
      serviceTypeSnapshot: true,
      topic: true,
      proposedBudget: true,
      proposedCurrency: true,
      status: true,
      createdAt: true,
      revisedPrice: true,
      revisedCurrency: true,
    },
  });

  return (
    <main className="workspace-page">
      <header className="workspace-header"><Link className="brand" href="/"><span className="brand-mark">L</span><span>LinkLedger</span></Link><nav className="workspace-nav"><Link href="/publisher/websites">My websites</Link><Link href="/publisher/dashboard">Dashboard</Link></nav></header>
      <section className="workspace-content">
        <Link className="back-link" href="/publisher/dashboard"><ArrowLeft size={15} /> Publisher dashboard</Link>
        <div className="workspace-title-row"><div><p className="eyebrow">Publisher workspace</p><h1>Incoming requests</h1><p className="workspace-intro">Review collaboration requests for your websites.</p></div></div>
        {requests.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Website and service</th><th>Topic</th><th>Advertiser budget</th><th>Status</th><th>Received</th><th><span className="sr-only">Open request</span></th></tr></thead>
              <tbody>{requests.map((request) => (
                <tr key={request.id}>
                  <td><span className="table-primary">{request.websiteNameSnapshot}</span><span className="table-secondary">{request.serviceNameSnapshot} · {formatServiceType(request.serviceTypeSnapshot)}</span></td>
                  <td>{request.topic}</td>
                  <td>{new Intl.NumberFormat("en", { style: "currency", currency: request.proposedCurrency }).format(Number(request.proposedBudget))}{request.revisedPrice !== null && <span className="table-secondary">Proposal: {new Intl.NumberFormat("en", { style: "currency", currency: request.revisedCurrency ?? request.proposedCurrency }).format(Number(request.revisedPrice))}</span>}</td>
                  <td><span className={`status-label status-label--${request.status.toLowerCase()}`}>{request.status.toLowerCase()}</span></td>
                  <td>{request.createdAt.toLocaleDateString()}</td>
                  <td><Link className="text-link" href={`/publisher/requests/${request.id}`}>Open<ArrowRight size={14} /></Link></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state"><Inbox size={30} className="text-[#cb7058]" /><h2>No incoming requests</h2><p>Requests for your listed services will appear here.</p><Link className="text-link" href="/publisher/websites">Review your websites<ArrowRight size={14} /></Link></div>
        )}
      </section>
    </main>
  );
}