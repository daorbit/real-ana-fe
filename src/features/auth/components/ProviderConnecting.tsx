import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { GitHubMark } from "@/shared/ui/GitHubMark";
import { LinkedInMark } from "@/shared/ui/LinkedInMark";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import { PROVIDER_LABEL, type AutoProvider } from "@/features/auth/oauthStart";
import "./ProviderConnecting.css";

const MARKS: Record<AutoProvider, ReactNode> = {
  google: <GoogleMark size={28} />,
  github: <GitHubMark size={28} />,
  linkedin: <LinkedInMark size={28} />,
};

export function ProviderConnecting({ provider }: { provider: AutoProvider }) {
  const label = PROVIDER_LABEL[provider];

  return (
    <div className="provider-connecting" role="status" aria-live="polite">
      <div className="provider-connecting__card">
        <div className="provider-connecting__mark" aria-hidden>
          <span className="provider-connecting__ring" />
          <span className="provider-connecting__logo">{MARKS[provider]}</span>
        </div>

        <p className="provider-connecting__title">Continuing with {label}</p>
        <p className="provider-connecting__detail">
          Redirecting you to {label} to finish signing in. This only takes a moment.
        </p>

        <p className="provider-connecting__secure">
          <Lock size={12} strokeWidth={2.2} />
          Secure sign-in. We never see your {label} password.
        </p>

        <span className="provider-connecting__progress" aria-hidden />
      </div>
    </div>
  );
}
