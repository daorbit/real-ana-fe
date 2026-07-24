import {
  demoWorkspaces, demoSites, demoGoals, demoApiKeys, demoShare, demoSeoReport,
  demoSeoHistory, demoSeoShare, demoCrawl, demoSearchTraffic, demoVitals,
  demoCompetitors, demoInstallStatus, demoStats, DEMO_WORKSPACE_ID,
} from "./demoData";

/**
 * Answer a dashboard request from the demo fixtures.
 *
 * The demo never reaches the server: this maps a request URL onto the generated
 * data in `demoData`, so browsing the product costs nothing and touches no real
 * account. Returns `undefined` for anything it does not recognise, which the
 * caller turns into an empty result rather than a network call — a demo session
 * should never be the reason a request goes out.
 */
export function resolveDemoRequest(url: string): unknown | undefined {
  // Strip the query string for matching, but keep it for the few endpoints
  // whose response depends on it (the stats range).
  const [path, search = ""] = url.split("?");
  const params = new URLSearchParams(search);

  // --- workspaces, sites, layout ------------------------------------------
  if (path === "/api/workspaces") return demoWorkspaces;
  if (/^\/api\/workspaces\/[^/]+$/.test(path)) return demoWorkspaces[0];
  if (/\/sites$/.test(path)) return demoSites;
  if (/\/sites\/[^/]+\/status$/.test(path)) return demoInstallStatus;
  if (/\/layout$/.test(path)) return { layout: null };

  // --- analytics -----------------------------------------------------------
  if (/\/stats$/.test(path)) return demoStats(params.get("range") ?? "24h");
  if (/\/retention$/.test(path)) return [];
  if (/\/funnel$/.test(path)) return { steps: [] };

  // --- goals, keys, sharing ------------------------------------------------
  if (/\/goals$/.test(path)) return demoGoals;
  if (/\/keys$/.test(path)) return demoApiKeys;
  if (/\/share$/.test(path)) {
    // The SEO report's share settings live under a report path; the workspace's
    // are at the top level. Same suffix, different shape.
    return /\/seo\/reports\//.test(path) ? demoSeoShare : demoShare;
  }

  // --- SEO -----------------------------------------------------------------
  if (/\/seo\/latest$/.test(path)) return demoSeoReport;
  if (/\/seo\/reports$/.test(path)) return demoSeoHistory;
  if (/\/seo\/reports\/[^/]+$/.test(path)) return demoSeoReport;
  if (/\/seo\/crawl\/latest$/.test(path)) return demoCrawl;
  if (/\/seo\/search-traffic$/.test(path)) return demoSearchTraffic;
  if (/\/seo\/vitals$/.test(path)) return demoVitals;
  if (/\/seo\/competitors$/.test(path)) return demoCompetitors;

  // --- admin ---------------------------------------------------------------
  // The demo account is a plain user, so these are never reached in practice.
  if (path.startsWith("/api/admin")) return { users: [], total: 0 };

  return undefined;
}

/** Exported for tests and for the workspace bootstrap to agree on the id. */
export { DEMO_WORKSPACE_ID };
