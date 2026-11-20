"use client";

import { useActionState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import {
  savePublisherProfileAction,
  type PublisherActionState,
} from "@/lib/publisher-actions";

export type PublisherProfileValues = {
  publisherName: string;
  businessName: string | null;
  country: string;
  contactNumber: string | null;
  description: string;
  profileImage: string | null;
};

export function PublisherProfileForm({
  profile,
}: {
  profile: PublisherProfileValues | null;
}) {
  const [state, action, pending] = useActionState<PublisherActionState | undefined, FormData>(
    savePublisherProfileAction,
    undefined,
  );

  return (
    <form className="workspace-form" action={action}>
      {state?.message && <p className="form-error form-error--summary" role="alert">{state.message}</p>}
      <label className="field">
        <span>Publisher name <b>Required</b></span>
        <input name="publisherName" defaultValue={profile?.publisherName ?? ""} required maxLength={191} />
        {state?.errors?.publisherName && <span className="form-error">{state.errors.publisherName}</span>}
      </label>
      <label className="field">
        <span>Business name <small>Optional</small></span>
        <input name="businessName" defaultValue={profile?.businessName ?? ""} maxLength={191} />
        {state?.errors?.businessName && <span className="form-error">{state.errors.businessName}</span>}
      </label>
      <div className="field-row">
        <label className="field">
          <span>Country <b>Required</b></span>
          <input name="country" defaultValue={profile?.country ?? ""} required maxLength={100} />
          {state?.errors?.country && <span className="form-error">{state.errors.country}</span>}
        </label>
        <label className="field">
          <span>Contact number <small>Optional</small></span>
          <input name="contactNumber" type="tel" defaultValue={profile?.contactNumber ?? ""} maxLength={40} />
          {state?.errors?.contactNumber && <span className="form-error">{state.errors.contactNumber}</span>}
        </label>
      </div>
      <label className="field">
        <span>Publisher description <b>Required</b></span>
        <textarea name="description" defaultValue={profile?.description ?? ""} required rows={5} maxLength={5000} />
        {state?.errors?.description && <span className="form-error">{state.errors.description}</span>}
      </label>
      <label className="field">
        <span>Profile image URL <small>Optional</small></span>
        <input name="profileImage" type="url" defaultValue={profile?.profileImage ?? ""} placeholder="https://example.com/image.jpg" />
        {state?.errors?.profileImage && <span className="form-error">{state.errors.profileImage}</span>}
      </label>
      <div className="workspace-form__footer">
        <p>Your profile is only visible to signed-in LinkLedger staff and relevant partners.</p>
        <button className="primary-button" type="submit" disabled={pending}>
          {pending ? <LoaderCircle className="spinner" size={17} /> : null}
          <span>{pending ? "Saving..." : profile ? "Save profile" : "Complete profile"}</span>
          {!pending && <ArrowRight size={17} />}
        </button>
      </div>
    </form>
  );
}