import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { PaneTab } from "../components/ComposerPreviewPane";

/**
 * The composer's state in the address bar.
 *
 * `?compose=new` or `?compose=<id>` opens it, `?pane=orbit` picks the right-hand
 * side. Worth the plumbing because this is a full-screen surface people link
 * each other to and reload inside — losing it on a refresh, or landing back on
 * the list after following a link, is the failure this prevents.
 *
 * Replace rather than push: the composer is one screen, and every tab switch
 * pushing history would make Back a way to cycle panes instead of leaving.
 */
export function useComposerUrl() {
  const [params, setParams] = useSearchParams();

  const compose = params.get("compose") ?? "";
  const pane = (params.get("pane") === "orbit" ? "orbit" : "preview") as PaneTab;

  const set = useCallback(
    (next: { compose?: string | null; pane?: PaneTab | null }) => {
      setParams(
        (current) => {
          const out = new URLSearchParams(current);
          for (const [key, value] of Object.entries(next)) {
            if (value === null || value === "" || value === "preview") out.delete(key);
            else out.set(key, value);
          }
          return out;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return {
    /** "new", a post id, or "" when the composer is closed. */
    compose,
    pane,
    openNew: () => set({ compose: "new", pane: null }),
    openEdit: (id: string) => set({ compose: id, pane: null }),
    close: () => set({ compose: null, pane: null }),
    setPane: (next: PaneTab) => set({ pane: next }),
  };
}
