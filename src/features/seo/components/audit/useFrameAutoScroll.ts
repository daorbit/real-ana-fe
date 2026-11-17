import { useEffect, useState, type RefObject } from "react";

const SPEED_PX_PER_SEC = 90;
const BOTTOM_PAUSE_MS = 1400;
const RETURN_MS = 1200;
const READY_POLL_MS = 120;

function motionAllowed() {
  if (document.documentElement.dataset.motion === "off") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readyWindow(frame: HTMLIFrameElement | null): Window | null {
  try {
    const win = frame?.contentWindow ?? null;
    if (!win || win.location.href !== "about:srcdoc") return null;
    return win.document.readyState === "loading" ? null : win;
  } catch {
    return null;
  }
}

export function useFrameAutoScroll(frameRef: RefObject<HTMLIFrameElement | null>, srcDoc: string | undefined) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!srcDoc) return;
    setReady(false);
    let raf = 0;
    let timer = 0;

    const scroll = (win: Window) => {
      let y = 0;
      let last = performance.now();
      const step = (now: number) => {
        const max = win.document.documentElement.scrollHeight - win.innerHeight;
        y = Math.min(max, y + ((now - last) / 1000) * SPEED_PX_PER_SEC);
        last = now;
        win.scrollTo(0, y);
        if (y < max) {
          raf = requestAnimationFrame(step);
          return;
        }
        timer = window.setTimeout(() => {
          win.scrollTo({ top: 0, behavior: "smooth" });
          timer = window.setTimeout(() => {
            y = 0;
            last = performance.now();
            raf = requestAnimationFrame(step);
          }, RETURN_MS);
        }, BOTTOM_PAUSE_MS);
      };
      raf = requestAnimationFrame(step);
    };

    const poll = window.setInterval(() => {
      const win = readyWindow(frameRef.current);
      if (!win) return;
      clearInterval(poll);
      setReady(true);
      if (motionAllowed()) scroll(win);
    }, READY_POLL_MS);

    return () => {
      clearInterval(poll);
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [frameRef, srcDoc]);

  return ready;
}
