import { useCallback, useEffect, useRef, useState } from "react";
import { notify } from "@/shared/lib/notify";

export type OAuthPopupOptions = {
  source: string;
  buildUrl: () => string | null;
  reasonText: Record<string, string>;
  successMessage: string;
  cancelledMessage: string;
  fallbackError: string;
  onDone?: () => void;
};

export function useOAuthPopup(options: OAuthPopupOptions) {
  const [connecting, setConnecting] = useState(false);
  const timer = useRef<number | null>(null);
  const latest = useRef(options);
  latest.current = options;

  useEffect(() => {
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const opts = latest.current;
      if (e.data?.source !== opts.source) return;

      setConnecting(false);
      if (e.data.status === "connected") {
        notify.success(opts.successMessage);
        opts.onDone?.();
      } else if (e.data.reason === "denied") {
        notify.info(opts.cancelledMessage);
      } else {
        notify.error(opts.reasonText[e.data.reason] ?? opts.fallbackError);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const connect = useCallback(() => {
    const url = latest.current.buildUrl();
    if (!url) return;

    setConnecting(true);
    const popup = window.open(url, "google-oauth", "width=600,height=720,menubar=no,toolbar=no");

    if (!popup) {
      setConnecting(false);
      window.location.href = url;
      return;
    }

    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      if (!popup.closed) return;
      window.clearInterval(timer.current!);
      timer.current = null;
      setConnecting(false);
      latest.current.onDone?.();
    }, 700);
  }, []);

  return { connect, connecting };
}
