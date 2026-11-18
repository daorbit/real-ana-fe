import type { Site } from "@/shared/types";

export const SEO_SITE_PARAM = "site";
export const SEO_PAGE_PARAM = "page";

export function normalizePagePath(input: string | null | undefined): string {
  const raw = String(input ?? "").trim();
  if (!raw) return "/";
  const withoutOrigin = raw.replace(/^https?:\/\/[^/]+/i, "");
  const path = withoutOrigin.split(/[?#]/)[0].replace(/\/+$/, "");
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function pickSeoSite<T extends Pick<Site, "siteId">>(sites: T[], siteParam: string | null): T | null {
  return sites.find((s) => s.siteId === siteParam) ?? sites[0] ?? null;
}

export function seoPageSearch(current: string, siteId: string, path: string): string {
  const out = new URLSearchParams(current);
  out.delete("section");
  out.set(SEO_SITE_PARAM, siteId);
  out.set(SEO_PAGE_PARAM, normalizePagePath(path));
  return `?${out.toString()}`;
}

export function pageAddress(domain: string, path: string): string {
  return `https://${domain}${path === "/" ? "" : path}`;
}

export function pageLabel(path: string): string {
  return path === "/" ? "Home" : path;
}
