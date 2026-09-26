import { getToken } from "@/shared/lib/http";
import { useOAuthPopup } from "@/shared/lib/useOAuthPopup";

/**
 * Starting a Google Business Profile connection.
 *
 * The flow runs in a popup rather than navigating this page — a connection is a
 * detour, and the page someone was on should still be there when they come
 * back. A full navigation of *some* window is unavoidable, since the endpoint
 * redirects to accounts.google.com and the consent screen has to render in an
 * address bar. That is also why the app's own token rides in the query string:
 * a navigation cannot carry an `Authorization` header. The server verifies it,
 * checks workspace membership, mints a signed state token, and redirects away
 * immediately.
 *
 * Unlike the LinkedIn hook this one carries a workspace id, because a Google
 * connection belongs to a workspace rather than to the person who authorised
 * it — see `GoogleConnection` on the server for why.
 *
 * @param workspaceId Which workspace the connection will belong to.
 * @param onConnected Runs after a successful connection, to refresh the page.
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

/**
 * The reasons the server reports, in words.
 *
 * Kept in step with `REASON_TEXT` on the server, which renders the same wording
 * inside the popup. Both are needed and shown in different places: the popup
 * for someone watching it, the toast for someone whose attention went back to
 * the app.
 */
const REASON_TEXT: Record<string, string> = {
  not_signed_in:
    "Your session could not be verified. Sign in again, then retry connecting Google.",
  not_configured:
    "Google Reviews is not set up on this deployment yet. Ask an administrator to add the credentials.",
  demo: "Google cannot be connected from a demo session.",
  no_access: "You need admin access to this workspace to connect Google.",
  invalid_state: "That connection attempt expired. Please try again.",
  missing_code: "Google did not return an authorisation code. Please try again.",
  denied: "You cancelled the Google authorisation.",
  no_refresh_token:
    "Google did not return a refresh token. Remove Quantalog from your Google account permissions, then try again.",
  scope_declined:
    "Business Profile access was not granted. That permission is required to read your reviews.",
  google_failed: "Google could not complete the connection. Please try again.",
  save_failed: "The connection could not be saved. Please try again.",
};

export function useGoogleConnect(workspaceId: string | undefined, onConnected?: () => void) {
  return useOAuthPopup({
    source: "quantalog-google-reviews",
    buildUrl: () =>
      workspaceId
        ? `${API_BASE}/api/auth/google-business` +
          `?token=${encodeURIComponent(getToken() ?? "")}&workspaceId=${encodeURIComponent(workspaceId)}`
        : null,
    reasonText: REASON_TEXT,
    successMessage: "Google connected",
    cancelledMessage: "Google connection cancelled",
    fallbackError: "Could not connect Google. Please try again.",
    onDone: onConnected,
  });
}
