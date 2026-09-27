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

const POPUP_WIDTH = 520;
const POPUP_HEIGHT = 680;

function centeredFeatures(width: number, height: number): string {
  const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
  const top = Math.round(window.screenY + (window.outerHeight - height) / 2);
  return `popup=yes,width=${width},height=${height},left=${left},top=${top}`;
}

export function useOAuthPopup(options: OAuthPopupOptions) {
  const [connecting, setConnecting] = useState(false);
  const timer = useRef<number | null>(null);
  const popupRef = useRef<Window | null>(null);
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
      if (e.data.status !== "connected") popupRef.current?.close();
      popupRef.current = null;
      if (e.data.status === "connected") {
        notify.success(opts.successMessage);
        opts.onDone?.();
      } else if (e.data.reason === "denied") {
        notify.info(opts.cancelledMessage);
      } else if (e.data.reason === "plan_required") {
        notify.quotaLimit(opts.reasonText.plan_required ?? opts.fallbackError, undefined, "plan_required");
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
    const popup = window.open(url, "google-oauth", centeredFeatures(POPUP_WIDTH, POPUP_HEIGHT));
    popupRef.current = popup;

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
      popupRef.current = null;
      setConnecting(false);
      latest.current.onDone?.();
    }, 700);
  }, []);

  const focus = useCallback(() => {
    popupRef.current?.focus();
  }, []);

  const cancel = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    popupRef.current?.close();
    popupRef.current = null;
    setConnecting(false);
  }, []);

  return { connect, connecting, focus, cancel };
}
