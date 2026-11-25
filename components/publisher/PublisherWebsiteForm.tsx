"use client";

import { useActionState, useState } from "react";
import type { ReactNode } from "react";
import { ArrowRight, Check, ChevronDown, Info, LoaderCircle } from "lucide-react";
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

const nicheOptions = [
  "Technology",
  "Business & Finance",
  "Health & Fitness",
  "Food & Cooking",
  "Travel",
  "Lifestyle",
  "Fashion & Beauty",
  "Education",
  "Home & Garden",
  "Parenting & Family",
  "Sports",
  "Entertainment",
  "Gaming",
  "News & Politics",
  "Automotive",
];

const inputClass =
  "h-12 w-full rounded-xl border border-[#d5ded8] bg-white px-4 text-sm text-[#12211c] placeholder:text-[#a0aaa4] transition-colors hover:border-[#a9bbb0] focus:border-[#0e7a5a] focus:outline-none focus:ring-4 focus:ring-[#0e7a5a]/10";

const textareaClass = `${inputClass} h-auto min-h-[150px] resize-y py-3 leading-relaxed`;

const triggerClass =
  "flex h-12 w-full items-center justify-between rounded-xl border border-[#d5ded8] bg-white px-4 text-left text-sm text-[#12211c] transition-colors hover:border-[#a9bbb0] focus:border-[#0e7a5a] focus:outline-none focus:ring-4 focus:ring-[#0e7a5a]/10";

