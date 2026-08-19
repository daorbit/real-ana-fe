import { useEffect, useRef } from "react";

/**
 * Measures a sticky page header and publishes its height as `--page-header-h`.
 *
 * Anything that sticks *below* the header has to know how tall it is, and that
 * height is not a constant: the header wraps to two rows on a narrow window,
 * grows a quota line when the plan is nearly full, and changes with the user's
 * font-size setting. A hardcoded offset is right at one width and wrong at
 * every other, which shows up as the tab bar sliding under the title or
 * floating below it with a gap.
 *
 * The variable is set on the scroll container rather than on `:root` so two
 * panels on screen at once cannot overwrite each other's value.
 */
export function useStickyHeaderHeight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // The panel that scrolls, which is where the sticky offsets are resolved.
    const target = el.closest<HTMLElement>(".app-panel__scroll") ?? el.parentElement;
    if (!target) return;

    const observer = new ResizeObserver(([entry]) => {
      target.style.setProperty("--page-header-h", `${Math.round(entry.contentRect.height)}px`);
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      target.style.removeProperty("--page-header-h");
    };
  }, []);

  return ref;
}
