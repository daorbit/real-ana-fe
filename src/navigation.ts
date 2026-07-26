import type { NavigateFunction } from "react-router-dom";

/**
 * A module-level handle onto React Router's `navigate`, set once by
 * `NavigationCapture` (mounted inside `<BrowserRouter>`) so code outside the
 * component tree — like a dialog opened imperatively through Mantine's
 * `modals` singleton, which renders as a sibling of the router rather than a
 * descendant of it — can still do a client-side route change instead of a
 * full-page `window.location` reload.
 */
let navigateRef: NavigateFunction | null = null;

export function setNavigate(fn: NavigateFunction) {
  navigateRef = fn;
}

/** Navigate client-side if the router handle is available, otherwise fall back to a real page load. */
export function navigateTo(to: string) {
  if (navigateRef) navigateRef(to);
  else window.location.assign(to);
}
