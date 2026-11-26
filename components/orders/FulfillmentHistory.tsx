import { ArrowUpRight, CheckCircle2, FileText, MessageSquareText, Play } from "lucide-react";
import type { OrderFulfillmentEventType, UserRole } from "@/generated/prisma/enums";

export type FulfillmentHistoryItem = {
  id: string;
  type: OrderFulfillmentEventType;
  contentUrl: string | null;
  contentText: string | null;
  feedback: string | null;
  createdAt: Date;
  actor: { fullName: string; role: UserRole };
};

const eventLabels: Record<OrderFulfillmentEventType, string> = {
  STARTED: "Work started",
  CONTENT_SUBMITTED: "Content submitted",
  REVISION_REQUESTED: "Revision requested",
  CONTENT_APPROVED: "Content approved",
  FINAL_URL_SUBMITTED: "Live URL submitted",
  FINAL_URL_APPROVED: "Live URL approved",
  COMPLETED: "Order completed",
};

export function FulfillmentHistory({ events }: { events: FulfillmentHistoryItem[] }) {
  return (
    <section className="rounded-2xl border border-[#e5eae8] bg-white p-5 sm:p-7" aria-labelledby="fulfillment-history-title">
      <div className="flex items-center gap-3 border-b border-[#eef2f0] pb-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e7f4ed] text-[#0e7a5a]">
          <CheckCircle2 size={19} />
        </span>
        <div>
          <h2 id="fulfillment-history-title" className="text-[17px] font-semibold tracking-tight">
            Submission and revision history
          </h2>
          <p className="mt-1 text-[12px] text-[#82918b]">Previous submissions and decisions remain available here.</p>
        </div>
      </div>

      {events.length ? (
        <ol className="mt-5 space-y-0">
          {events.map((event, index) => (
            <li key={event.id} className="relative grid grid-cols-[22px_minmax(0,1fr)] gap-x-3 pb-6 last:pb-0">
              {index < events.length - 1 && (
                <span aria-hidden="true" className="absolute bottom-0 left-[10px] top-5 w-px bg-[#dce5df]" />
              )}
              <span className="relative z-10 mt-0.5 grid size-[22px] place-items-center rounded-full bg-[#edf6f1] text-[#0e7a5a]">
                {event.type === "REVISION_REQUESTED" ? <MessageSquareText size={12} /> : event.type === "STARTED" ? <Play size={11} /> : <FileText size={12} />}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-sm font-semibold text-[#203d33]">{eventLabels[event.type]}</p>
                  <time className="text-[11px] text-[#82918b]" dateTime={event.createdAt.toISOString()}>
                    {event.createdAt.toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })}
                  </time>
                </div>
                <p className="mt-1 text-xs text-[#82918b]">
                  {event.actor.fullName} · {event.actor.role === "PUBLISHER" ? "Publisher" : "Advertiser"}
                </p>

                {event.contentUrl && (
                  <a
                    href={event.contentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex max-w-full items-center gap-1 break-all text-sm font-medium text-[#286d5d] hover:text-[#0a6149]"
                  >
                    {event.contentUrl}
                    <ArrowUpRight size={13} className="shrink-0" />
                  </a>
                )}

                {event.feedback && (
                  <div className="mt-3 border-l-2 border-amber-400 bg-amber-50/70 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">Revision feedback</p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#5f5140]">{event.feedback}</p>
                  </div>
                )}

                {event.contentText && (
                  <details className="mt-3 rounded-lg border border-[#e5eae8]">
                    <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-[#286d5d]">
                      View submitted article text
                    </summary>
                    <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words border-t border-[#eef2f0] px-3 py-3 font-sans text-sm leading-relaxed text-[#364741]">
                      {event.contentText}
                    </pre>
                  </details>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-5 text-sm text-[#82918b]">No fulfillment activity has been recorded yet.</p>
      )}
    </section>
  );
}