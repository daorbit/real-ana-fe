import { useEffect, useState } from "react";
import type { ShareCardStats } from "@/features/analytics/components/shareCard";

export const PUBLIC_API_BASE = import.meta.env.VITE_API_BASE ?? "";

export function usePublicHeadline(token: string | null, enabled: boolean) {
  const [stats, setStats] = useState<ShareCardStats & { totals: boolean }>({
    visitors: 0, pageviews: 0, live: null, totals: false,
  });

  useEffect(() => {
    if (!token || !enabled) return;
    let cancelled = false;

    fetch(`${PUBLIC_API_BASE}/api/share/${token}?range=30d`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return;
        const totals = Boolean(d.panels?.totals);
        setStats({
          visitors: d.visitors ?? 0,
          pageviews: d.pageviews ?? 0,
          live: totals && d.live > 0 ? d.live : null,
          totals,
        });
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [token, enabled]);

  return stats;
}
