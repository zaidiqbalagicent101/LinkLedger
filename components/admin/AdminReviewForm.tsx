"use client";

import { useActionState } from "react";
import { Check, LoaderCircle, X } from "lucide-react";
import { reviewWebsiteAction, type AdminActionState } from "@/lib/admin-actions";

export function AdminReviewForm({ websiteId }: { websiteId: string }) {
  const [state, action, pending] = useActionState<AdminActionState | undefined, FormData>(
    reviewWebsiteAction,
    undefined,
  );

  return (
    <form className="admin-review-form" action={action}>
      <input type="hidden" name="websiteId" value={websiteId} />
      {state?.message && <p className="form-error form-error--summary" role="alert">{state.message}</p>}
      <label className="field">
        <span>Rejection reason <small>Required only when rejecting</small></span>
        <textarea name="rejectionReason" rows={3} maxLength={5000} placeholder="Explain what needs to change..." />
        {state?.errors?.rejectionReason && <span className="form-error">{state.errors.rejectionReason}</span>}
      </label>
      <div className="admin-review-form__actions">
        <button className="primary-button" name="decision" value="APPROVED" disabled={pending}>
          {pending ? <LoaderCircle className="spinner" size={17} /> : <Check size={17} />}
          <span>Approve website</span>
        </button>
        <button className="danger-button" name="decision" value="REJECTED" disabled={pending}>
          <X size={17} /><span>Reject website</span>
        </button>
      </div>
    </form>
  );
}