import { useEffect, type RefObject } from "react";

const VARS = [
  "--accent",
  "--violet",
  "--mantine-color-emerald-filled",
  "--mantine-color-emerald-6",
] as const;

export function usePublicAccent(ref: RefObject<HTMLElement | null>, color: string | null | undefined) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !color) return;
    VARS.forEach((name) => el.style.setProperty(name, color));
    el.style.setProperty("--accent-soft", `color-mix(in srgb, ${color} 12%, transparent)`);
    el.style.setProperty("--violet-2", color);
    return () => {
      VARS.forEach((name) => el.style.removeProperty(name));
      el.style.removeProperty("--accent-soft");
      el.style.removeProperty("--violet-2");
    };
  }, [ref, color]);
}
