import type { BioSocialNetwork } from "@/features/bio/types";

export type UtmParams = { source: string; medium: string; campaign: string; content?: string };

export type ShareChannel = {
  id: string;
  label: string;
  logo: BioSocialNetwork | "qr";
  medium: string;
};

export const SHARE_CHANNELS: ShareChannel[] = [
  { id: "instagram", label: "Instagram", logo: "instagram", medium: "social" },
  { id: "whatsapp", label: "WhatsApp", logo: "whatsapp", medium: "messaging" },
  { id: "youtube", label: "YouTube", logo: "youtube", medium: "social" },
  { id: "x", label: "X", logo: "x", medium: "social" },
  { id: "facebook", label: "Facebook", logo: "facebook", medium: "social" },
  { id: "linkedin", label: "LinkedIn", logo: "linkedin", medium: "social" },
  { id: "email", label: "Email", logo: "email", medium: "email" },
  { id: "qr", label: "QR code", logo: "qr", medium: "print" },
];

function clean(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_\-.]/g, "");
}

export function trackedUrl(base: string, params: UtmParams): string {
  const url = new URL(base);
  const pairs: [string, string | undefined][] = [
    ["utm_source", params.source],
    ["utm_medium", params.medium],
    ["utm_campaign", params.campaign],
    ["utm_content", params.content],
  ];
  for (const [key, value] of pairs) {
    const v = value ? clean(value) : "";
    if (v) url.searchParams.set(key, v);
  }
  return url.toString();
}

export function channelUrl(base: string, channel: ShareChannel, campaign: string): string {
  return trackedUrl(base, { source: channel.id, medium: channel.medium, campaign });
}
