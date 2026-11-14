export type ContactKind = "whatsapp" | "telegram";

type ContactField = { label: string; placeholder: string; inputMode: "tel" | "text"; empty: string };

export const CONTACT_FIELDS: Record<ContactKind, ContactField> = {
  whatsapp: { label: "WhatsApp number, with country code", placeholder: "+91 98765 43210", inputMode: "tel", empty: "Add the number" },
  telegram: { label: "Telegram username or number", placeholder: "@yourname or +91 98765 43210", inputMode: "text", empty: "Add the username" },
};

const PHONE = /^\+?[\d\s().-]{6,24}$/;
const TELEGRAM_USERNAME = /^@?([a-z][a-z0-9_]{4,31})$/i;
const WHATSAPP_LINK = /^(?:https?:\/\/)?(?:www\.)?wa\.me\/(\d{8,15})\/?$/i;
const TELEGRAM_LINK = /^(?:https?:\/\/)?(?:www\.)?t\.me\/(\+?)([a-z0-9_]{5,32})\/?$/i;

export function contactKind(id: string): ContactKind | null {
  return id === "whatsapp" || id === "telegram" ? id : null;
}

function phoneDigits(value: string): string | null {
  if (!PHONE.test(value)) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

export function toContactLink(kind: ContactKind, value: string): string {
  const trimmed = value.trim();
  const digits = phoneDigits(trimmed);
  if (kind === "whatsapp") return digits ? `https://wa.me/${digits}` : value;
  if (digits) return `https://t.me/+${digits}`;
  const user = TELEGRAM_USERNAME.exec(trimmed);
  return user ? `https://t.me/${user[1]}` : value;
}

export function contactDisplay(kind: ContactKind, url: string): string {
  const trimmed = url.trim();
  if (kind === "whatsapp") {
    const match = WHATSAPP_LINK.exec(trimmed);
    return match ? `+${match[1]}` : url;
  }
  const match = TELEGRAM_LINK.exec(trimmed);
  if (!match) return url;
  return match[1] ? `+${match[2]}` : `@${match[2]}`;
}
