
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import {
  ArrowLeft,
  ArrowUpRight,
  Inbox,
  Globe2,
  CalendarDays,
  Wallet,
  FileText,
  MessageSquareText,
  CheckCircle2,
  Clock3,
  XCircle,
  Handshake,
} from "lucide-react";
import {
  AdvertiserCancelRequestForm,
  AdvertiserProposalResponseForm,
} from "@/components/CollaborationForms";
import { formatServiceType } from "@/components/publisher/service-options";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default function AdvertiserRequestsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen animate-pulse bg-[#f6f8f7]" />
      }
    >
      <AdvertiserRequestsContent />
    </Suspense>
  );
}

async function AdvertiserRequestsContent() {
  await connection();

  const user = await requireRole("ADVERTISER");

  const requests = await prisma.collaborationRequest.findMany({
    where: { advertiserId: user.id },
    orderBy: { createdAt: "desc" },
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

  const statusStyles: Record<string, string> = {
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    ACCEPTED: "border-green-200 bg-green-50 text-green-700",
    REJECTED: "border-red-200 bg-red-50 text-red-700",
    NEGOTIATION: "border-blue-200 bg-blue-50 text-blue-700",
    CANCELLED: "border-gray-200 bg-gray-100 text-gray-600",
  };

  const statusIcons: Record<string, typeof Clock3> = {
    PENDING: Clock3,
    ACCEPTED: CheckCircle2,
    REJECTED: XCircle,
    NEGOTIATION: Handshake,
    CANCELLED: XCircle,
  };

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#12211c] antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#e5eae8] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] w-[calc(100%-40px)] max-w-[1040px] items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-[19px] font-bold tracking-tight"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-[#0e7a5a] text-[17px] text-white">
              L
            </span>
            LinkLedger
          </Link>

          <nav className="flex items-center gap-4 sm:gap-7">
            <Link
              href="/advertiser/marketplace"
              className="text-sm font-medium text-[#5f6f69] transition-colors hover:text-[#0e7a5a]"
            >
              Marketplace
            </Link>
            <Link
              href="/advertiser/dashboard"
              className="text-sm font-semibold text-[#0e7a5a]"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <section className="mx-auto w-[calc(100%-40px)] max-w-[1040px] py-9 sm:py-12">
        {/* Breadcrumb */}
        <Link
          href="/advertiser/dashboard"
          className="mb-7 inline-flex items-center gap-2 text-[13px] font-medium text-[#82918b] transition-colors hover:text-[#0e7a5a]"
        >
          <ArrowLeft size={15} />
          Advertiser dashboard
        </Link>

        {/* Page Heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dcebe3] bg-[#eaf5ef] px-3 py-1 text-[11px] font-semibold text-[#0a6149]">
              <Handshake size={13} />
              Advertiser workspace
            </span>

            <h1 className="mt-4 text-[30px] font-semibold tracking-[-1px] sm:text-[36px]">
              My requests
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-[#5f6f69]">
              Track your collaboration requests and publisher responses.
            </p>
          </div>

          <Link
            href="/advertiser/marketplace"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0e7a5a] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0a6149]"
          >
            Browse marketplace
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Request Summary */}
        <div className="mb-7 flex items-center justify-between rounded-xl border border-[#e5eae8] bg-white px-5 py-4">
          <div>
            <p className="text-xs text-[#82918b]">Total collaboration requests</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {requests.length}
            </p>
          </div>
          <div className="grid size-11 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
            <Inbox size={21} />
          </div>
        </div>

        {/* Request List */}
        {requests.length ? (
          <div className="flex flex-col gap-5">
            {requests.map((request) => {
              const StatusIcon = statusIcons[request.status] ?? Clock3;

              return (
                <article
                  key={request.id}
                  className="overflow-hidden rounded-xl border border-[#e5eae8] bg-white shadow-[0_8px_30px_-25px_rgba(18,33,28,0.2)]"
                >
                  {/* Request Header */}
                  <div className="flex flex-col justify-between gap-4 border-b border-[#edf1ee] p-5 sm:flex-row sm:items-start sm:px-6 sm:py-5">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
                        <Globe2 size={21} />
                      </div>

                      <div className="min-w-0">
                        <a
                          href={request.websiteUrlSnapshot}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex max-w-full items-center gap-1 break-all text-[16px] font-semibold text-[#203d33] transition-colors hover:text-[#0e7a5a]"
                        >
                          {request.websiteNameSnapshot}
                          <ArrowUpRight size={14} className="shrink-0" />
                        </a>

                        <p className="mt-1 break-words text-[12px] text-[#78847e]">
                          {request.serviceNameSnapshot}
                          {" · "}
                          {formatServiceType(request.serviceTypeSnapshot)}
                        </p>

                        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#82918b]">
                          <CalendarDays size={13} />
                          Submitted {request.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                        statusStyles[request.status] ??
                        "border-gray-200 bg-gray-100 text-gray-600"
                      }`}
                    >
                      <StatusIcon size={13} />
                      {request.status.toLowerCase()}
                    </span>
                  </div>

                  {/* Request Details */}
                  <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="min-w-0 p-5 sm:p-6">
                      <div className="mb-5 flex items-center gap-2">
                        <FileText size={17} className="text-[#0e7a5a]" />
                        <h2 className="text-sm font-semibold">
                          Request details
                        </h2>
                      </div>

                      <dl className="grid gap-4 sm:grid-cols-2">
                        <div className="min-w-0">
                          <dt className="text-xs text-[#82918b]">Topic</dt>
                          <dd className="mt-1.5 break-words text-sm font-semibold text-[#203d33]">
                            {request.topic}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-xs text-[#82918b]">Submitted</dt>
                          <dd className="mt-1.5 text-sm font-semibold text-[#203d33]">
                            {request.createdAt.toLocaleDateString()}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-xs text-[#82918b]">Listed price</dt>
                          <dd className="mt-1.5 text-sm font-semibold tabular-nums text-[#203d33]">
                            {new Intl.NumberFormat("en", {
                              style: "currency",
                              currency: request.originalCurrency,
                            }).format(Number(request.originalPrice))}
                          </dd>
                        </div>

                        <div>
                          <dt className="text-xs text-[#82918b]">Proposed budget</dt>
                          <dd className="mt-1.5 text-sm font-semibold tabular-nums text-[#0e7a5a]">
                            {new Intl.NumberFormat("en", {
                              style: "currency",
                              currency: request.proposedCurrency,
                            }).format(Number(request.proposedBudget))}
                          </dd>
                        </div>

                        <div className="min-w-0 border-t border-[#edf1ee] pt-4 sm:col-span-2">
                          <dt className="text-xs text-[#82918b]">
                            Target URL and anchor text
                          </dt>
                          <dd className="mt-2 flex min-w-0 flex-col items-start gap-2">
                            <a
                              href={request.targetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex max-w-full items-center gap-1 break-all text-sm font-medium text-[#0e7a5a] hover:underline"
                            >
                              {request.targetUrl}
                              <ArrowUpRight size={13} className="shrink-0" />
                            </a>
                            <span className="break-words text-sm text-[#5f6f69]">
                              {request.anchorText}
                            </span>
                          </dd>
                        </div>

                        <div className="border-t border-[#edf1ee] pt-4 sm:col-span-2">
                          <dt className="text-xs text-[#82918b]">
                            Content requirements
                          </dt>
                          <dd className="mt-2 whitespace-pre-wrap text-sm leading-[1.75] text-[#5f6f69]">
                            {request.contentRequirements}
                          </dd>
                        </div>

                        {request.additionalInstructions && (
                          <div className="border-t border-[#edf1ee] pt-4 sm:col-span-2">
                            <dt className="text-xs text-[#82918b]">
                              Additional instructions
                            </dt>
                            <dd className="mt-2 whitespace-pre-wrap text-sm leading-[1.75] text-[#5f6f69]">
                              {request.additionalInstructions}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    {/* Publisher Response */}
                    <div className="min-w-0 border-t border-[#e5eae8] bg-[#fbfcfb] p-5 sm:p-6 lg:border-l lg:border-t-0">
                      <div className="flex items-center gap-2">
                        <MessageSquareText
                          size={17}
                          className="text-[#0e7a5a]"
                        />
                        <h2 className="text-sm font-semibold">
                          Publisher response
                        </h2>
                      </div>

                      {request.publisherResponse ? (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-[1.75] text-[#5f6f69]">
                          {request.publisherResponse}
                        </p>
                      ) : (
                        <div className="mt-4 rounded-lg border border-dashed border-[#dce5df] bg-white p-4">
                          <p className="text-sm text-[#82918b]">
                            No response yet.
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-[#a0aaa4]">
                            The publisher's response will appear here.
                          </p>
                        </div>
                      )}

                      {/* Revised Proposal */}
                      {request.status === "NEGOTIATION" &&
                        request.revisedPrice !== null && (
                          <div className="mt-5 rounded-xl border border-[#dce5df] bg-white p-4">
                            <div className="flex items-center gap-2">
                              <Handshake
                                size={16}
                                className="text-[#0e7a5a]"
                              />
                              <p className="text-xs font-bold uppercase tracking-wide text-[#0a6149]">
                                Revised proposal
                              </p>
                            </div>

                            <p className="mt-3 text-[23px] font-semibold tabular-nums text-[#203d33]">
                              {new Intl.NumberFormat("en", {
                                style: "currency",
                                currency:
                                  request.revisedCurrency ??
                                  request.originalCurrency,
                              }).format(Number(request.revisedPrice))}
                            </p>

                            {request.revisedTerms && (
                              <p className="mt-3 whitespace-pre-wrap border-t border-[#edf1ee] pt-3 text-sm leading-[1.75] text-[#5f6f69]">
                                {request.revisedTerms}
                              </p>
                            )}

                            {request.revisedAt && (
                              <p className="mt-3 text-[11px] text-[#89948e]">
                                Received {request.revisedAt.toLocaleDateString()}
                              </p>
                            )}

                            <div className="mt-4 border-t border-[#edf1ee] pt-4">
                              <AdvertiserProposalResponseForm
                                requestId={request.id}
                              />
                            </div>
                          </div>
                        )}

                      {/* Cancel Request */}
                      {["PENDING", "NEGOTIATION"].includes(request.status) && (
                        <div className="mt-5 border-t border-[#e5eae8] pt-4">
                          <AdvertiserCancelRequestForm
                            requestId={request.id}
                          />
                        </div>
                      )}

                      {/* Accepted Status */}
                      {request.status === "ACCEPTED" &&
                        request.acceptedAt && (
                          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#dcebe3] bg-[#eaf5ef] p-3 text-xs font-medium text-[#0a6149]">
                            <CheckCircle2 size={15} />
                            Accepted {request.acceptedAt.toLocaleDateString()}
                          </div>
                        )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-xl border border-dashed border-[#cbd7cf] bg-white px-6 py-14 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#e7f4ed] text-[#0e7a5a]">
              <Inbox size={27} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#12211c]">
              No requests yet
            </h2>

            <p className="mx-auto mt-2 max-w-[390px] text-sm leading-relaxed text-[#78847e]">
              You haven't started any collaborations yet. Explore the
              marketplace and choose an active publisher service to get started.
            </p>

            <Link
              href="/advertiser/marketplace"
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0e7a5a] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0a6149]"
            >
              Browse available services
              <ArrowUpRight size={15} />
            </Link>
          </div>
        )}

        <Link
          href="/advertiser/dashboard"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#5f6f69] transition-colors hover:text-[#0e7a5a]"
        >
          <ArrowLeft size={15} />
          Back to dashboard
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-[#e5eae8] bg-white">
        <div className="mx-auto flex w-[calc(100%-40px)] max-w-[1040px] flex-col justify-between gap-2 py-6 text-[13px] text-[#82918b] sm:flex-row">
          <span>© 2026 LinkLedger</span>

          <div className="flex items-center gap-5">
            <Link
              href="/advertiser/marketplace"
              className="transition-colors hover:text-[#0e7a5a]"
            >
              Marketplace
            </Link>
            <Link
              href="/advertiser/dashboard"
              className="transition-colors hover:text-[#0e7a5a]"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
