import { Globe, Mail, Music2 } from "lucide-react";
import { FacebookMark, InstagramMark, LinkedInMark } from "@/shared/ui/LinkedInMark";
import { GitHubMark } from "@/shared/ui/GitHubMark";
import type { BioSocialNetwork } from "@/features/bio/types";

const X_PATH =
  "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z";

function XGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={X_PATH} />
    </svg>
  );
}

function YouTubeGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1" y="4.5" width="22" height="15" rx="4.5" fill="currentColor" />
      <path d="M10 8.8v6.4l5.6-3.2z" fill="var(--bio-bg, #fff)" />
    </svg>
  );
}

export function SocialGlyph({ network, size = 20 }: { network: BioSocialNetwork; size?: number }) {
  switch (network) {
    case "instagram":
      return <InstagramMark size={size} color="currentColor" />;
    case "linkedin":
      return <LinkedInMark size={size} color="currentColor" />;
    case "facebook":
      return <FacebookMark size={size} color="currentColor" />;
    case "github":
      return <GitHubMark size={size} />;
    case "x":
      return <XGlyph size={size} />;
    case "youtube":
      return <YouTubeGlyph size={size} />;
    case "tiktok":
      return <Music2 size={size} />;
    case "email":
      return <Mail size={size} />;
    default:
      return <Globe size={size} />;
  }
}
