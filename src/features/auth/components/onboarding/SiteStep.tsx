import { TextInput } from "@mantine/core";
import {
  Check, Lock, Building2, PenLine, Boxes, ShoppingCart, Megaphone,
  UserRound, BookText, Rocket, Wrench, MoreHorizontal,
} from "lucide-react";
import { StepFooter } from "./StepFooter";
import f from "./FormSteps.module.css";


export const SITE_PURPOSES: { label: string; icon: typeof Building2; color: string }[] = [
  { label: "Company website", icon: Building2, color: "#3B82F6" },
  { label: "Blog", icon: PenLine, color: "#F59E0B" },
  { label: "SaaS product", icon: Boxes, color: "#8B5CF6" },
  { label: "E-commerce store", icon: ShoppingCart, color: "#22C55E" },
  { label: "Marketing site", icon: Megaphone, color: "#F97316" },
  { label: "Portfolio", icon: UserRound, color: "#EC4899" },
  { label: "Documentation", icon: BookText, color: "#06B6D4" },
  { label: "Landing page", icon: Rocket, color: "#EF4444" },
  { label: "Internal tool", icon: Wrench, color: "#64748B" },
  { label: "Other", icon: MoreHorizontal, color: "#94A3B8" },
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
          {SITE_PURPOSES.map(({ label, icon: Icon, color }) => (
            <button
              key={label}
              type="button"
              className={f.purpose}
              aria-pressed={purpose === label}
              onClick={() => onPurposeChange(purpose === label ? "" : label)}
            >
              <Icon size={15} color={color} className={f.purposeIcon} aria-hidden />
              {label}
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
