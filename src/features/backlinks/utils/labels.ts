import type { AnchorKind, BacklinkOrigin, BacklinkStatus, LinkRel, SourceKind } from "../types";

export const STATUS_META: Record<BacklinkStatus, { label: string; color: string; hint: string }> = {
  live: { label: "Live", color: "teal", hint: "The link is on the page right now." },
  lost: { label: "Lost", color: "red", hint: "The link was seen before but has been removed from the page." },
  "page-gone": { label: "Page gone", color: "red", hint: "The page that linked to you now returns an error." },
  unverified: { label: "Unverified", color: "gray", hint: "The page loads, but no link to your site was found on it." },
  unreachable: { label: "Unreachable", color: "orange", hint: "The page could not be fetched on the last check." },
  pending: { label: "Not checked", color: "gray", hint: "Found but not fetched yet." },
};

export const REL_META: Record<LinkRel, { label: string; color: string; hint: string }> = {
  follow: { label: "Follow", color: "teal", hint: "Passes ranking authority to your page." },
  nofollow: { label: "Nofollow", color: "gray", hint: "Sends visitors but asks search engines not to pass authority." },
  ugc: { label: "UGC", color: "gray", hint: "User-generated content such as comments and forum posts. Treated like nofollow." },
  sponsored: { label: "Sponsored", color: "yellow", hint: "A paid or affiliate placement." },
};

export const REL_LABEL: Record<LinkRel, string> = {
  follow: REL_META.follow.label,
  nofollow: REL_META.nofollow.label,
  ugc: REL_META.ugc.label,
  sponsored: REL_META.sponsored.label,
};

export const ORIGIN_LABEL: Record<BacklinkOrigin, string> = {
  referral: "From referrers",
  manual: "Added by hand",
  index: "From index",
  scan: "From page check",
};

export const ANCHOR_LABEL: Record<AnchorKind, string> = {
  branded: "Branded",
  keyword: "Keyword",
  url: "URL",
  generic: "Generic",
  image: "Image",
};

export const SOURCE_LABEL: Record<SourceKind, string> = {
  editorial: "Editorial",
  directory: "Directory",
  community: "Community",
  social: "Social",
};

export const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "lost", label: "Lost" },
  { value: "unverified", label: "Unverified" },
] as const;

export type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

export function matchesFilter(status: BacklinkStatus, filter: StatusFilter): boolean {
  if (filter === "all") return true;
  if (filter === "lost") return status === "lost" || status === "page-gone";
  if (filter === "unverified") return status !== "live" && status !== "lost" && status !== "page-gone";
  return status === filter;
}

export function pathOf(url: string): string {
  try {
    const u = new URL(url);
    return `${u.pathname}${u.search}` || "/";
  } catch {
    return url;
  }
}
