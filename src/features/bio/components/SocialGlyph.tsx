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
      <path d="M10 8.8v6.4l5.6-3.2z" fill="var(--bio-page-bg, #fff)" />
    </svg>
  );
}

const WHATSAPP_PATH =
  "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z";
const TELEGRAM_PATH =
  "M21.4 3.6 2.9 10.7c-1.3.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.5ZM9.2 13.6l9-5.7c.4-.3.8-.1.5.2l-7.6 6.9-.3 3.3-1.6-4.7Z";
const THREADS_PATH =
  "M16.7 11.1c-.1-.1-.2-.1-.3-.2-.2-3-1.8-4.7-4.6-4.7-1.7 0-3.1.7-3.9 2l1.5 1c.6-.9 1.5-1.1 2.4-1.1 1.4 0 2.2.8 2.5 2.2a11 11 0 0 0-2.4-.1c-2.4.1-4 1.5-3.9 3.5.1 1 .6 1.9 1.4 2.4.7.5 1.6.7 2.6.6 1.3-.1 2.3-.6 3-1.5.5-.7.9-1.6 1-2.8.6.4 1.1.9 1.3 1.5.4 1 .4 2.6-.9 3.9-1.2 1.2-2.6 1.7-4.7 1.7-2.4 0-4.2-.8-5.3-2.3-1.1-1.4-1.6-3.4-1.7-5.9.1-2.5.6-4.5 1.7-5.9C7.5 3.8 9.3 3 11.7 3c2.4 0 4.3.8 5.5 2.3.6.7 1 1.7 1.3 2.7l1.8-.5c-.4-1.3-.9-2.4-1.7-3.4C17.1 2.1 14.7 1.1 11.7 1c-3 0-5.4 1.1-6.9 3C3.4 5.8 2.7 8.3 2.6 11.5c.1 3.2.8 5.7 2.2 7.5 1.5 1.9 3.8 2.9 6.9 3 2.7 0 4.6-.7 6.1-2.2 2-2 2-4.5 1.3-6-.4-1.1-1.3-2-2.4-2.7Zm-4.6 4.4c-1.1.1-2.2-.4-2.3-1.4 0-.8.6-1.6 2.3-1.7h.5c.6 0 1.2.1 1.8.2-.2 2.4-1.3 2.9-2.3 2.9Z";

function PathGlyph({ path, size }: { path: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={path} />
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
    case "whatsapp":
      return <PathGlyph path={WHATSAPP_PATH} size={size} />;
    case "telegram":
      return <PathGlyph path={TELEGRAM_PATH} size={size} />;
    case "threads":
      return <PathGlyph path={THREADS_PATH} size={size} />;
    case "email":
      return <Mail size={size} />;
    default:
      return <Globe size={size} />;
  }
}
