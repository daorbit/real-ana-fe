import { useCallback, useEffect, useRef, useState } from "react";
import { notify } from "@/shared/lib/notify";
import { getToken } from "@/shared/lib/http";

/**
 * Starting an Instagram connection from anywhere in the studio.
 *
 * The sibling of `useLinkedInConnect`, and the same shape for the same reasons:
 * the flow runs in a popup so the page someone was on — and anything typed into
 * it — is still there when they come back, and the app's own token rides in the
 * query string because a top-level navigation cannot carry an `Authorization`
 * header. The server verifies it, mints a signed state token, and redirects to
 * instagram.com immediately.
 *
 * @param onConnected Runs after a successful connection, to refresh whatever
 *                    the calling page shows.
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

/**
 * The reasons the server reports, in words.
 *
 * Kept in step with `REASON_TEXT` in the Instagram route, which renders the same
 * wording inside the popup. Both are needed: the popup for someone watching it,
 * the toast for someone whose attention went back to the app.
 */
const REASON_TEXT: Record<string, string> = {
  not_signed_in: "Your session could not be verified. Sign in again, then retry connecting Instagram.",
  not_configured:
    "Instagram is not set up on this deployment yet. Ask an administrator to add the credentials.",
  demo: "Instagram cannot be connected from a demo session.",
  invalid_state: "That connection attempt expired. Please try again.",
  missing_code: "Instagram did not return an authorisation code. Please try again.",
  instagram_failed: "Instagram could not complete the connection. Please try again.",
  save_failed: "The connection could not be saved. Please try again.",
  no_publish: "Posting permission was not granted. Reconnect and allow publishing to continue.",
  already_connected: "That Instagram account is already connected to a different Quantalog account.",
  not_professional:
    "Only Instagram Business or Creator accounts can be connected. Switch your account type in the Instagram app, then try again.",
};

export function useInstagramConnect(onConnected?: () => void) {
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
      if (e.data?.source !== "quantalog-instagram") return;

      setConnecting(false);
      if (e.data.status === "connected") {
        notify.success("Instagram connected");
        done.current?.();
      } else if (e.data.status === "cancelled") {
        notify.info("Instagram connection cancelled");
      } else {
        // The server names the cause, and most of these need a different action
        // rather than another attempt — switching account type, signing in
        // again, or an admin adding credentials.
        notify.error(
          REASON_TEXT[e.data.reason] ?? "Could not connect Instagram. Please try again.",
        );
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const connect = useCallback(() => {
    const token = getToken() ?? "";
    const url = `${API_BASE}/api/auth/instagram?token=${encodeURIComponent(token)}`;

    setConnecting(true);
    const popup = window.open(url, "instagram-oauth", "width=600,height=720,menubar=no,toolbar=no");

    // Blocked popup: fall back to a full navigation, so a blocker makes the flow
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
  }, []);

  return { connect, connecting };
}
