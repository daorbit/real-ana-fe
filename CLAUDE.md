# real-ana-fe — dashboard app

React 19 + Vite 8 + Mantine 9 + Redux Toolkit Query + react-router 7. This app is live with real users. Keep it fast.

## Structure

- `src/main.tsx`: providers. `src/app/App.tsx`: routes. `src/app/AppShell.tsx` and `src/app/shell/*`: the layout around every page.
- `src/app/store/api.ts`: the single RTK Query API. Every endpoint lives here.
- `src/features/<feature>/{pages,components,hooks,lib}`: feature code.
- `src/shared/{ui,hooks,lib,types}`: cross-feature building blocks.
- Styling: Mantine props, `*.module.css` next to the component, and existing global CSS. No inline styles, and no comments in CSS.

## The eager graph (what every visitor downloads)

Code is in the first bundle if `main.tsx`, `App.tsx`, `AppShell.tsx`, `app/shell/*`, the auth pages, `features/analytics/pages/Home.tsx` or `WidgetRenderer.tsx` imports it, directly or indirectly. Keep that set small.

- **New pages** are `React.lazy` in `App.tsx`. Also add the page to `importers` in `src/app/routePrefetch.ts`, using **exactly the same import string** (otherwise the bundler fetches a second copy).
- **Heavy libraries never enter the eager graph:** `highlight.js`, `lottie-react`, `d3-geo`, `topojson-client`, `world-atlas`, `leaflet`/`react-leaflet`, `@xyflow/react`, `canvas-confetti`, `simple-icons`, `react-easy-crop`, `@dnd-kit/*`. Load them with `lazy()` and a `<Suspense>` fallback built from `src/shared/ui/Skeletons.tsx`.
- **Code highlighting** goes only through `src/app/highlightAdapter.ts`, which loads highlight.js when the browser is idle. Never `import "highlight.js"` anywhere else.
- **Home widgets** that aren't in the default layout go in `features/analytics/components/widgets/lazyWidgets.ts` and render inside `Deferred` in `WidgetRenderer`.
- **Splitting a module:** if an eager module needs a small helper from a heavy one, move the helper into its own file. Example: `shared/ui/welcomePending.ts` was split out of `WelcomeOverlay`.
- **Background route downloads** stay limited to `COMMON_ROUTES` in `routePrefetch.ts`. They start late, run when the browser is idle, and are skipped on slow or data-saver connections. Never go back to prefetching every route.
- **Deferred work** uses `src/shared/lib/idle.ts`: `onIdle`, `whenIdle`, `isConstrainedNetwork`.

## Data fetching rules

All server data goes through RTK Query endpoints in `api.ts`. Raw `fetch` is allowed only for auth calls via `shared/lib/http`, file downloads and exports, and public token pages (share, embed).

1. **Never add `refetchOnFocus: true`.** It refetches on every alt-tab. Use `useRefetchOnFocus(refetch, fulfilledTimeStamp, minAgeMs, enabled)` from `src/shared/hooks/useRefetchOnFocus.ts`. Current thresholds: stats 30s, notification count 15s, sites 5 min.
2. **Polling only for live data**, and always with `skipPollingIfUnfocused: true`. These are the only polls on the shell and Home:
   - `useLive`: 10s
   - `useStats`: 60s (`POLL_MS`)
   - `useNotificationCount`: 30s

   Lists that change only through the app's own mutations (sites, goals, layouts, members, settings) **must not poll**. They refresh through `providesTags` / `invalidatesTags`.
3. **Skip until the arguments exist.** Use `skip` or `skipToken` while a workspace id or other required input is missing, and in demo mode where demo data replaces the request.
4. **Closed UI fetches nothing.** Panels, drawers, modals and prompts mount their fetching component only when open or eligible:
   - `NotesPanel` returns null while closed.
   - `ActivityDrawer` uses `skip: !opened`.
   - `PushPrompt` is a cheap check; `PushPromptCard` does the fetching.
5. **The shell is the most expensive place for a query.** Anything in `ShellFrame`, `Rail`, the providers inside `Protected`, `CommandPalette` or the notices runs on **every page of every session**. Prefer reading data that is already loaded, or defer the request until the user interacts.
6. **Reuse loaded data before adding an endpoint call.**
   - Plan and quota for the active workspace: `useActiveBilling()` / `useActiveUsage()` from `features/workspace/context.tsx`. The workspace list already includes `billing`.
   - Only the billing pages call `useGetWorkspaceUsageQuery` directly.
   - Workspaces and the active workspace: `useWorkspace()`. Sites: `useSites()`. Site scope: `useSiteScope()`.
7. **No cross-workspace bleed.** Read `currentData`, falling back to `data` only when `originalArgs` matches the current arguments. `useStats` and `useSites` show the pattern.
8. **Avoid `resetApiState`** except on auth transitions (login, logout, impersonation, unlock), where it is intentional.
9. **Keep `useEffect` dependencies stable.** Use module-level constants such as `const EMPTY: T[] = []` instead of `data ?? []` inside dependency arrays.

## Startup prefetch (keep in sync)

`src/app/bootPrefetch.ts` starts the first requests in parallel with `/api/auth/me`, so Home doesn't wait on a chain of requests.

- Always: workspaces, notification count, and the remembered workspace's theme.
- On Home (`/`, `/app`): stats (`range: "24h"` plus the saved site scope), live visitors, layout and sites.

RTK Query only reuses a prefetched result if the **arguments are identical**. If you change the arguments of `useStats`, `useLive`, `useSites`, `useHomeWidgets` or `useSyncWorkspaceTheme`, or change Home's range, **update `bootPrefetch.ts` in the same change**.

## Expected requests on a cold `/app` load (signed in)

`/api/auth/me`, `/api/workspaces`, `/api/notifications/unread-count`, `/:wid/theme`, `/:wid/stats?range=24h`, `/:wid/live`, `/:wid/layout`, `/:wid/sites`, plus Orbit status and the queries of any non-default widgets in the layout. Notification preferences load only when the push prompt can actually appear. The push subscription is re-sent at most once a day (`features/activity/pushSync.ts`).

If a change adds to this list or makes any of these requests repeat, either fix it or explain why in your final message.

## Rendering

- Context providers near the root pass memoized values. Don't create new objects or functions on every render in `App.tsx`-level providers.
- Animations respect `readThemePrefs().motion` and `prefers-reduced-motion`. Follow the pattern in `AppShell.tsx`.
- No hover box-shadow and no transform lift or scale on hover. Change border, colour or opacity only.

## Checklist before saying a change is done

- [ ] No new heavy import in the eager graph.
- [ ] No new query on the shell or Home without a reason. No new polling. No `refetchOnFocus`.
- [ ] Closed or hidden UI doesn't fetch.
- [ ] `bootPrefetch.ts` still matches the hook arguments.
- [ ] Any new route is lazy and registered in `routePrefetch.ts`.
- [ ] No comments, no inline styles, existing helpers reused, files split sensibly.
