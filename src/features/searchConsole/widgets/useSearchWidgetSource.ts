import { skipToken } from "@reduxjs/toolkit/query";
import { useGetSearchConsoleStatusQuery } from "@/app/store";
import { useSearchEntitlements } from "@/features/searchConsole/useSearchEntitlements";
import { useDemo } from "@/features/demo/context";
import { demoSearchConsoleStatus, DEMO_PROPERTY_URL } from "@/features/demo/demoSearchConsole";
import type { Site } from "@/shared/types";

export type SearchSource =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "not-configured" }
  | { kind: "no-site" }
  | { kind: "connect" }
  | { kind: "reconnect"; message: string }
  | { kind: "link"; siteName: string }
  | { kind: "ready"; workspaceId: string; siteId: string; siteName: string; propertyUrl: string; days: number };

export type SearchSourceInput = {
  workspaceId?: string;
  sites: Site[];
  siteScope: string[];
  range?: string;
};

export function searchDaysFor(range: string | undefined, maxDays: number): number {
  const wanted = range === "30d" ? 28 : 7;
  return wanted <= maxDays ? wanted : 7;
}

export function useSearchWidgetSource({ workspaceId, sites, siteScope, range }: SearchSourceInput): SearchSource {
  const { maxDays } = useSearchEntitlements();
  const { data: realStatus, isLoading, isError } = useGetSearchConsoleStatusQuery(workspaceId ?? skipToken);

  const { demo } = useDemo();
  const status = demo ? demoSearchConsoleStatus() : realStatus;

  if (!workspaceId || (!demo && isLoading)) return { kind: "loading" };
  if (!demo && (isError || !status)) return { kind: "error" };
  if (!status) return { kind: "error" };
  if (!status.configured) return { kind: "not-configured" };

  const webSites = sites.filter((s) => s.platform !== "app");
  if (webSites.length === 0) return { kind: "no-site" };

  if (!status.connected || !status.connection) return { kind: "connect" };
  if (status.connection.status !== "active") {
    return { kind: "reconnect", message: status.connection.statusMessage };
  }

  const linkFor = (siteId: string) => status.links.find((l) => l.siteId === siteId);
  const scoped = webSites.find((s) => s.siteId === siteScope[0]);
  const site = scoped ?? webSites.find((s) => linkFor(s.siteId)) ?? webSites[0];
  const link = demo ? { siteId: site.siteId, propertyUrl: DEMO_PROPERTY_URL } : linkFor(site.siteId);

  if (!link) return { kind: "link", siteName: site.name };

  return {
    kind: "ready",
    workspaceId,
    siteId: site.siteId,
    siteName: site.name,
    propertyUrl: link.propertyUrl,
    days: searchDaysFor(range, maxDays),
  };
}
