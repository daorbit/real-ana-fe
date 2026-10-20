import type { Site } from "@/shared/types";

export type SetupState = { kind: "no-site" } | { kind: "unverified"; sites: Site[] } | null;

export function isSiteVerified(site: Site) {
  return Boolean(site.firstEventAt);
}

export function setupStateFor(sites: Site[], loaded: boolean): SetupState {
  if (!loaded) return null;
  if (sites.length === 0) return { kind: "no-site" };
  if (sites.some(isSiteVerified)) return null;
  return { kind: "unverified", sites };
}
