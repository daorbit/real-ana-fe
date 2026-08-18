import { useCallback, useEffect, useRef, useState } from "react";
import { notify } from "@/shared/lib/notify";
import { getToken } from "@/shared/lib/http";

/**
 * Starting a LinkedIn connection from anywhere in the studio.
 *
 * The flow runs in a popup rather than navigating this page. That matters most
 * in the Share Panel, where the page holds an unsaved caption and a rendered
 * card, but it is the right shape everywhere: a connection is a detour, and the
 * page someone was on should still be there when they come back.
 *
 * A full navigation of *some* window is unavoidable — the endpoint redirects to
 * linkedin.com and the consent screen has to render in an address bar. That is
 * also why the app's own token rides in the query string: a navigation cannot
 * carry an `Authorization` header. The server verifies it, mints a signed state
 * token, and redirects away immediately.
 *
 * @param onConnected Runs after a successful connection, to refresh whatever
 *                    the calling page shows.
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export function useLinkedInConnect(onConnected?: () => void) {
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
      if (e.data?.source !== "quantalog-linkedin") return;

      setConnecting(false);
      if (e.data.status === "connected") {
        notify.success("LinkedIn connected");
        done.current?.();
      } else if (e.data.status === "cancelled") {
        notify.info("LinkedIn connection cancelled");
      } else {
        notify.error("Could not connect LinkedIn. Please try again.");
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const connect = useCallback(() => {
    const token = getToken() ?? "";
    const url = `${API_BASE}/api/auth/linkedin?token=${encodeURIComponent(token)}`;

    setConnecting(true);
    const popup = window.open(url, "linkedin-oauth", "width=600,height=720,menubar=no,toolbar=no");

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
  }, []);

  return { connect, connecting };
}
