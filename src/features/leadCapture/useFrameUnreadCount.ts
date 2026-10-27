import { useCallback, useEffect, useRef, type RefObject } from "react";
import { useActivityPanel } from "@/features/activity/ActivityPanelContext";
import { LEAD_FORMS_BASE } from "./themeParams";

const COUNT = "quantalog:unread-count";
const COUNT_REQUEST = "quantalog:unread-count-request";

export function useFrameUnreadCount(
  frameRef: RefObject<HTMLIFrameElement | null>,
  frameBase: string = LEAD_FORMS_BASE,
) {
  const { count } = useActivityPanel();
  const latest = useRef(count);
  latest.current = count;

  const send = useCallback(
    (target?: Window | null) => {
      const frame = target ?? frameRef.current?.contentWindow;
      frame?.postMessage({ type: COUNT, count: latest.current }, frameBase);
    },
    [frameRef, frameBase],
  );

  useEffect(() => {
    send();
  }, [count, send]);

  useEffect(() => {
    const frameOrigin = new URL(frameBase, window.location.href).origin;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== frameOrigin) return;
      if ((event.data as { type?: unknown } | null)?.type !== COUNT_REQUEST) return;
      send(event.source as Window | null);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [send, frameBase]);

  return send;
}
