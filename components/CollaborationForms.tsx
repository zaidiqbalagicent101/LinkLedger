"use client";

import { useActionState } from "react";
import { Check, LoaderCircle, MessageSquareText, X } from "lucide-react";
import {
  cancelCollaborationRequestAction,
  respondToCollaborationRequestAction,
  respondToRevisedProposalAction,
  type CollaborationActionState,
} from "@/lib/collaboration-actions";

const selectClass = "h-[46px] w-full border border-[#d5ded8] bg-white px-3 text-[12px] text-[#12211c]";

export function PublisherRequestResponseForm({
  requestId,
  currencyOptions,
}: {
  requestId: string;
  currencyOptions: { value: string; label: string }[];
}) {
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