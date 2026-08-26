import { API_ORIGIN } from "@/shared/lib/http";

/**
 * The identified-user journey tracer for Quantalog's own dashboard —
 * dogfooding the same trace() model the Platform API docs give customers.
 *
 * One call per action, no separate identify step: the user id is passed
 * fresh on every call from whatever the caller already has (here, the
 * logged-in user's id), so there's nothing to go stale after a logout.
 * Posts to the public, siteId-only /api/track — no secret involved, safe to
 * call straight from the browser.
 *
 * Deliberately a different site from the anonymous tracker.js instance
 * mounted in App.tsx: that one tracks anonymous pageviews/clicks against the
 * marketing-site-shaped site, this one tracks identified dashboard usage
 * against an "app" site created for that purpose.
 */
const JOURNEY_SITE_ID = "WdPhndWAd6-CrQsJ";

export function trace(userId: string | undefined, action: string, src?: string, dest?: string): void {
  if (!userId) return;
  fetch(`${API_ORIGIN}/api/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ siteId: JOURNEY_SITE_ID, appUserId: userId, action, src, dest }),
  }).catch(() => {
    // Best-effort, same as the tracker: a dropped event must never crash or
    // block the app.
  });
}
