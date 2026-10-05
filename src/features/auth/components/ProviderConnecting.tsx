import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { GitHubMark } from "@/shared/ui/GitHubMark";
import { LinkedInMark } from "@/shared/ui/LinkedInMark";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import { Wordmark } from "@/shared/ui/Brand";
import { PROVIDER_LABEL, type AutoProvider } from "@/features/auth/oauthStart";
import "./ProviderConnecting.css";

const MARKS: Record<AutoProvider, ReactNode> = {
  google: <GoogleMark size={34} />,
  github: <GitHubMark size={34} />,
  linkedin: <LinkedInMark size={34} />,
};

export function ProviderConnecting({ provider }: { provider: AutoProvider }) {
  const label = PROVIDER_LABEL[provider];

  return (
    <div className="provider-connecting" role="status" aria-live="polite">
      <div className="provider-connecting__brand">
        <Wordmark />
      </div>

      <div className="provider-connecting__stage">
        <div className="provider-connecting__pair" aria-hidden>
          <span className="provider-connecting__tile provider-connecting__tile--app">
            <img src="/favicon.png" alt="" width={36} height={36} />
          </span>

          <span className="provider-connecting__link">
            <span className="provider-connecting__track" />
            <span className="provider-connecting__beam" />
            <span className="provider-connecting__dot" />
          </span>

          <span className="provider-connecting__tile provider-connecting__tile--provider">
            {MARKS[provider]}
          </span>
        </div>

        <h1 className="provider-connecting__title">Connecting to {label}</h1>
        <p className="provider-connecting__detail">
          Hang tight. We're taking you to {label} to sign in.
        </p>
      </div>

      <p className="provider-connecting__secure">
        <Lock size={12} strokeWidth={2.2} />
        Secure sign-in. Your {label} password never reaches Quantalog.
      </p>
    </div>
  );
}
