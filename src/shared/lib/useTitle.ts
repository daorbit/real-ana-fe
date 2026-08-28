import { useEffect } from "react";

const SUFFIX = "Quantalog";

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
    const prev = document.title;
    document.title = name ? `${name} · ${SUFFIX}` : SUFFIX;
    return () => {
      document.title = prev;
    };
  }, [name]);
}
