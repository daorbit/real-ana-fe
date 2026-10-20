import { MAX_SITES_PER_WORKSPACE, type QuotaSummary } from "@/shared/types";

export function siteQuota(billing: QuotaSummary | undefined): number {
  return billing?.sites.quota ?? MAX_SITES_PER_WORKSPACE;
}

export function sitesUsed(billing: QuotaSummary | undefined, loadedCount: number): number {
  return Math.max(billing?.sites.used ?? 0, loadedCount);
}

export function hasSiteSlot(billing: QuotaSummary | undefined, loadedCount: number): boolean {
  return sitesUsed(billing, loadedCount) < siteQuota(billing);
}
