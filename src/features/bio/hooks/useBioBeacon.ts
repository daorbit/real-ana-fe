import { useCallback, useEffect, useRef } from "react";
import { bioHitUrl } from "@/features/bio/lib/bioOptions";
import { visitSource } from "@/features/bio/lib/bioSource";
import { campaignOf, firstVisitToday, referrerHost } from "@/features/bio/lib/bioVisit";

type Hit = Record<string, string | number>;

function send(slug: string, hit: Hit) {
  const url = bioHitUrl(slug);
  const body = JSON.stringify(hit);
  if (navigator.sendBeacon?.(url, new Blob([body], { type: "text/plain" }))) return;
  void fetch(url, { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => undefined);
}

export function useBioBeacon(slug: string | null) {
  const source = useRef<string | null>(null);
  const sent = useRef<string | null>(null);

  useEffect(() => {
    if (!slug || sent.current === slug) return;
    sent.current = slug;
    source.current = visitSource(window.location.search, document.referrer);
    send(slug, {
      t: "view",
      s: source.current,
      n: firstVisitToday(slug) ? 1 : 0,
      r: referrerHost(document.referrer),
      c: campaignOf(window.location.search),
    });
  }, [slug]);

  return useCallback(
    (linkId: string) => {
      if (slug) send(slug, { t: "click", s: source.current ?? "direct", l: linkId });
    },
    [slug],
  );
}
