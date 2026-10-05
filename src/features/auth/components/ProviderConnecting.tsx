import type { ReactNode } from "react";
import { GitHubMark } from "@/shared/ui/GitHubMark";
import { LinkedInMark } from "@/shared/ui/LinkedInMark";
import { PROVIDER_LABEL, type RedirectProvider } from "@/features/auth/oauthStart";
import "./ProviderConnecting.css";

const MARKS: Record<RedirectProvider, ReactNode> = {
  github: <GitHubMark size={26} />,
  linkedin: <LinkedInMark size={26} />,
};

export function ProviderConnecting({ provider }: { provider: RedirectProvider }) {
  const label = PROVIDER_LABEL[provider];

  return (
    <div className="provider-connecting" role="status" aria-live="polite">
      <div className="provider-connecting__card">
        <div className="provider-connecting__marks" aria-hidden>
          <span className="provider-connecting__tile">
            <img src="/favicon.png" alt="" width={26} height={26} />
          </span>
          <span className="provider-connecting__link">
            <span />
            <span />
            <span />
          </span>
          <span className="provider-connecting__tile">
            {MARKS[provider]}
          </span>
        </div>
        <p className="provider-connecting__title">Connecting to {label}</p>
        <p className="provider-connecting__detail">
          Taking you to {label} to sign in securely. You'll be right back.
        </p>
      </div>
    </div>
  );
}
