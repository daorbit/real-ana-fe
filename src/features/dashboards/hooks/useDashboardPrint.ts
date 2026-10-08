import { useCallback, useEffect, useRef, useState } from "react";

const ATTR = "data-printing";
const SETTLE_MS = 350;

export function useDashboardPrint() {
  const [printing, setPrinting] = useState(false);
  const timer = useRef(0);

  const stop = useCallback(() => {
    window.clearTimeout(timer.current);
    document.documentElement.removeAttribute(ATTR);
    setPrinting(false);
  }, []);

  const start = useCallback(() => {
    document.documentElement.setAttribute(ATTR, "dashboard");
    setPrinting(true);
  }, []);

  const onReady = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => window.print(), SETTLE_MS);
  }, []);

  useEffect(() => {
    if (!printing) return;
    window.addEventListener("afterprint", stop);
    return () => window.removeEventListener("afterprint", stop);
  }, [printing, stop]);

  useEffect(() => stop, [stop]);

  return { printing, start, onReady };
}
