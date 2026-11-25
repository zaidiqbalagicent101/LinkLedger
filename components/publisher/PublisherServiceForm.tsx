
"use client";

import { useActionState } from "react";
import { ArrowRight, LoaderCircle, AlertCircle } from "lucide-react";
import {
  createPublisherServiceAction,
  updatePublisherServiceAction,
  type PublisherServiceActionState,
} from "@/lib/publisher-service-actions";
import {
  serviceLinkTypeOptions,
  serviceTypeOptions,
} from "@/components/publisher/service-options";

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

const inputStyles =
  "h-12 w-full rounded-xl border border-[#dce5df] bg-white px-4 text-sm text-[#12211c] shadow-sm outline-none transition-all placeholder:text-[#a0ada6] hover:border-[#b9cbc0] focus:border-[#0e7a5a] focus:ring-4 focus:ring-[#0e7a5a]/10 disabled:cursor-not-allowed disabled:bg-[#f6f8f7]";

const selectStyles =
  "h-12 w-full cursor-pointer appearance-none rounded-xl border border-[#dce5df] bg-white px-4 pr-10 text-sm text-[#12211c] shadow-sm outline-none transition-all hover:border-[#b9cbc0] focus:border-[#0e7a5a] focus:ring-4 focus:ring-[#0e7a5a]/10";

const textareaStyles =
  "min-h-[120px] w-full resize-y rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-sm leading-relaxed text-[#12211c] shadow-sm outline-none transition-all placeholder:text-[#a0ada6] hover:border-[#b9cbc0] focus:border-[#0e7a5a] focus:ring-4 focus:ring-[#0e7a5a]/10";

const labelStyles =
  "mb-2 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-[#263d33]";

const requiredStyles =
  "rounded-full bg-[#eaf5ef] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0a6149]";

const optionalStyles =
  "rounded-full bg-[#f1f4f2] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#82918b]";

function FieldError({ children }: { children: string }) {
  return (
    <span className="mt-2 flex items-start gap-1.5 text-xs font-medium leading-relaxed text-red-600">
      <AlertCircle size={13} className="mt-0.5 shrink-0" />
      {children}
    </span>
  );
}

