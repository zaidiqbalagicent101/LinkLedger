"use client";

import { useActionState, type FormEvent } from "react";
import { Check, LoaderCircle, MessageSquareText } from "lucide-react";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import {
  approveFinalPublicationAction,
  approveOrderContentAction,
  requestOrderRevisionAction,
  type FulfillmentActionState,
} from "@/lib/order-fulfillment-actions";

const inputClass = "min-h-11 w-full rounded-md border border-[#d5ded8] bg-white px-3 text-sm text-[#12211c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]";

function confirmForm(event: FormEvent<HTMLFormElement>, message: string) {
  if (!window.confirm(message)) event.preventDefault();
}

export function AdvertiserFulfillmentControls({
  orderId,
  status,
  paymentStatus,
  publicationUrl,
}: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  publicationUrl: string | null;
}) {
  const [revisionState, revisionAction, revisionPending] = useActionState<FulfillmentActionState | undefined, FormData>(requestOrderRevisionAction, undefined);
  const [approveState, approveAction, approvePending] = useActionState<FulfillmentActionState | undefined, FormData>(approveOrderContentAction, undefined);
  const [completeState, completeAction, completePending] = useActionState<FulfillmentActionState | undefined, FormData>(approveFinalPublicationAction, undefined);

  return (
    <section className="rounded-2xl border border-[#e5eae8] bg-white p-5 sm:p-7" aria-labelledby="advertiser-fulfillment-title">
      <h2 id="advertiser-fulfillment-title" className="text-[17px] font-semibold tracking-tight">Review fulfillment</h2>
      {paymentStatus !== "PAID" ? (
        <p className="mt-3 text-sm text-[#82918b]">Content review becomes available after payment is confirmed.</p>
      ) : status === "CONTENT_SUBMITTED" ? (
        <div className="mt-4 space-y-5">
          <p className="text-sm leading-relaxed text-[#5f6f69]">Review the latest submission in the history below. Approve it to let the publisher publish, or request a revision with clear feedback.</p>
          <form action={revisionAction} onSubmit={(event) => confirmForm(event, "Send this revision request to the publisher?")} className="space-y-3">
            <input type="hidden" name="orderId" value={orderId} />
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#364741]">
              Revision feedback <span className="font-normal text-[#82918b]">Required</span>
              <textarea className={`${inputClass} min-h-28 resize-y py-3`} name="feedback" required minLength={1} maxLength={5000} placeholder="Explain what needs to change." />
              {revisionState?.errors?.feedback && <span className="font-normal text-red-700">{revisionState.errors.feedback}</span>}
            </label>
            {revisionState?.message && <p className="text-sm text-[#286d5d]" role="status">{revisionState.message}</p>}
            <button className="secondary-button" type="submit" disabled={revisionPending}>
              {revisionPending ? <LoaderCircle className="spinner" size={16} /> : <MessageSquareText size={16} />}
              <span>Request revision</span>
            </button>
          </form>
          <form action={approveAction} onSubmit={(event) => confirmForm(event, "Approve this content and allow the publisher to publish it?")}>
            <input type="hidden" name="orderId" value={orderId} />
            {approveState?.message && <p className="mb-3 text-sm text-[#286d5d]" role="status">{approveState.message}</p>}
            <button className="primary-button" type="submit" disabled={approvePending}>
              {approvePending ? <LoaderCircle className="spinner" size={16} /> : <Check size={16} />}
              <span>Approve content</span>
            </button>
          </form>
        </div>
      ) : status === "PUBLISHED" ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-[#dcebe3] bg-[#edf6f1] p-4">
            <p className="text-xs font-semibold text-[#203d33]">Final live URL</p>
            {publicationUrl ? (
              <a className="mt-2 inline-flex max-w-full items-center break-all text-sm font-medium text-[#286d5d] underline" href={publicationUrl} target="_blank" rel="noreferrer">{publicationUrl}</a>
            ) : <p className="mt-2 text-sm text-[#82918b]">No live URL is attached.</p>}
          </div>
          <p className="text-sm leading-relaxed text-[#5f6f69]">Confirm the final live article to mark this order complete.</p>
          <form action={completeAction} onSubmit={(event) => confirmForm(event, "Confirm the live article and complete this order?")}>
            <input type="hidden" name="orderId" value={orderId} />
            {completeState?.message && <p className="mb-3 text-sm text-[#286d5d]" role="status">{completeState.message}</p>}
            <button className="primary-button" type="submit" disabled={completePending || !publicationUrl}>
              {completePending ? <LoaderCircle className="spinner" size={16} /> : <Check size={16} />}
              <span>Confirm publication and complete</span>
            </button>
          </form>
        </div>
      ) : (
        <p className="mt-3 text-sm text-[#82918b]">
          {status === "COMPLETED" ? "You confirmed the live publication and completed this order." : status === "REVISION_REQUESTED" ? "The publisher is preparing a revised submission." : status === "APPROVED" ? "Content approved. The publisher can now submit the live URL." : status === "IN_PROGRESS" ? "The publisher is working on this order." : "There is no content to review yet."}
        </p>
      )}
    </section>
  );
}