"use client";

import { useActionState } from "react";
import { ArrowRight, Check, LoaderCircle, MessageSquareText, X } from "lucide-react";
import {
  createCollaborationRequestAction,
  cancelCollaborationRequestAction,
  respondToCollaborationRequestAction,
  respondToRevisedProposalAction,
  type CollaborationActionState,
} from "@/lib/collaboration-actions";
import { currencyOptions } from "@/components/publisher/service-options";

const selectClass = "h-[46px] w-full border border-[#d5ded8] bg-white px-3 text-[12px] text-[#12211c]";

export function CollaborationRequestForm({
  websiteId,
  serviceId,
  servicePrice,
  currency,
}: {
  websiteId: string;
  serviceId: string;
  servicePrice: string;
  currency: string;
}) {
  const [state, action, pending] = useActionState<CollaborationActionState | undefined, FormData>(
    createCollaborationRequestAction,
    undefined,
  );

  return (
    <form className="workspace-form" action={action}>
      <input type="hidden" name="websiteId" value={websiteId} />
      <input type="hidden" name="serviceId" value={serviceId} />
      {state?.message && <p className="form-error form-error--summary" role="alert">{state.message}</p>}
      <div className="field-row">
        <label className="field"><span>Article or campaign topic <b>Required</b></span><input name="topic" required minLength={2} maxLength={191} />{state?.errors?.topic && <span className="form-error">{state.errors.topic}</span>}</label>
        <label className="field"><span>Target URL <b>Required</b></span><input name="targetUrl" type="url" required maxLength={2048} placeholder="https://example.com/page" />{state?.errors?.targetUrl && <span className="form-error">{state.errors.targetUrl}</span>}</label>
      </div>
      <div className="field-row">
        <label className="field"><span>Anchor text <b>Required</b></span><input name="anchorText" required maxLength={191} />{state?.errors?.anchorText && <span className="form-error">{state.errors.anchorText}</span>}</label>
        <label className="field"><span>Proposed budget ({currency}) <b>Required</b></span><input name="proposedBudget" type="number" min="0.01" max="99999999.99" step="0.01" defaultValue={servicePrice} required />{state?.errors?.proposedBudget && <span className="form-error">{state.errors.proposedBudget}</span>}</label>
      </div>
      <label className="field"><span>Content requirements <b>Required</b></span><textarea name="contentRequirements" rows={4} minLength={5} maxLength={5000} required placeholder="Describe the content, length, tone, and any required references." />{state?.errors?.contentRequirements && <span className="form-error">{state.errors.contentRequirements}</span>}</label>
      <label className="field"><span>Additional instructions <small>Optional</small></span><textarea name="additionalInstructions" rows={3} maxLength={5000} />{state?.errors?.additionalInstructions && <span className="form-error">{state.errors.additionalInstructions}</span>}</label>
      <div className="workspace-form__footer">
        <p>Your budget uses the selected service&apos;s listed currency. No payment is collected at this stage.</p>
        <button className="primary-button" type="submit" disabled={pending}>{pending ? <LoaderCircle className="spinner" size={17} /> : <ArrowRight size={17} />}<span>{pending ? "Sending..." : "Send request"}</span></button>
      </div>
    </form>
  );
}

export function PublisherRequestResponseForm({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState<CollaborationActionState | undefined, FormData>(
    respondToCollaborationRequestAction,
    undefined,
  );

  return (
    <form className="workspace-form" action={action}>
      <input type="hidden" name="requestId" value={requestId} />
      {state?.message && <p className="form-error form-error--summary" role="alert">{state.message}</p>}
      <label className="field"><span>Response to advertiser</span><textarea name="publisherResponse" rows={3} maxLength={5000} placeholder="Add context for your decision or proposal." />{state?.errors?.publisherResponse && <span className="form-error">{state.errors.publisherResponse}</span>}</label>
      <div className="field-row">
        <label className="field"><span>Revised price <small>Negotiation only</small></span><input name="revisedPrice" type="number" min="0.01" max="99999999.99" step="0.01" />{state?.errors?.revisedPrice && <span className="form-error">{state.errors.revisedPrice}</span>}</label>
        <label className="field"><span>Currency <small>Negotiation only</small></span><select className={selectClass} name="revisedCurrency" defaultValue="USD">{currencyOptions.map((currency) => <option value={currency.value} key={currency.value}>{currency.label}</option>)}</select>{state?.errors?.revisedCurrency && <span className="form-error">{state.errors.revisedCurrency}</span>}</label>
      </div>
      <label className="field"><span>Revised terms <small>Negotiation only</small></span><textarea name="revisedTerms" rows={3} maxLength={5000} />{state?.errors?.revisedTerms && <span className="form-error">{state.errors.revisedTerms}</span>}</label>
      <div className="flex flex-wrap gap-2">
        <button className="primary-button" name="decision" value="ACCEPTED" disabled={pending}>{pending ? <LoaderCircle className="spinner" size={16} /> : <Check size={16} />}<span>Accept request</span></button>
        <button className="secondary-button" name="decision" value="NEGOTIATION" disabled={pending}><MessageSquareText size={16} /><span>Propose revised terms</span></button>
        <button className="danger-button" name="decision" value="REJECTED" disabled={pending}><X size={16} /><span>Reject request</span></button>
      </div>
    </form>
  );
}

export function AdvertiserProposalResponseForm({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState<CollaborationActionState | undefined, FormData>(
    respondToRevisedProposalAction,
    undefined,
  );

  return (
    <form action={action} className="mt-4 flex flex-wrap items-center gap-2">
      <input type="hidden" name="requestId" value={requestId} />
      {state?.message && <p className="form-error w-full" role="alert">{state.message}</p>}
      <button className="primary-button" name="decision" value="ACCEPTED" disabled={pending}>{pending ? <LoaderCircle className="spinner" size={16} /> : <Check size={16} />}<span>Accept revised proposal</span></button>
      <button className="danger-button" name="decision" value="REJECTED" disabled={pending}><X size={16} /><span>Reject proposal</span></button>
    </form>
  );
}

export function AdvertiserCancelRequestForm({ requestId }: { requestId: string }) {
  return (
    <form action={cancelCollaborationRequestAction} className="mt-3">
      <input type="hidden" name="requestId" value={requestId} />
      <button className="danger-button" type="submit"><X size={15} /><span>Cancel request</span></button>
    </form>
  );
}