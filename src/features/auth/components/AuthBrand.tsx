import { ArrowRight } from "lucide-react";
import { Wordmark } from "@/shared/ui/Brand";
import { SITE_URL } from "@/shared/lib/docsSlugs";

// const PROOF = ["No credit card", "GDPR-friendly", "Cancel anytime"];

type Props = {
  onDemo?: () => void;
  demoBusy?: boolean;
};

export function AuthBrand({ onDemo, demoBusy = false }: Props) {
  return (
    <>
      <header className="auth-top">
        <a href={SITE_URL} className="auth-home-link" aria-label="Quantalog home">
          <Wordmark />
        </a>
        {onDemo && (
          <button type="button" className="auth-top-link" onClick={onDemo} disabled={demoBusy}>
            {demoBusy ? "Starting demo…" : "Live demo"}
            <ArrowRight size={13} />
          </button>
        )}
      </header>
      {/* <footer className="auth-foot">
        {PROOF.map((p) => (
          <span key={p} className="auth-foot-item">
            <Check size={13} />
            {p}
          </span>
        ))}
      </footer> */}
    </>
  );
}

/**
 * The brand at the top of the auth form on a phone, where the side panel
 * (`AuthBrand`) is hidden — an app icon and wordmark, the way a native app's
 * sign-in screen opens. Hidden above the breakpoint by `.auth-mobile-brand`.
 */
export function AuthMobileBrand() {
  return (
    <a href={SITE_URL} className="auth-mobile-brand auth-home-link" aria-label="Quantalog home">
      {/* The same mark the sidebar and favicon use. */}
      <img src="/brand-mark.png" alt="" width={56} height={56} className="auth-mobile-mark" />
      <Wordmark />
    </a>
  );
}
