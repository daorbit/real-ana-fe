import { useEffect, type RefObject } from "react";
import type { EmbedTheme } from "@/features/dashboards/types";

const ATTR = "data-mantine-color-scheme";

export function useEmbedTheme(theme: EmbedTheme | undefined, bodyClass: string) {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute(ATTR);
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const scheme = theme === "light" || theme === "dark" ? theme : media.matches ? "dark" : "light";
      root.setAttribute(ATTR, scheme);
    };

    apply();
    media.addEventListener("change", apply);
    document.body.classList.add(bodyClass);

    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);

    return () => {
      media.removeEventListener("change", apply);
      document.body.classList.remove(bodyClass);
      robots.remove();
      if (previous) root.setAttribute(ATTR, previous);
    };
  }, [theme, bodyClass]);
}

export function useReportHeight(ref: RefObject<HTMLElement | null>, token: string | undefined) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.parent === window) return;

    const send = () =>
      window.parent.postMessage(
        { type: "quantalog:embed-height", token, height: Math.ceil(el.getBoundingClientRect().height) },
        "*"
      );

    send();
    const observer = new ResizeObserver(send);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, token]);
}
