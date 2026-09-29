import { ArrowRight, Check } from "lucide-react";
import { Wordmark } from "@/shared/ui/Brand";

const PROOF = ["No credit card", "GDPR-friendly", "Cancel anytime"];

type Props = {
  onDemo?: () => void;
  demoBusy?: boolean;
};

export function AuthBrand({ onDemo, demoBusy = false }: Props) {
  return (
    <>
      <header className="auth-top">
        <Wordmark />
        {onDemo && (
          <button type="button" className="auth-top-link" onClick={onDemo} disabled={demoBusy}>
            {demoBusy ? "Starting demo…" : "Live demo"}
            <ArrowRight size={13} />
          </button>
        )}
      </header>
      <footer className="auth-foot">
        {PROOF.map((p) => (
          <span key={p} className="auth-foot-item">
            <Check size={13} />
            {p}
          </span>
        ))}
      </footer>
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
    <div className="auth-mobile-brand" aria-hidden="true">
      {/* The same mark the sidebar and favicon use. */}
      <img src="/brand-mark.png" alt="" width={56} height={56} className="auth-mobile-mark" />
      <Wordmark />
    </div>
  );
}
