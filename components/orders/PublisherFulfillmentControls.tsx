"use client";

import { useActionState, type FormEvent } from "react";
import { Check, LoaderCircle, Play, Send } from "lucide-react";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import {
  startPublisherOrderAction,
  submitFinalPublicationUrlAction,
  submitPublisherContentAction,
  type FulfillmentActionState,
} from "@/lib/order-fulfillment-actions";

const inputClass = "min-h-11 w-full rounded-md border border-[#d5ded8] bg-white px-3 text-sm text-[#12211c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a]";
const labelClass = "flex flex-col gap-1.5 text-xs font-semibold text-[#364741]";

function confirmForm(event: FormEvent<HTMLFormElement>, message: string) {
  if (!window.confirm(message)) event.preventDefault();
}

function ActionMessage({ state }: { state: FulfillmentActionState | undefined }) {
  return state?.message ? <p className="text-sm text-[#286d5d]" role="status">{state.message}</p> : null;
}

export function PublisherFulfillmentControls({
  orderId,
  status,
  paymentStatus,
  publicationUrl,
  latestContent,
}: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  publicationUrl: string | null;
  latestContent?: { contentUrl: string | null; contentText: string | null };
}) {
  const [startState, startAction, startPending] = useActionState<FulfillmentActionState | undefined, FormData>(startPublisherOrderAction, undefined);
  const [contentState, contentAction, contentPending] = useActionState<FulfillmentActionState | undefined, FormData>(submitPublisherContentAction, undefined);
  const [urlState, urlAction, urlPending] = useActionState<FulfillmentActionState | undefined, FormData>(submitFinalPublicationUrlAction, undefined);

  return (
    <section className="rounded-2xl border border-[#e5eae8] bg-white p-5 sm:p-7" aria-labelledby="publisher-fulfillment-title">
      <h2 id="publisher-fulfillment-title" className="text-[17px] font-semibold tracking-tight">Fulfill this order</h2>
      {paymentStatus !== "PAID" ? (
        <p className="mt-3 text-sm text-[#82918b]">Fulfillment is available after payment is confirmed.</p>
      ) : status === "CONFIRMED" ? (
        <form action={startAction} onSubmit={(event) => confirmForm(event, "Start work on this paid order?")} className="mt-4 flex flex-wrap items-center gap-3">
          <input type="hidden" name="orderId" value={orderId} />
          <button className="primary-button" type="submit" disabled={startPending}>
            {startPending ? <LoaderCircle className="spinner" size={16} /> : <Play size={16} />}
            <span>Start order</span>
          </button>
          <ActionMessage state={startState} />
        </form>
      ) : status === "IN_PROGRESS" || status === "REVISION_REQUESTED" ? (
        <form action={contentAction} onSubmit={(event) => confirmForm(event, "Submit this version to the advertiser for review?")} className="mt-4 space-y-4">
          <input type="hidden" name="orderId" value={orderId} />
          {status === "REVISION_REQUESTED" && <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">The advertiser requested changes. Review their feedback below before resubmitting.</p>}
          <label className={labelClass}>
            Content URL <span className="font-normal text-[#82918b]">Optional if you provide article text</span>
            <input className={inputClass} name="contentUrl" type="url" maxLength={2048} defaultValue={latestContent?.contentUrl ?? ""} placeholder="https://..." />
            {contentState?.errors?.contentUrl && <span className="text-xs font-normal text-red-700">{contentState.errors.contentUrl}</span>}
          </label>
          <label className={labelClass}>
            Article text <span className="font-normal text-[#82918b]">Optional if you provide a content URL</span>
            <textarea className={`${inputClass} min-h-40 resize-y py-3`} name="contentText" maxLength={100000} defaultValue={latestContent?.contentText ?? ""} placeholder="Paste the draft or revised article here." />
            {contentState?.errors?.contentText && <span className="text-xs font-normal text-red-700">{contentState.errors.contentText}</span>}
          </label>
          {contentState?.message && <p className="text-sm text-[#286d5d]" role="status">{contentState.message}</p>}
          <button className="primary-button" type="submit" disabled={contentPending}>
            {contentPending ? <LoaderCircle className="spinner" size={16} /> : <Send size={16} />}
            <span>{status === "REVISION_REQUESTED" ? "Submit revised content" : "Submit content"}</span>
          </button>
        </form>
      ) : status === "APPROVED" ? (
        <form action={urlAction} onSubmit={(event) => confirmForm(event, "Submit this live URL for advertiser confirmation?")} className="mt-4 space-y-4">
          <input type="hidden" name="orderId" value={orderId} />
          <label className={labelClass}>
            Final live article URL
            <input className={inputClass} name="publicationUrl" type="url" required maxLength={2048} placeholder="https://publisher-site.com/article" />
            {urlState?.errors?.publicationUrl && <span className="text-xs font-normal text-red-700">{urlState.errors.publicationUrl}</span>}
          </label>
          {urlState?.message && <p className="text-sm text-[#286d5d]" role="status">{urlState.message}</p>}
          <button className="primary-button" type="submit" disabled={urlPending}>
            {urlPending ? <LoaderCircle className="spinner" size={16} /> : <Check size={16} />}
            <span>Submit live URL</span>
          </button>
        </form>
      ) : status === "PUBLISHED" ? (
        <div className="mt-4 space-y-2 text-sm text-[#5f6f69]">
          <p>The live URL is awaiting advertiser confirmation.</p>
          {publicationUrl && <a className="break-all font-medium text-[#286d5d]" href={publicationUrl} target="_blank" rel="noreferrer">{publicationUrl}</a>}
        </div>
      ) : (
        <p className="mt-3 text-sm text-[#82918b]">{status === "COMPLETED" ? "This order is complete." : "No fulfillment action is available at this stage."}</p>
      )}
    </section>
  );
}