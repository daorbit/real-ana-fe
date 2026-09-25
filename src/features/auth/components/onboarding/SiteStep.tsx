import { TextInput } from "@mantine/core";
import { Check, Lock } from "lucide-react";
import { StepFooter } from "./StepFooter";
import f from "./FormSteps.module.css";

export const SITE_PURPOSES = [
  "Company website", "Blog", "SaaS product", "E-commerce store",
  "Marketing site", "Portfolio", "Documentation", "Landing page",
  "Internal tool", "Other",
];

/** Loose: enough to light the check in the address bar, not a validator. */
const LOOKS_LIKE_DOMAIN = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}(\/.*)?$/i;

/**
 * The step that asks what is being tracked: domain, name, and what it's for.
 *
 * The domain is typed into an address bar, because that is where people are
 * used to typing it. The purpose is a row of pills rather than a dropdown:
 * ten short options read faster laid out than hidden behind a click.
 *
 * Framework used to live at the foot of this same step; it now gets a screen
 * of its own, right after this one.
 */
export function SiteStepBody({
  siteName,
  siteError,
  onSiteNameChange,
  domain,
  domainError,
  onDomainChange,
  purpose,
  onPurposeChange,
}: {
  siteName: string;
  siteError: string | null;
  onSiteNameChange: (v: string) => void;
  domain: string;
  domainError: string | null;
  onDomainChange: (v: string) => void;
  purpose: string;
  onPurposeChange: (v: string) => void;
}) {
  const bare = domain.trim().replace(/^https?:\/\//i, "");
  const looksValid = LOOKS_LIKE_DOMAIN.test(bare);

  return (
    <div className={f.fields} style={{ gap: "1.6rem" }}>
      <div>
        <label className={f.eyebrow} htmlFor="onb-site-domain">
          Domain
        </label>
        <div className={f.urlBar} data-error={domainError ? true : undefined}>
          <span className={f.dots} aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <div className={f.urlField}>
            <Lock size={13} aria-hidden />
            <span className={f.scheme} aria-hidden>
              https://
            </span>
            <input
              id="onb-site-domain"
              className={f.urlInput}
              placeholder="yoursite.com"
              value={domain}
              inputMode="url"
              autoComplete="url"
              spellCheck={false}
              aria-invalid={Boolean(domainError)}
              onChange={(e) => onDomainChange(e.currentTarget.value)}
              data-autofocus
            />
            {looksValid && !domainError && (
              <span className={f.urlOk} aria-hidden>
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </div>
        </div>
        {domainError && <div className={f.error}>{domainError}</div>}
      </div>

      <TextInput
        label="Site name"
        description="How it shows in the site switcher and on reports"
        placeholder="Marketing site"
        value={siteName}
        error={siteError}
        onChange={(e) => onSiteNameChange(e.currentTarget.value)}
      />

      <div>
        <div className={f.eyebrow} id="onb-site-purpose">
          What's it for? <span style={{ textTransform: "none", letterSpacing: 0 }}>· optional</span>
        </div>
        <div className={f.purposes} role="group" aria-labelledby="onb-site-purpose">
          {SITE_PURPOSES.map((p) => (
            <button
              key={p}
              type="button"
              className={f.purpose}
              aria-pressed={purpose === p}
              onClick={() => onPurposeChange(purpose === p ? "" : p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SiteStepFooter({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: () => void;
}) {
  return <StepFooter onBack={onBack} onSubmit={onSubmit} />;
}
