import type {
  BioBackground, BioButtonStyle, BioFont, BioLayout, BioPageInput, BioPageKind, BioProfileLayout, BioRelease, BioReleaseLayout,
  BioSocialNetwork, BioTheme,
} from "@/features/bio/types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export const BIO_PUBLIC_PATH = "/l/";

export const BIO_SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/;

export const BIO_SOCIAL_NETWORKS: { id: BioSocialNetwork; label: string; placeholder: string }[] = [
  { id: "instagram", label: "Instagram", placeholder: "instagram.com/yourname" },
  { id: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/yourname" },
  { id: "x", label: "X", placeholder: "x.com/yourname" },
  { id: "youtube", label: "YouTube", placeholder: "youtube.com/@yourchannel" },
  { id: "tiktok", label: "TikTok", placeholder: "tiktok.com/@yourname" },
  { id: "facebook", label: "Facebook", placeholder: "facebook.com/yourpage" },
  { id: "whatsapp", label: "WhatsApp", placeholder: "wa.me/919876543210" },
  { id: "telegram", label: "Telegram", placeholder: "t.me/yourchannel" },
  { id: "threads", label: "Threads", placeholder: "threads.net/@yourname" },
  { id: "github", label: "GitHub", placeholder: "github.com/yourname" },
  { id: "website", label: "Website", placeholder: "yourwebsite.com" },
  { id: "email", label: "Email", placeholder: "you@example.com" },
];

export const BIO_ACCENTS = ["#1d1d1f", "#0071e3", "#30a46c", "#e5484d", "#f76b15", "#8e4ec6", "#0091ff", "#d6409f"];

export const BIO_BUTTON_STYLES: { value: BioButtonStyle; label: string }[] = [
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
  { value: "square", label: "Square" },
];

export const BIO_BACKGROUNDS: { value: BioBackground; label: string }[] = [
  { value: "plain", label: "Plain" },
  { value: "soft", label: "Soft" },
  { value: "accent", label: "Colour" },
  { value: "deep", label: "Deep" },
];

export const BIO_PROFILE_LAYOUTS: { value: BioProfileLayout; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "hero", label: "Cover" },
  { value: "grid", label: "Tiles" },
  { value: "editorial", label: "Editorial" },
  { value: "cards", label: "Cards" },
];

export const BIO_RELEASE_LAYOUTS: { value: BioReleaseLayout; label: string }[] = [
  { value: "list", label: "List" },
  { value: "poster", label: "Poster" },
  { value: "tiles", label: "Tiles" },
  { value: "vinyl", label: "Vinyl" },
  { value: "spotlight", label: "Spotlight" },
  { value: "minimal", label: "Minimal" },
];

export const BIO_FONTS: { value: BioFont; label: string }[] = [
  { value: "sans", label: "Sans" },
  { value: "serif", label: "Serif" },
  { value: "rounded", label: "Rounded" },
  { value: "mono", label: "Mono" },
];

export const DEFAULT_BIO_THEME: BioTheme = {
  appearance: "light",
  accent: "#1d1d1f",
  buttonStyle: "rounded",
  background: "plain",
  layout: "classic",
  font: "sans",
};

export function layoutsFor(kind: BioPageKind): { value: BioLayout; label: string }[] {
  return kind === "release" ? BIO_RELEASE_LAYOUTS : BIO_PROFILE_LAYOUTS;
}

export function layoutFor(kind: BioPageKind, layout: BioLayout | undefined): BioLayout {
  const options = layoutsFor(kind);
  return options.some((o) => o.value === layout) ? layout! : options[0].value;
}

export function withThemeDefaults(theme: Partial<BioTheme> | undefined): BioTheme {
  return { ...DEFAULT_BIO_THEME, ...theme };
}

export const BIO_MAX_LINKS = 30;
export const BIO_MAX_ROWS = 40;

export const BIO_KIND_LABEL: Record<BioPageKind, string> = { profile: "Bio page", release: "Smart link" };

const SLUG_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

export function randomSlug(length = 6): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => SLUG_ALPHABET[b % SLUG_ALPHABET.length]).join("");
}

export function cleanSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 32);
}

export function emptyRelease(): BioRelease {
  return { artworkUrl: "", subtitle: "Choose music service", releaseDate: "", rows: [] };
}

export function emptyBioPage(kind: BioPageKind, name: string): BioPageInput {
  return {
    kind,
    slug: randomSlug(),
    title: kind === "profile" ? name : "",
    bio: "",
    avatarUrl: "",
    links: [],
    socials: [],
    release: kind === "release" ? emptyRelease() : null,
    theme: { ...DEFAULT_BIO_THEME },
    published: true,
  };
}

export function newRowId(): string {
  return `new-${Math.random().toString(36).slice(2, 10)}`;
}

export function publicBioUrl(slug: string): string {
  return `${window.location.origin}${BIO_PUBLIC_PATH}${slug}`;
}

export function publicBioDisplay(slug: string): string {
  return `${window.location.host}${BIO_PUBLIC_PATH}${slug}`;
}

export function publicBioPrefix(): string {
  return `${window.location.host}${BIO_PUBLIC_PATH}`;
}

export function bioHitUrl(slug: string): string {
  return `${API_BASE}/api/public/bio/${encodeURIComponent(slug)}/hit`;
}

export function bioPageUrl(slug: string): string {
  return `${API_BASE}/api/public/bio/${encodeURIComponent(slug)}`;
}

export function clickRate(views: number, clicks: number): string {
  if (!views) return "—";
  return `${Math.round((clicks / views) * 100)}%`;
}
