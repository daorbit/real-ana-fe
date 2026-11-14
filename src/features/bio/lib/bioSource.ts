export const BIO_SOURCES = ["instagram", "tiktok", "youtube", "x", "facebook", "linkedin", "whatsapp", "email", "qr", "direct", "other"] as const;
export type BioSource = (typeof BIO_SOURCES)[number];

export const BIO_SOURCE_LABEL: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  email: "Email",
  qr: "QR code",
  direct: "Direct",
  other: "Other",
};

export const BIO_DEVICE_LABEL: Record<string, string> = { mobile: "Mobile", tablet: "Tablet", desktop: "Desktop" };

const REFERRER_HOSTS: [BioSource, string[]][] = [
  ["instagram", ["instagram.com"]],
  ["tiktok", ["tiktok.com"]],
  ["youtube", ["youtube.com", "youtu.be"]],
  ["x", ["x.com", "twitter.com", "t.co"]],
  ["facebook", ["facebook.com", "fb.com", "fb.me", "messenger.com"]],
  ["linkedin", ["linkedin.com", "lnkd.in"]],
  ["whatsapp", ["whatsapp.com", "wa.me"]],
];

function asSource(value: string): BioSource | null {
  const v = value.toLowerCase().trim();
  if (v === "ig") return "instagram";
  if (v === "twitter") return "x";
  if (v === "fb") return "facebook";
  return (BIO_SOURCES as readonly string[]).includes(v) ? (v as BioSource) : null;
}

function referrerSource(referrer: string): BioSource {
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
    if (host === window.location.hostname) return "direct";
    const match = REFERRER_HOSTS.find(([, hosts]) => hosts.some((h) => host === h || host.endsWith(`.${h}`)));
    return match ? match[0] : "other";
  } catch {
    return "other";
  }
}

export function visitSource(search: string, referrer: string): BioSource {
  const utm = new URLSearchParams(search).get("utm_source");
  return (utm && asSource(utm)) || referrerSource(referrer);
}

export function qrUrl(url: string): string {
  return `${url}?utm_source=qr&utm_medium=print`;
}
