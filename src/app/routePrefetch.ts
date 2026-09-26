/**
 * Warms a route's lazy chunk before the user clicks it.
 *
 * The routes in `App.tsx` are `React.lazy`, so their JavaScript is only fetched
 * on navigation — the first visit to a page pays a chunk download before it can
 * render. Calling `prefetchRoute` on link hover or focus kicks that same
 * `import()` early, so by click time the chunk is usually already parsed and the
 * page swaps in with no wait.
 *
 * The importers here must be the exact same module specifiers as the `lazy()`
 * calls in `App.tsx` — the bundler keys its chunk map on the string, so a
 * mismatch would fetch a second copy instead of priming the first.
 *
 * Each import fires at most once: the browser caches the module, and the guard
 * set keeps a slow hover from queueing duplicates.
 */
const importers: Record<string, () => Promise<unknown>> = {
  "/app/orbit": () => import("@/features/orbit/pages/Orbit"),
  "/app/analytics": () => import("@/features/analytics/pages/Analytics"),
  "/app/seo": () => import("@/features/seo/pages/Seo"),
  "/app/search-visibility": () => import("@/features/searchConsole/pages/SearchConsole"),
  "/app/search-visibility/page": () => import("@/features/searchConsole/pages/SearchConsolePageDetail"),
  "/app/search-console": () => import("@/features/searchConsole/pages/SearchConsole"),
  "/app/search-console/page": () => import("@/features/searchConsole/pages/SearchConsolePageDetail"),
  "/app/compare": () => import("@/features/compare/pages/Compare"),
  "/app/workspaces": () => import("@/features/workspace/pages/Workspaces"),
  "/app/members": () => import("@/features/workspace/pages/Members"),
  "/app/branding": () => import("@/features/branding/pages/Branding"),
  "/app/media": () => import("@/features/media/pages/MediaLibrary"),
  "/app/share": () => import("@/features/analytics/pages/Share"),
  "/app/reports": () => import("@/features/reports/pages"),
  "/app/journey": () => import("@/features/journey/pages/Journey"),
  "/app/social": () => import("@/features/social/pages/SocialPosts"),
  "/app/lead-capture": () => import("@/features/leadCapture/pages/LeadCapture"),
  "/app/developers": () => import("@/features/support/pages/Developers"),
  "/app/settings": () => import("@/features/auth/pages/Settings"),
  "/app/settings/profile": () => import("@/features/auth/pages/Settings"),
  "/app/settings/appearance": () => import("@/features/auth/pages/Settings"),
  "/app/settings/connections": () => import("@/features/auth/pages/Settings"),
  "/app/settings/notifications": () => import("@/features/auth/pages/Settings"),
  "/app/settings/security": () => import("@/features/auth/pages/Settings"),
  "/app/billing": () => import("@/features/billing/pages/Billing"),
};

const pending = new Map<string, Promise<void>>();

export function prefetchRoute(to: string): Promise<void> {
  const path = to.split(/[?#]/)[0];
  const existing = pending.get(path);
  if (existing) return existing;
  const load = importers[path];
  if (!load) return Promise.resolve();
  // Swallow: a failed prefetch is not a user-facing error — the real
  // navigation will retry the import and surface any problem then.
  const promise = load().then(
    () => undefined,
    () => {
      pending.delete(path);
    },
  );
  pending.set(path, promise);
  return promise;
}