function Field({
  label,
  tag,
  error,
  errorId,
  className = "",
  children,
}: {
  label: string;
  tag: string;
  error?: string;
  errorId?: string;
  className?: string;
  children: ReactNode;
}) {
  const required = tag.startsWith("Required");

  return (
    <label className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#203d33]">
        {label}
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
            required ? "bg-[#e7f4ed] text-[#0a6149]" : "bg-[#f1f4f2] text-[#78847e]"
          }`}
        >
          {tag}
        </span>
      </span>
      {children}
      {error && (
        <span id={errorId} className="text-[13px] font-medium text-[#b3261e]">
          {error}
        </span>
      )}
    </label>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight text-[#12211c]">{title}</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-[#78847e]">{description}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-5">{children}</div>
    </div>
  );
}

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
  const savedNiche = website?.websiteNiche ?? "";
  const savedNicheIsPreset = nicheOptions.includes(savedNiche);
  const [selectedNiche, setSelectedNiche] = useState(
    savedNicheIsPreset ? savedNiche : savedNiche ? "CUSTOM" : "",
  );
  const [customNiche, setCustomNiche] = useState(
    savedNicheIsPreset ? "" : savedNiche,
  );
  const [isNicheMenuOpen, setIsNicheMenuOpen] = useState(false);

  return (
    <form className="flex flex-col gap-10" action={action}>
      {website && <input type="hidden" name="websiteId" value={website.id} />}
      {state?.message && (
        <p
          className="rounded-xl border border-[#f3c9c4] bg-[#fff3f1] px-4 py-3 text-sm font-medium text-[#9b2c25]"
          role="alert"
        >
          {state.message}
        </p>
      )}

      <Section title="Website basics" description="How advertisers will recognise your site.">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Website name" tag="Required" error={state?.errors?.websiteName}>
            <input
              className={inputClass}
              name="websiteName"
              defaultValue={website?.websiteName ?? ""}
              required
              maxLength={191}
            />
          </Field>
          <Field label="Website URL" tag="Required" error={state?.errors?.websiteUrl}>
            <input
              className={inputClass}
              name="websiteUrl"
              type="url"
              defaultValue={website?.websiteUrl ?? ""}
              placeholder="https://example.com"
              required
            />
          </Field>
        </div>
      </Section>

      <div className="border-t border-[#eef2f0]" />

      <Section title="Audience" description="Who reads your site and what it covers.">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Field
            label="Niche"
            tag="Required"
            error={state?.errors?.websiteNiche}
            errorId="website-niche-error"
          >
            <div
              className="relative"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setIsNicheMenuOpen(false);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") setIsNicheMenuOpen(false);
              }}
            >
              {selectedNiche === "CUSTOM" ? (
                <div className="flex gap-2">
                  <input
                    className={inputClass}
                    name="websiteNiche"
                    value={customNiche}
                    onChange={(event) => setCustomNiche(event.target.value)}
                    placeholder="Enter a custom niche"
                    required
                    maxLength={120}
                    aria-invalid={Boolean(state?.errors?.websiteNiche)}
                    aria-describedby={state?.errors?.websiteNiche ? "website-niche-error" : undefined}
                  />
                  <button
                    type="button"
                    aria-label="Choose a different niche"
                    aria-haspopup="listbox"
                    aria-expanded={isNicheMenuOpen}
                    aria-controls="website-niche-options"
                    aria-describedby={state?.errors?.websiteNiche ? "website-niche-error" : undefined}
                    onClick={() => setIsNicheMenuOpen((open) => !open)}
                    className="grid size-12 shrink-0 place-items-center rounded-xl border border-[#d5ded8] bg-white text-[#5f6f69] transition-colors hover:border-[#a9bbb0] focus:border-[#0e7a5a] focus:outline-none focus:ring-4 focus:ring-[#0e7a5a]/10"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isNicheMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isNicheMenuOpen}
                  aria-controls="website-niche-options"
                  aria-describedby={state?.errors?.websiteNiche ? "website-niche-error" : undefined}
                  onClick={() => setIsNicheMenuOpen((open) => !open)}
                  className={triggerClass}
                >
                  <span className={selectedNiche ? "" : "text-[#a0aaa4]"}>
                    {selectedNiche || "Select a niche"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-[#5f6f69] transition-transform ${
                      isNicheMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}

              {isNicheMenuOpen && (
                <div
                  id="website-niche-options"
                  role="listbox"
                  aria-label="Website niche options"
                  className="absolute left-0 top-full z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-[#d5ded8] bg-white py-1.5 shadow-[0_18px_36px_-18px_rgba(18,33,28,0.4)]"
                >
                  {nicheOptions.map((niche) => (
                    <button
                      key={niche}
                      type="button"
                      role="option"
                      aria-selected={selectedNiche === niche}
                      onClick={() => {
                        setSelectedNiche(niche);
                        setIsNicheMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-[#203d33] hover:bg-[#f3f8f5] focus:bg-[#f3f8f5] focus:outline-none"
                    >
                      {niche}
                      {selectedNiche === niche && <Check size={15} className="text-[#0e7a5a]" />}
                    </button>
                  ))}
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedNiche === "CUSTOM"}
                    onClick={() => {
                      setSelectedNiche("CUSTOM");
                      setIsNicheMenuOpen(false);
                    }}
                    className="mt-1 flex w-full items-center justify-between border-t border-[#e5eae8] px-4 py-2.5 text-left text-sm font-semibold text-[#0e7a5a] hover:bg-[#f3f8f5] focus:bg-[#f3f8f5] focus:outline-none"
                  >
                    Custom niche
                    {selectedNiche === "CUSTOM" && <Check size={15} />}
                  </button>
                </div>
              )}
            </div>
            {selectedNiche !== "CUSTOM" && (
              <input type="hidden" name="websiteNiche" value={selectedNiche} />
            )}
          </Field>

          <Field label="Monthly traffic" tag="Required" error={state?.errors?.monthlyTraffic}>
            <input
              className={inputClass}
              name="monthlyTraffic"
              type="number"
              min="0"
              step="1"
              defaultValue={website?.monthlyTraffic ?? ""}
              required
            />
          </Field>

          <Field label="Website language" tag="Required" error={state?.errors?.websiteLanguage}>
            <input
              className={inputClass}
              name="websiteLanguage"
              defaultValue={website?.websiteLanguage ?? ""}
              placeholder="English"
              required
              maxLength={80}
            />
          </Field>

          <Field
            label="Target audience country"
            tag="Required"
            error={state?.errors?.targetAudienceCountry}
          >
            <input
              className={inputClass}
              name="targetAudienceCountry"
              defaultValue={website?.targetAudienceCountry ?? ""}
              required
              maxLength={100}
            />
          </Field>
        </div>
      </Section>

      <div className="border-t border-[#eef2f0]" />

      <Section title="About your site" description="A short pitch and your brand image.">
        <Field label="Website description" tag="Required" error={state?.errors?.websiteDescription}>
          <textarea
            className={textareaClass}
            name="websiteDescription"
            defaultValue={website?.websiteDescription ?? ""}
            rows={5}
            required
            maxLength={5000}
          />
        </Field>

        <Field label="Website logo URL" tag="Optional" error={state?.errors?.websiteLogo}>
          <input
            className={inputClass}
            name="websiteLogo"
            type="url"
            defaultValue={website?.websiteLogo ?? ""}
            placeholder="https://example.com/logo.png"
          />
        </Field>
      </Section>

      <div className="border-t border-[#eef2f0]" />

      <Section title="Authority metrics" description="Self-reported numbers shown to advertisers.">
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Domain Rating"
            tag="Optional, self-reported"
            error={state?.errors?.domainRating}
          >
            <input
              className={inputClass}
              name="domainRating"
              type="number"
              min="0"
              max="100"
              step="1"
              defaultValue={website?.domainRating ?? ""}
            />
          </Field>
          <Field
            label="Domain Authority"
            tag="Optional, self-reported"
            error={state?.errors?.domainAuthority}
          >
            <input
              className={inputClass}
              name="domainAuthority"
              type="number"
              min="0"
              max="100"
              step="1"
              defaultValue={website?.domainAuthority ?? ""}
            />
          </Field>
        </div>

        <p className="flex gap-3 rounded-xl bg-[#f3f8f5] px-4 py-3 text-[13px] leading-relaxed text-[#5f6f69]">
          <Info size={16} className="mt-0.5 shrink-0 text-[#0e7a5a]" />
          Traffic, Domain Rating, and Domain Authority are publisher-reported and have not been
          independently verified by LinkLedger.
        </p>
      </Section>

      <div className="flex flex-col gap-4 border-t border-[#e5eae8] pt-6 sm:flex-row sm:items-center sm:justify-between">
        {website ? (
          <p className="text-[13px] text-[#78847e]">
            Approval decisions can only be changed by an administrator.
          </p>
        ) : (
          <span />
        )}
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0e7a5a] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0a6149] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7a5a] disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={pending}
        >
          {pending ? <LoaderCircle className="animate-spin" size={17} /> : null}
          <span>{pending ? "Saving..." : website ? "Save changes" : "Submit website"}</span>
          {!pending && <ArrowRight size={17} />}
        </button>
      </div>
    </form>
  );
}