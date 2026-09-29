import { flushSync } from "react-dom";
import { prefetchRoute } from "@/app/routePrefetch";

export type TransitionKind = "page" | "orbit";

type ActiveTransition = { finished: Promise<void>; skipTransition?: () => void };

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void> | void) => ActiveTransition;
};

const SAFETY_MS = 1500;

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
let active: ActiveTransition | null = null;

export function transitionTo(navigate: (to: string) => void, to: string, kind: TransitionKind = "page") {
  const doc = document as ViewTransitionDocument;
  const samePage = window.location.pathname === to.split(/[?#]/)[0];

  if (kind !== "orbit" || !doc.startViewTransition || motionReduced() || samePage || inFlight) {
    active?.skipTransition?.();
    void prefetchRoute(to);
    navigate(to);
    return;
  }

  inFlight = true;
  const root = document.documentElement;

  let safety = 0;
  const done = () => {
    window.clearTimeout(safety);
    delete root.dataset.vt;
    inFlight = false;
    active = null;
  };

  void prefetchRoute(to).finally(() => {
    root.dataset.vt = kind;
    try {
      const transition = doc.startViewTransition!(() => {
        flushSync(() => navigate(to));
      });
      active = transition;
      safety = window.setTimeout(() => transition.skipTransition?.(), SAFETY_MS);
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
