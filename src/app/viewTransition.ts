import { flushSync } from "react-dom";
import { prefetchRoute } from "@/app/routePrefetch";

export type TransitionKind = "page" | "orbit";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void> | void) => { finished: Promise<void> };
};

const SHELL_READY_TIMEOUT_MS = 900;

function motionReduced(): boolean {
  return (
    document.documentElement.dataset.motion === "off" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function waitForShell(): Promise<void> {
  const start = performance.now();
  return new Promise((resolve) => {
    const tick = () => {
      if (document.querySelector(".app-panel__scroll") || performance.now() - start > SHELL_READY_TIMEOUT_MS) {
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

export function supportsViewTransitions(): boolean {
  return typeof (document as ViewTransitionDocument).startViewTransition === "function" && !motionReduced();
}

let inFlight = false;

export function transitionTo(navigate: (to: string) => void, to: string, kind: TransitionKind = "page") {
  const doc = document as ViewTransitionDocument;
  const samePage = window.location.pathname === to.split(/[?#]/)[0];

  if (!doc.startViewTransition || motionReduced() || samePage || inFlight) {
    navigate(to);
    return;
  }

  inFlight = true;
  const root = document.documentElement;

  const done = () => {
    delete root.dataset.vt;
    inFlight = false;
  };

  void prefetchRoute(to).then(() => {
    root.dataset.vt = kind;
    try {
      const transition = doc.startViewTransition!(async () => {
        flushSync(() => navigate(to));
        await waitForShell();
      });
      transition.finished.then(done, done);
    } catch {
      done();
      navigate(to);
    }
  });
}

export function isPlainLeftClick(e: React.MouseEvent): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
