"use client";

import { useActionState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import {
  createPublisherWebsiteAction,
  updatePublisherWebsiteAction,
  type PublisherActionState,
} from "@/lib/publisher-actions";

export type PublisherWebsiteValues = {
  id: string;
  websiteName: string;
  websiteUrl: string;
  websiteNiche: string;
  monthlyTraffic: number;
  websiteLanguage: string;
  targetAudienceCountry: string;
  websiteDescription: string;
  websiteLogo: string | null;
  domainRating: number | null;
  domainAuthority: number | null;
};

export function PublisherWebsiteForm({
  website,
}: {
  website?: PublisherWebsiteValues;
}) {
  const submit = website ? updatePublisherWebsiteAction : createPublisherWebsiteAction;
  const [state, action, pending] = useActionState<PublisherActionState | undefined, FormData>(
    submit,
    undefined,
  );

  return (
    <form className="workspace-form" action={action}>
      {website && <input type="hidden" name="websiteId" value={website.id} />}
      {state?.message && <p className="form-error form-error--summary" role="alert">{state.message}</p>}
      <div className="field-row">
        <label className="field">
          <span>Website name <b>Required</b></span>
          <input name="websiteName" defaultValue={website?.websiteName ?? ""} required maxLength={191} />
          {state?.errors?.websiteName && <span className="form-error">{state.errors.websiteName}</span>}
        </label>
        <label className="field">
          <span>Website URL <b>Required</b></span>
          <input name="websiteUrl" type="url" defaultValue={website?.websiteUrl ?? ""} placeholder="https://example.com" required />
          {state?.errors?.websiteUrl && <span className="form-error">{state.errors.websiteUrl}</span>}
        </label>
      </div>
      <div className="field-row">
        <label className="field">
          <span>Niche <b>Required</b></span>
          <input name="websiteNiche" defaultValue={website?.websiteNiche ?? ""} placeholder="Technology, travel, lifestyle..." required maxLength={120} />
          {state?.errors?.websiteNiche && <span className="form-error">{state.errors.websiteNiche}</span>}
        </label>
        <label className="field">
          <span>Monthly traffic <b>Required</b></span>
          <input name="monthlyTraffic" type="number" min="0" step="1" defaultValue={website?.monthlyTraffic ?? ""} required />
          {state?.errors?.monthlyTraffic && <span className="form-error">{state.errors.monthlyTraffic}</span>}
        </label>
      </div>
      <div className="field-row">
        <label className="field">
          <span>Website language <b>Required</b></span>
          <input name="websiteLanguage" defaultValue={website?.websiteLanguage ?? ""} placeholder="English" required maxLength={80} />
          {state?.errors?.websiteLanguage && <span className="form-error">{state.errors.websiteLanguage}</span>}
        </label>
        <label className="field">
          <span>Target audience country <b>Required</b></span>
          <input name="targetAudienceCountry" defaultValue={website?.targetAudienceCountry ?? ""} required maxLength={100} />
          {state?.errors?.targetAudienceCountry && <span className="form-error">{state.errors.targetAudienceCountry}</span>}
        </label>
      </div>
      <label className="field">
        <span>Website description <b>Required</b></span>
        <textarea name="websiteDescription" defaultValue={website?.websiteDescription ?? ""} rows={5} required maxLength={5000} />
        {state?.errors?.websiteDescription && <span className="form-error">{state.errors.websiteDescription}</span>}
      </label>
      <label className="field">
        <span>Website logo URL <small>Optional</small></span>
        <input name="websiteLogo" type="url" defaultValue={website?.websiteLogo ?? ""} placeholder="https://example.com/logo.png" />
        {state?.errors?.websiteLogo && <span className="form-error">{state.errors.websiteLogo}</span>}
      </label>
      <div className="field-row">
        <label className="field">
          <span>Domain Rating <small>Optional, self-reported</small></span>
          <input name="domainRating" type="number" min="0" max="100" step="1" defaultValue={website?.domainRating ?? ""} />
          {state?.errors?.domainRating && <span className="form-error">{state.errors.domainRating}</span>}
        </label>
        <label className="field">
          <span>Domain Authority <small>Optional, self-reported</small></span>
          <input name="domainAuthority" type="number" min="0" max="100" step="1" defaultValue={website?.domainAuthority ?? ""} />
          {state?.errors?.domainAuthority && <span className="form-error">{state.errors.domainAuthority}</span>}
        </label>
      </div>
      <p className="metrics-disclaimer">Traffic, Domain Rating, and Domain Authority are publisher-reported and have not been independently verified by LinkLedger.</p>
      <div className="workspace-form__footer">
        {website && <p>Approval decisions can only be changed by an administrator.</p>}
        <button className="primary-button" type="submit" disabled={pending}>
          {pending ? <LoaderCircle className="spinner" size={17} /> : null}
          <span>{pending ? "Saving..." : website ? "Save changes" : "Submit website"}</span>
          {!pending && <ArrowRight size={17} />}
        </button>
      </div>
    </form>
  );
}