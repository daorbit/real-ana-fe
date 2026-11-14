import { splitNumber, type DialCode } from "@/shared/lib/dialCodes";

export type ContactKind = "whatsapp" | "telegram";
export type ContactMode = "number" | "handle";

type ContactSpec = {
  name: string;
  modes: { value: ContactMode; label: string }[];
  handlePlaceholder: string;
  empty: string;
};

export const CONTACT_SPECS: Record<ContactKind, ContactSpec> = {
  whatsapp: {
    name: "WhatsApp",
    modes: [
      { value: "number", label: "Number" },
      { value: "handle", label: "Link" },
    ],
    handlePlaceholder: "Paste a wa.me or group invite link",
    empty: "Add the number",
  },
  telegram: {
    name: "Telegram",
    modes: [
      { value: "handle", label: "Username" },
      { value: "number", label: "Number" },
    ],
    handlePlaceholder: "@yourname",
    empty: "Add the username",
  },
};

const NUMBER_LINK: Record<ContactKind, RegExp> = {
  whatsapp: /^(?:https?:\/\/)?(?:www\.)?wa\.me\/(\d{6,15})\/?$/i,
  telegram: /^(?:https?:\/\/)?(?:www\.)?t\.me\/\+(\d{6,15})\/?$/i,
};
const TELEGRAM_USER_LINK = /^(?:https?:\/\/)?(?:www\.)?t\.me\/([a-z][a-z0-9_]{4,31})\/?$/i;
const TELEGRAM_USERNAME = /^@?([a-z][a-z0-9_]{4,31})$/i;

export function contactKind(id: string): ContactKind | null {
  return id === "whatsapp" || id === "telegram" ? id : null;
}

export function numberInLink(kind: ContactKind, url: string): string | null {
  return NUMBER_LINK[kind].exec(url.trim())?.[1] ?? null;
}

export function numberLink(kind: ContactKind, digits: string): string {
  return kind === "whatsapp" ? `https://wa.me/${digits}` : `https://t.me/+${digits}`;
}

export function initialMode(kind: ContactKind, url: string): ContactMode {
  if (!url.trim()) return CONTACT_SPECS[kind].modes[0].value;
  return numberInLink(kind, url) ? "number" : "handle";
}

export function initialNumber(digits: string | null, home: DialCode): { country: DialCode; local: string } {
  if (!digits) return { country: home, local: "" };
  if (digits.startsWith(home.dial)) return { country: home, local: digits.slice(home.dial.length) };
  return splitNumber(digits);
}

export function handleDisplay(kind: ContactKind, url: string): string {
  if (kind !== "telegram") return url;
  const user = TELEGRAM_USER_LINK.exec(url.trim());
  return user ? `@${user[1]}` : url;
}

export function handleLink(kind: ContactKind, value: string): string {
  if (kind !== "telegram") return value;
  const user = TELEGRAM_USERNAME.exec(value.trim());
  return user ? `https://t.me/${user[1]}` : value;
}

export function contactDisplay(kind: ContactKind, url: string): string {
  const digits = numberInLink(kind, url);
  return digits ? `+${digits}` : handleDisplay(kind, url);
}
