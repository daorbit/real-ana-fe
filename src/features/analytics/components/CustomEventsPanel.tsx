import { Inbox } from "lucide-react";
import { compact } from "@/shared/lib";
import { RankCard, RankEmpty } from "@/shared/ui/rank/RankCard";
import type { EventBucket } from "@/shared/types";
import { formatMoney } from "./conversion/formatMoney";
import classes from "./conversion/Conversion.module.css";
import table from "./table/AnalyticsTable.module.css";

export function CustomEventsPanel({
  items,
  onSelect,
}: {
  items: EventBucket[];
  onSelect?: (key: string) => void;
}) {
  return (
    <RankCard
      title="Custom events"
      tone="violet"
      subtitle={onSelect ? "Click an event to filter the report by it" : "Events, visitors and conversion rate per event"}
    >
      {items.length === 0 ? (
        <RankEmpty icon={Inbox}>
          No custom events yet. Fire one from your site to track signups, purchases or any action that matters.
          <code className={classes.snippet}>{`rta.track("signup", { plan: "pro" });`}</code>
        </RankEmpty>
      ) : (
        <div className={table.scroll}>
          <div className={table.table} data-kind="events" role="table" aria-label="Custom events">
            <div className={table.head} role="row">
              <span role="columnheader">Event</span>
              <span role="columnheader">Events</span>
              <span role="columnheader">Visitors</span>
              <span role="columnheader">Conv.</span>
              <span role="columnheader">Revenue</span>
            </div>
            {items.map((i) => (
              <button
                key={i.key}
                type="button"
                role="row"
                className={table.row}
                title={onSelect ? `Filter by ${i.key}` : i.key}
                onClick={onSelect ? () => onSelect(i.key) : undefined}
                disabled={!onSelect}
              >
                <span role="cell" className={table.mono}>{i.key}</span>
                <span role="cell" className={table.strong}>{compact(i.count)}</span>
                <span role="cell" className={table.muted}>{compact(i.visitors)}</span>
                <span role="cell" className={table.muted}>{i.conversionRate}%</span>
                <span role="cell" className={i.revenue > 0 ? table.money : table.muted}>
                  {i.revenue > 0 ? formatMoney(i.revenue) : "—"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </RankCard>
  );
}
