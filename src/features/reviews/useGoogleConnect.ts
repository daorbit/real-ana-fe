import { useCallback, useEffect, useRef, useState } from "react";
import { notify } from "@/shared/lib/notify";
import { getToken } from "@/shared/lib/http";

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
  const [connecting, setConnecting] = useState(false);
  // Held so the "did they just close it?" poll can be cleared on unmount.
  const timer = useRef<number | null>(null);
  const done = useRef(onConnected);
  done.current = onConnected;

  useEffect(() => {
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  // The popup reports its outcome here and closes itself.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // Same-origin only, and only our own message shape: any page holding a
      // handle on this window can post to it.
      if (e.origin !== window.location.origin) return;
      if (e.data?.source !== "quantalog-google-reviews") return;

      setConnecting(false);
      if (e.data.status === "connected") {
        notify.success("Google connected");
        done.current?.();
      } else if (e.data.reason === "denied") {
        notify.info("Google connection cancelled");
      } else {
        // The server names the cause; showing it beats a generic retry message,
        // because most of these need a different action rather than another
        // attempt — signing in again, or an admin adding credentials.
        notify.error(REASON_TEXT[e.data.reason] ?? "Could not connect Google. Please try again.");
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const connect = useCallback(() => {
    if (!workspaceId) return;

    const token = getToken() ?? "";
    const url =
      `${API_BASE}/api/auth/google-business` +
      `?token=${encodeURIComponent(token)}&workspaceId=${encodeURIComponent(workspaceId)}`;

    setConnecting(true);
    const popup = window.open(url, "google-oauth", "width=600,height=720,menubar=no,toolbar=no");

    // Blocked popup: fall back to a full navigation so a blocker makes the flow
    // clumsy rather than broken. Nothing is left to wait for in this window.
    if (!popup) {
      setConnecting(false);
      window.location.href = url;
      return;
    }

    // The window can also be closed by hand, which sends no message at all.
    // Without this the button would spin for ever.
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      if (!popup.closed) return;
      window.clearInterval(timer.current!);
      timer.current = null;
      setConnecting(false);
      // It may have closed *because* it succeeded, a moment before its message
      // arrived; re-reading the status settles which.
      done.current?.();
    }, 700);
  }, [workspaceId]);

  return { connect, connecting };
}
