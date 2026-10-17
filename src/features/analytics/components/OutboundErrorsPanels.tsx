import { ExternalLink, Download, AlertTriangle } from "lucide-react";
import { num, timeAgo } from "@/shared/lib";
import { RankCard, RankEmpty } from "@/shared/ui/rank/RankCard";
import { RankList } from "@/shared/ui/rank/RankList";
import type { OutboundBucket, ErrorBucket } from "@/shared/types";

function hostOf(url: string) {
  try {
    const { host, pathname, search } = new URL(url);
    return { host: host.replace(/^www\./, ""), rest: `${pathname}${search}` };
  } catch {
    return { host: url, rest: "" };
  }
}

export function OutboundPanel({ items }: { items: OutboundBucket[] }) {
  const total = items.reduce((sum, i) => sum + i.count, 0);

  return (
    <RankCard
      title="Outbound & downloads"
      icon={ExternalLink}
      tone="cyan"
      subtitle={items.length > 0 ? `${num(total)} exits` : undefined}
    >
      {items.length === 0 ? (
        <RankEmpty icon={ExternalLink}>No outbound clicks or downloads yet</RankEmpty>
      ) : (
        <RankList
          items={items.map((i) => {
            const { host, rest } = hostOf(i.key);
            return {
              id: i.kind + i.key,
              leading: i.kind === "download" ? <Download size={14} /> : <ExternalLink size={14} />,
              label: host || "(unknown)",
              title: i.key,
              weight: i.count,
              meta: rest && rest !== "/" ? rest : i.kind === "download" ? "Download" : undefined,
              value: num(i.count),
            };
          })}
        />
      )}
    </RankCard>
  );
}

export function ErrorsPanel({ items }: { items: ErrorBucket[] }) {

  return (
    <RankCard title="JavaScript errors" icon={AlertTriangle} tone="rose">
      {items.length === 0 ? (
        <RankEmpty icon={AlertTriangle}>No errors reported — all clear</RankEmpty>
      ) : (
        <RankList
          showRank={false}
          items={items.map((i, idx) => ({
            id: `${idx}-${i.key}`,
            label: i.key || "(unknown error)",
            title: i.lastSeen ? `${i.key}\nLast seen ${new Date(i.lastSeen).toLocaleString()}` : i.key,
            meta: [i.path, i.lastSeen ? timeAgo(i.lastSeen) : null].filter(Boolean).join(" · "),
            value: num(i.count),
          }))}
        />
      )}
    </RankCard>
  );
}
