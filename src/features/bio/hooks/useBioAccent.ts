import { useEffect, type RefObject } from "react";
import { contrastOn } from "@/shared/lib/theme";

export function useBioAccent(ref: RefObject<HTMLElement | null>, accent: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--bio-accent", accent);
    el.style.setProperty("--bio-accent-fg", contrastOn(accent));
    return () => {
      el.style.removeProperty("--bio-accent");
      el.style.removeProperty("--bio-accent-fg");
    };
  }, [ref, accent]);
}
