"use client";

import { useActionState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import {
  createPublisherServiceAction,
  updatePublisherServiceAction,
  type PublisherServiceActionState,
} from "@/lib/publisher-service-actions";
import { currencyOptions, serviceLinkTypeOptions, serviceTypeOptions } from "@/components/publisher/service-options";

export type PublisherServiceValues = {
  id: string;
  serviceName: string;
  serviceType: (typeof serviceTypeOptions)[number]["value"];
  price: string;
  currency: string;
  deliveryTimeDays: number;
  contentWritingIncluded: boolean;
  linkType: (typeof serviceLinkTypeOptions)[number]["value"];
  maximumLinks: number | null;
  homepageLinkAvailable: boolean;
  description: string;
  publishingGuidelines: string | null;
  additionalConditions: string | null;
};

const selectStyles = "h-[46px] w-full rounded-[3px] border border-[#d5ded8] bg-white px-3 text-[12px] text-[#12211c] focus:border-[#397c6d] focus:outline-3 focus:outline-[#397c6d]/10";

export function PublisherServiceForm({
  websiteId,
  service,
}: {
  websiteId: string;
  service?: PublisherServiceValues;
}) {
  const submit = service ? updatePublisherServiceAction : createPublisherServiceAction;
  const [state, action, pending] = useActionState<PublisherServiceActionState | undefined, FormData>(
    submit,
    undefined,
  );

  return (
    <form className="workspace-form" action={action}>
      <input type="hidden" name="websiteId" value={websiteId} />
      {service && <input type="hidden" name="serviceId" value={service.id} />}
      {state?.message && <p className="form-error form-error--summary" role="alert">{state.message}</p>}

      <div className="field-row">
        <label className="field">
          <span>Service name <b>Required</b></span>
          <input name="serviceName" defaultValue={service?.serviceName ?? ""} required minLength={2} maxLength={120} placeholder="Standard placement" />
          {state?.errors?.serviceName && <span className="form-error">{state.errors.serviceName}</span>}
        </label>
        <label className="field">
          <span>Service type <b>Required</b></span>
          <select className={selectStyles} name="serviceType" defaultValue={service?.serviceType ?? "GUEST_POST"} required>
            {serviceTypeOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
          {state?.errors?.serviceType && <span className="form-error">{state.errors.serviceType}</span>}
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>Price <b>Required</b></span>
          <input name="price" type="number" min="0.01" step="0.01" defaultValue={service?.price ?? ""} required />
          {state?.errors?.price && <span className="form-error">{state.errors.price}</span>}
        </label>
        <label className="field">
          <span>Currency <b>Required</b></span>
          <select className={selectStyles} name="currency" defaultValue={service?.currency ?? "USD"} required>
            {currencyOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
          {state?.errors?.currency && <span className="form-error">{state.errors.currency}</span>}
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>Delivery time in days <b>Required</b></span>
          <input name="deliveryTimeDays" type="number" min="1" step="1" defaultValue={service?.deliveryTimeDays ?? 7} required />
          {state?.errors?.deliveryTimeDays && <span className="form-error">{state.errors.deliveryTimeDays}</span>}
        </label>
        <label className="field">
          <span>Link type <b>Required</b></span>
          <select className={selectStyles} name="linkType" defaultValue={service?.linkType ?? "DOFOLLOW"} required>
            {serviceLinkTypeOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
          {state?.errors?.linkType && <span className="form-error">{state.errors.linkType}</span>}
        </label>
      </div>

      <label className="field">
        <span>Maximum links <small>Required for link-based services; leave blank for banners</small></span>
        <input name="maximumLinks" type="number" min="1" step="1" defaultValue={service?.maximumLinks ?? ""} />
        {state?.errors?.maximumLinks && <span className="form-error">{state.errors.maximumLinks}</span>}
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="check-field items-center">
          <input type="checkbox" name="contentWritingIncluded" defaultChecked={service?.contentWritingIncluded ?? false} />
          <span>Content writing included</span>
        </label>
        <label className="check-field items-center">
          <input type="checkbox" name="homepageLinkAvailable" defaultChecked={service?.homepageLinkAvailable ?? false} />
          <span>Homepage link available</span>
        </label>
      </div>

      <label className="field">
        <span>Service description <b>Required</b></span>
        <textarea name="description" defaultValue={service?.description ?? ""} rows={4} required minLength={10} maxLength={5000} />
        {state?.errors?.description && <span className="form-error">{state.errors.description}</span>}
      </label>
      <label className="field">
        <span>Publishing guidelines <small>Optional</small></span>
        <textarea name="publishingGuidelines" defaultValue={service?.publishingGuidelines ?? ""} rows={4} maxLength={5000} />
        {state?.errors?.publishingGuidelines && <span className="form-error">{state.errors.publishingGuidelines}</span>}
      </label>
      <label className="field">
        <span>Additional conditions <small>Optional</small></span>
        <textarea name="additionalConditions" defaultValue={service?.additionalConditions ?? ""} rows={3} maxLength={5000} />
        {state?.errors?.additionalConditions && <span className="form-error">{state.errors.additionalConditions}</span>}
      </label>

      <div className="workspace-form__footer">
        <p>Banner advertisements use “Not applicable” for link type and do not have a maximum link count.</p>
        <button className="primary-button" type="submit" disabled={pending}>
          {pending ? <LoaderCircle className="spinner" size={17} /> : null}
          <span>{pending ? "Saving..." : service ? "Save changes" : "Add service"}</span>
          {!pending && <ArrowRight size={17} />}
        </button>
      </div>
    </form>
  );
}