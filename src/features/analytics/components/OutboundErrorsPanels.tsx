import { ExternalLink, Download, AlertTriangle } from "lucide-react";
import { num, timeAgo } from "@/shared/lib";
import { RankCard, RankEmpty } from "@/shared/ui/rank/RankCard";
import { RankList } from "@/shared/ui/rank/RankList";
import type { OutboundBucket, ErrorBucket } from "@/shared/types";
import table from "./table/AnalyticsTable.module.css";

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
      title="Outbound links"
      tone="teal"
      subtitle={items.length > 0 ? `${num(total)} clicks that left your site` : "Clicks that left your site"}
    >
      {items.length === 0 ? (
        <RankEmpty icon={ExternalLink}>No outbound clicks or downloads yet</RankEmpty>
      ) : (
        <RankList
          columns={{ label: "Destination", value: "Clicks" }}
          items={items.map((i) => {
            const { host, rest } = hostOf(i.key);
            return {
              id: i.kind + i.key,
              leading: i.kind === "download" ? <Download size={14} /> : undefined,
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

const HOUR_MS = 60 * 60 * 1000;

function recency(lastSeen?: string): "recent" | "today" | undefined {
  if (!lastSeen) return undefined;
  const age = Date.now() - new Date(lastSeen).getTime();
  if (age < HOUR_MS) return "recent";
  if (age < 24 * HOUR_MS) return "today";
  return undefined;
}

export function ErrorsPanel({ items, onSelectPath }: { items: ErrorBucket[]; onSelectPath?: (path: string) => void }) {
  return (
    <RankCard title="JavaScript errors" tone="rose" subtitle="Grouped by message, newest first">
      {items.length === 0 ? (
        <RankEmpty icon={AlertTriangle}>No errors reported — all clear</RankEmpty>
      ) : (
        <div className={table.scroll}>
          <div className={table.table} data-kind="errors" role="table" aria-label="JavaScript errors">
            <div className={table.head} role="row">
              <span role="columnheader">Error</span>
              <span role="columnheader" className={table.left}>Where</span>
              <span role="columnheader">Count</span>
              <span role="columnheader">Last seen</span>
            </div>
            {items.map((i, idx) => (
              <button
                key={`${idx}-${i.key}`}
                type="button"
                role="row"
                className={table.row}
                title={i.path && onSelectPath ? `Filter by ${i.path}` : i.key}
                onClick={i.path && onSelectPath ? () => onSelectPath(i.path) : undefined}
                disabled={!i.path || !onSelectPath}
              >
                <span role="cell" className={table.message}>
                  <span className={table.dot} data-tone={recency(i.lastSeen)} aria-hidden />
                  <span className={`${table.mono} ${table.wrap}`}>{i.key || "(unknown error)"}</span>
                </span>
                <span role="cell" className={table.left}>
                  <span className={table.mono}>{i.path || "—"}</span>
                </span>
                <span role="cell" className={table.strong}>{num(i.count)}</span>
                <span role="cell" className={table.muted}>{i.lastSeen ? timeAgo(i.lastSeen) : "—"}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </RankCard>
  );
}
