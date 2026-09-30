import { useEffect, useRef, useState } from "react";
import type { PublicEmbed } from "@/features/dashboards/types";

const BASE = import.meta.env.VITE_API_BASE ?? "";
const REFRESH_MS = 60_000;

export function usePublicEmbed(token: string | undefined, preview: boolean, version: string | null) {
  const [embed, setEmbed] = useState<PublicEmbed | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const counted = useRef(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const load = () => {
      const params = new URLSearchParams();
      if (!preview && !counted.current) params.set("count", "1");
      if (version) params.set("v", version);
      counted.current = true;
      const qs = params.toString();

      fetch(`${BASE}/api/embed/${encodeURIComponent(token)}${qs ? `?${qs}` : ""}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d: PublicEmbed | null) => {
          if (cancelled) return;
          if (!d) {
            setState("missing");
            return;
          }
          setEmbed(d);
          setState("ready");
        })
        .catch(() => {
          if (!cancelled) setState((s) => (s === "ready" ? s : "missing"));
        });
    };

    load();
    const timer = window.setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [token, preview, version]);

  return { embed, state };
}
