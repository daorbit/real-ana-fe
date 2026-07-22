import { useEffect } from "react";

/**
 * Warns before edits are lost.
 *
 * Covers the two ways a half-filled form disappears: closing or reloading the
 * tab (the browser's own prompt, which is the only thing that can block it),
 * and clicking a link inside the app (a confirm, since React Router navigates
 * without asking).
 *
 * Both are suppressed when `dirty` is false, so a form nobody touched never
 * asks for anything.
 */
export function useUnsavedGuard(dirty: boolean, message = "You have unsaved changes.") {
  // Tab close / reload / external navigation.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      // Browsers ignore custom text now and show their own wording, but the
      // event still has to be cancelled for the prompt to appear at all.
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // In-app navigation. Router links don't hit `beforeunload`, so intercept the
  // click before it reaches the router.
  useEffect(() => {
    if (!dirty) return;

    const onClick = (e: MouseEvent) => {
      // Let modified clicks through — they open a new tab and leave this one,
      // with its edits, exactly where it is.
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;

      const link = (e.target as HTMLElement | null)?.closest?.("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (link.target && link.target !== "_self") return;

      // Same-page links change nothing worth guarding.
      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      if (!window.confirm(`${message} Leave without saving?`)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Capture phase: the router's own click handler must not run first.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty, message]);
}