export function PublisherServiceForm({
  websiteId,
  service,
  currencyOptions,
}: {
  websiteId: string;
  service?: PublisherServiceValues;
  currencyOptions: { value: string; label: string }[];
}) {
  const submit = service
    ? updatePublisherServiceAction
    : createPublisherServiceAction;

  const [state, action, pending] = useActionState<
    PublisherServiceActionState | undefined,
    FormData
  >(submit, undefined);

  return (
    <form action={action} className="space-y-7">
      <input type="hidden" name="websiteId" value={websiteId} />
      {service && (
        <input type="hidden" name="serviceId" value={service.id} />
      )}

      {state?.message && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p className="leading-relaxed">{state.message}</p>
        </div>
      )}

      {/* Basic Service Information */}
      <section className="space-y-5">
        <div className="border-b border-[#eef2f0] pb-3">
          <h3 className="text-sm font-semibold text-[#12211c]">
            Basic information
          </h3>
          <p className="mt-1 text-xs text-[#82918b]">
            Give your service a name and select the type of offer.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className={labelStyles}>
              Service name <span className={requiredStyles}>Required</span>
            </span>
            <input
              className={inputStyles}
              name="serviceName"
              defaultValue={service?.serviceName ?? ""}
              required
              minLength={2}
              maxLength={120}
              placeholder="e.g. Standard guest post"
            />
            {state?.errors?.serviceName && (
              <FieldError>{state.errors.serviceName}</FieldError>
            )}
          </label>

          <label className="block min-w-0">
            <span className={labelStyles}>
              Service type <span className={requiredStyles}>Required</span>
            </span>
            <div className="relative">
              <select
                className={selectStyles}
                name="serviceType"
                defaultValue={service?.serviceType ?? "GUEST_POST"}
                required
              >
                {serviceTypeOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#82918b]">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
            {state?.errors?.serviceType && (
              <FieldError>{state.errors.serviceType}</FieldError>
            )}
          </label>
        </div>
      </section>

      {/* Pricing and Delivery */}
      <section className="space-y-5">
        <div className="border-b border-[#eef2f0] pb-3">
          <h3 className="text-sm font-semibold text-[#12211c]">
            Pricing and delivery
          </h3>
          <p className="mt-1 text-xs text-[#82918b]">
            Set your service price, currency and expected delivery time.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className={labelStyles}>
              Price <span className={requiredStyles}>Required</span>
            </span>
            <input
              className={inputStyles}
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={service?.price ?? ""}
              placeholder="Enter your price"
              required
            />
            {state?.errors?.price && (
              <FieldError>{state.errors.price}</FieldError>
            )}
          </label>

          <label className="block min-w-0">
            <span className={labelStyles}>
              Currency <span className={requiredStyles}>Required</span>
            </span>
            <div className="relative">
              <select
                className={selectStyles}
                name="currency"
                defaultValue={service?.currency ?? "USD"}
                required
              >
                {currencyOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#82918b]">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
            {state?.errors?.currency && (
              <FieldError>{state.errors.currency}</FieldError>
            )}
          </label>

          <label className="block min-w-0">
            <span className={labelStyles}>
              Delivery time (days)
              <span className={requiredStyles}>Required</span>
            </span>
            <input
              className={inputStyles}
              name="deliveryTimeDays"
              type="number"
              min="1"
              step="1"
              defaultValue={service?.deliveryTimeDays ?? 7}
              placeholder="e.g. 7"
              required
            />
            {state?.errors?.deliveryTimeDays && (
              <FieldError>{state.errors.deliveryTimeDays}</FieldError>
            )}
          </label>

          <label className="block min-w-0">
            <span className={labelStyles}>
              Link type <span className={requiredStyles}>Required</span>
            </span>
            <div className="relative">
              <select
                className={selectStyles}
                name="linkType"
                defaultValue={service?.linkType ?? "DOFOLLOW"}
                required
              >
                {serviceLinkTypeOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#82918b]">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
            {state?.errors?.linkType && (
              <FieldError>{state.errors.linkType}</FieldError>
            )}
          </label>
        </div>

        <label className="block">
          <span className={labelStyles}>
            Maximum links
            <span className={optionalStyles}>Optional</span>
          </span>
          <input
            className={inputStyles}
            name="maximumLinks"
            type="number"
            min="1"
            step="1"
            defaultValue={service?.maximumLinks ?? ""}
            placeholder="Enter maximum number of links"
          />
          <span className="mt-2 block text-xs leading-relaxed text-[#82918b]">
            Required for link-based services. Leave blank for banner
            advertisements.
          </span>
          {state?.errors?.maximumLinks && (
            <FieldError>{state.errors.maximumLinks}</FieldError>
          )}
        </label>
      </section>

      {/* Service Options */}
      <section className="space-y-4">
        <div className="border-b border-[#eef2f0] pb-3">
          <h3 className="text-sm font-semibold text-[#12211c]">
            Additional service options
          </h3>
          <p className="mt-1 text-xs text-[#82918b]">
            Select the extra features included in your offer.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="group flex min-h-[68px] cursor-pointer items-center gap-3 rounded-xl border border-[#e5eae8] bg-white px-4 py-3 transition-all hover:border-[#b9d8c7] hover:bg-[#f8fbf9] has-[:checked]:border-[#9acbb0] has-[:checked]:bg-[#edf6f1]">
            <input
              type="checkbox"
              name="contentWritingIncluded"
              defaultChecked={service?.contentWritingIncluded ?? false}
              className="size-[17px] shrink-0 cursor-pointer accent-[#0e7a5a] focus:ring-2 focus:ring-[#0e7a5a]/20"
            />
            <span className="text-[13px] font-medium text-[#263d33]">
              Content writing included
            </span>
          </label>

          <label className="group flex min-h-[68px] cursor-pointer items-center gap-3 rounded-xl border border-[#e5eae8] bg-white px-4 py-3 transition-all hover:border-[#b9d8c7] hover:bg-[#f8fbf9] has-[:checked]:border-[#9acbb0] has-[:checked]:bg-[#edf6f1]">
            <input
              type="checkbox"
              name="homepageLinkAvailable"
              defaultChecked={service?.homepageLinkAvailable ?? false}
              className="size-[17px] shrink-0 cursor-pointer accent-[#0e7a5a] focus:ring-2 focus:ring-[#0e7a5a]/20"
            />
            <span className="text-[13px] font-medium text-[#263d33]">
              Homepage link available
            </span>
          </label>
        </div>
      </section>

      {/* Description and Publishing Terms */}
      <section className="space-y-5">
        <div className="border-b border-[#eef2f0] pb-3">
          <h3 className="text-sm font-semibold text-[#12211c]">
            Description and publishing terms
          </h3>
          <p className="mt-1 text-xs text-[#82918b]">
            Explain what advertisers receive and outline your publishing
            requirements.
          </p>
        </div>

        <label className="block">
          <span className={labelStyles}>
            Service description
            <span className={requiredStyles}>Required</span>
          </span>
          <textarea
            className={textareaStyles}
            name="description"
            defaultValue={service?.description ?? ""}
            rows={4}
            required
            minLength={10}
            maxLength={5000}
            placeholder="Describe what this service includes, what advertisers can expect, and any important details..."
          />
          <span className="mt-2 block text-xs text-[#82918b]">
            Provide a clear overview of your service (10–5,000 characters).
          </span>
          {state?.errors?.description && (
            <FieldError>{state.errors.description}</FieldError>
          )}
        </label>

        <label className="block">
          <span className={labelStyles}>
            Publishing guidelines
            <span className={optionalStyles}>Optional</span>
          </span>
          <textarea
            className={textareaStyles}
            name="publishingGuidelines"
            defaultValue={service?.publishingGuidelines ?? ""}
            rows={4}
            maxLength={5000}
            placeholder="Add content guidelines, formatting requirements, prohibited topics, or editorial preferences..."
          />
          {state?.errors?.publishingGuidelines && (
            <FieldError>{state.errors.publishingGuidelines}</FieldError>
          )}
        </label>

        <label className="block">
          <span className={labelStyles}>
            Additional conditions
            <span className={optionalStyles}>Optional</span>
          </span>
          <textarea
            className={textareaStyles}
            name="additionalConditions"
            defaultValue={service?.additionalConditions ?? ""}
            rows={3}
            maxLength={5000}
            placeholder="Mention any additional terms or conditions advertisers should know..."
          />
          {state?.errors?.additionalConditions && (
            <FieldError>{state.errors.additionalConditions}</FieldError>
          )}
        </label>
      </section>

      {/* Form Footer */}
      <div className="flex flex-col gap-5 border-t border-[#e5eae8] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-xs leading-relaxed text-[#82918b]">
          Banner advertisements use “Not applicable” for link type and do not
          have a maximum link count.
        </p>

        <button
          className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0e7a5a] px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0a6149] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          type="submit"
          disabled={pending}
        >
          {pending ? (
            <LoaderCircle className="animate-spin" size={17} />
          ) : null}
          <span>
            {pending
              ? "Saving..."
              : service
                ? "Save changes"
                : "Add service"}
          </span>
          {!pending && <ArrowRight size={17} />}
        </button>
      </div>
    </form>
  );
}
