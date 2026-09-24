import { useCallback, useEffect, useRef, type RefObject } from "react";
import { useActivityPanel } from "@/features/activity/ActivityPanelContext";
import { LEAD_FORMS_BASE } from "./themeParams";

const COUNT = "quantalog:unread-count";
const COUNT_REQUEST = "quantalog:unread-count-request";

export function useFrameUnreadCount(frameRef: RefObject<HTMLIFrameElement | null>) {
  const { count } = useActivityPanel();
  const latest = useRef(count);
  latest.current = count;

  const send = useCallback(
    (target?: Window | null) => {
      const frame = target ?? frameRef.current?.contentWindow;
      frame?.postMessage({ type: COUNT, count: latest.current }, LEAD_FORMS_BASE);
    },
    [frameRef],
  );

  useEffect(() => {
    send();
  }, [count, send]);

  useEffect(() => {
    const formsOrigin = new URL(LEAD_FORMS_BASE, window.location.href).origin;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== formsOrigin) return;
      if ((event.data as { type?: unknown } | null)?.type !== COUNT_REQUEST) return;
      send(event.source as Window | null);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [send]);

  return send;
}
