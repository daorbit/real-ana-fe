import { useEffect } from "react";
import { TITLE_SUFFIX, getTitleBase, setTitleBase } from "@/shared/lib/tabTitle";

/**
 * Sets the browser tab title for the page that mounts this, and restores the
 * previous title on unmount.
 *
 * The tab said "Quantalog" on every screen, so a window full of them was
 * unnavigable. Pass the page's own name — "Analytics", "Settings" — and it
 * becomes "Analytics · Quantalog". Pass nothing to just show the bare suffix.
 */
export function useTitle(name?: string) {
  useEffect(() => {
    const prev = getTitleBase();
    setTitleBase(name ? `${name} · ${TITLE_SUFFIX}` : TITLE_SUFFIX);
    return () => {
      setTitleBase(prev);
    };
  }, [name]);
}
