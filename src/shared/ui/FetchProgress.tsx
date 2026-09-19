import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

/**
 * Endpoints that poll on a timer in the background, on every screen, for as
 * long as the app is open. A pending request from one of these is not a
 * refresh anyone asked for — it is the badge or the live counter doing its
 * job — and flashing the bar every 10-30 seconds forever reads as the app
 * being perpetually busy rather than as a signal worth noticing.
 */
const POLLING_ENDPOINTS = new Set(["getNotificationCount", "getLive", "getStats", "getSites"]);

/**
 * A thin bar across the top of the viewport whenever a background refetch is
 * in flight while data is already on screen.
 *
 * The full-page skeletons only cover a first load. A stale-while-revalidate
 * refresh — a tag invalidation or a manual Refresh — otherwise gives no sign
 * anything is happening, so a number that is about to change looks static.
 * This is the smallest possible signal: no layout shift, gone the instant the
 * last request settles. Excludes the endpoints above, whose pending state is
 * routine rather than newsworthy.
 */
export function FetchProgress() {
  const busy = useSelector((state: RootState) => {
    const queries = state.api.queries;
    for (const key in queries) {
      const query = queries[key];
      if (!query || query.status !== "pending") continue;
      if (POLLING_ENDPOINTS.has(query.endpointName ?? "")) continue;
      return true;
    }
    return false;
  });

  if (!busy) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        insetInline: 0,
        top: 0,
        height: 2,
        zIndex: 350,
        background: "var(--accent, var(--mantine-color-emerald-5))",
        animation: "fetch-progress 1.1s ease-in-out infinite",
        transformOrigin: "left",
      }}
    />
  );
}
