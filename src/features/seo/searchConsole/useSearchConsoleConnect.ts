import { getToken } from "@/shared/lib/http";
import { useOAuthPopup } from "@/shared/lib/useOAuthPopup";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

const REASON_TEXT: Record<string, string> = {
  not_signed_in: "Your session could not be verified. Sign in again, then retry.",
  not_configured:
    "Search Console is not set up on this deployment yet. Ask an administrator to add the Google credentials.",
  demo: "Search Console cannot be connected from a demo session.",
  no_access: "You need admin access to this workspace to connect Search Console.",
  plan_required: "Search Console needs this workspace on a paid plan.",
  invalid_state: "That connection attempt expired. Please try again.",
  missing_code: "Google did not return an authorisation code. Please try again.",
  denied: "You cancelled the Google authorisation.",
  no_refresh_token:
    "Google did not return a refresh token. Remove Quantalog from your Google account permissions, then try again.",
  scope_declined:
    "Search Console access was not granted. Tick the Search Console permission on Google's consent screen.",
  google_failed: "Google could not complete the connection. Please try again.",
  save_failed: "The connection could not be saved. Please try again.",
};

export function useSearchConsoleConnect(workspaceId: string | undefined, onConnected?: () => void) {
  return useOAuthPopup({
    source: "quantalog-search-console",
    buildUrl: () =>
      workspaceId
        ? `${API_BASE}/api/auth/search-console` +
          `?token=${encodeURIComponent(getToken() ?? "")}&workspaceId=${encodeURIComponent(workspaceId)}`
        : null,
    reasonText: REASON_TEXT,
    successMessage: "Search Console connected",
    cancelledMessage: "Search Console connection cancelled",
    fallbackError: "Could not connect Search Console. Please try again.",
    onDone: onConnected,
  });
}
