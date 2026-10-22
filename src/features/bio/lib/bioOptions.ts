import type { BioButtonStyle, BioPageInput, BioSocialNetwork } from "@/features/bio/types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export const BIO_SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/;

export const BIO_SOCIAL_NETWORKS: { id: BioSocialNetwork; label: string; placeholder: string }[] = [
  { id: "instagram", label: "Instagram", placeholder: "instagram.com/yourname" },
  { id: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/yourname" },
  { id: "x", label: "X", placeholder: "x.com/yourname" },
  { id: "youtube", label: "YouTube", placeholder: "youtube.com/@yourchannel" },
  { id: "tiktok", label: "TikTok", placeholder: "tiktok.com/@yourname" },
  { id: "facebook", label: "Facebook", placeholder: "facebook.com/yourpage" },
  { id: "github", label: "GitHub", placeholder: "github.com/yourname" },
  { id: "website", label: "Website", placeholder: "yourwebsite.com" },
  { id: "email", label: "Email", placeholder: "you@example.com" },
];

export const BIO_ACCENTS = ["#2f6bff", "#1d1d1f", "#30a46c", "#e5484d", "#f76b15", "#8e4ec6", "#0091ff", "#d6409f"];

export const BIO_BUTTON_STYLES: { value: BioButtonStyle; label: string }[] = [
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
  { value: "square", label: "Square" },
];

export const BIO_MAX_LINKS = 30;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export function emptyBioPage(name: string): BioPageInput {
  return {
    slug: slugify(name),
    title: name,
    bio: "",
    avatarUrl: "",
    links: [],
    socials: [],
    theme: { appearance: "light", accent: BIO_ACCENTS[0], buttonStyle: "rounded" },
    published: true,
  };
}

export function newLinkId(): string {
  return `new-${Math.random().toString(36).slice(2, 10)}`;
}

export function publicBioUrl(slug: string): string {
  return `${window.location.origin}/bio/${slug}`;
}

export function publicBioDisplay(slug: string): string {
  return `${window.location.host}/bio/${slug}`;
}

export function bioClickUrl(slug: string, linkId: string): string {
  return `${API_BASE}/api/public/bio/${encodeURIComponent(slug)}/go/${encodeURIComponent(linkId)}`;
}

export function bioViewUrl(slug: string): string {
  return `${API_BASE}/api/public/bio/${encodeURIComponent(slug)}/view`;
}

export function bioPageUrl(slug: string): string {
  return `${API_BASE}/api/public/bio/${encodeURIComponent(slug)}`;
}

export function clickRate(views: number, clicks: number): string {
  if (!views) return "—";
  return `${Math.round((clicks / views) * 100)}%`;
}
