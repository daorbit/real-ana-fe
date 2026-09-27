import { flushSync } from "react-dom";
import { prefetchRoute } from "@/app/routePrefetch";

export type TransitionKind = "page" | "orbit";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void> | void) => { finished: Promise<void> };
};

function motionReduced(): boolean {
  return (
    document.documentElement.dataset.motion === "off" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function supportsViewTransitions(): boolean {
  return typeof (document as ViewTransitionDocument).startViewTransition === "function" && !motionReduced();
}

let inFlight = false;

export function transitionTo(navigate: (to: string) => void, to: string, kind: TransitionKind = "page") {
  const doc = document as ViewTransitionDocument;
  const samePage = window.location.pathname === to.split(/[?#]/)[0];

  if (kind !== "orbit" || !doc.startViewTransition || motionReduced() || samePage || inFlight) {
    void prefetchRoute(to);
    navigate(to);
    return;
  }

  inFlight = true;
  const root = document.documentElement;

  const done = () => {
    delete root.dataset.vt;
    inFlight = false;
  };

  void prefetchRoute(to).finally(() => {
    root.dataset.vt = kind;
    try {
      const transition = doc.startViewTransition!(() => {
        flushSync(() => navigate(to));
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
