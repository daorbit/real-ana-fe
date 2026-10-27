import { Zap, Inbox } from "lucide-react";
import { num } from "@/shared/lib";
import { RankCard, RankEmpty } from "@/shared/ui/rank/RankCard";
import { RankList } from "@/shared/ui/rank/RankList";
import type { EventBucket } from "@/shared/types";
import { EventsSummary } from "./conversion/EventsSummary";
import { formatMoney } from "./conversion/formatMoney";
import classes from "./conversion/Conversion.module.css";

export function CustomEventsPanel({
  items,
  totalRevenue = 0,
}: {
  items: EventBucket[];
  totalRevenue?: number;
}) {
  return (
    <RankCard
      title="Custom events"
      icon={Zap}
      tone="violet"
      subtitle={items.length > 0 ? "Fires, visitors and conversion rate per event" : undefined}
    >
      {items.length === 0 ? (
        <RankEmpty icon={Inbox}>
          No custom events yet. Fire one from your site to track signups, purchases or any action that matters.
          <code className={classes.snippet}>{`rta.track("signup", { plan: "pro" });`}</code>
        </RankEmpty>
      ) : (
        <>
          <EventsSummary items={items} totalRevenue={totalRevenue} />
          <RankList
            items={items.map((i) => ({
              id: i.key,
              label: i.key,
              title: i.key,
              weight: i.count,
              meta: (
                <>
                  {num(i.visitors)} {i.visitors === 1 ? "visitor" : "visitors"}
                  {i.revenue > 0 && <span className={classes.money}>{formatMoney(i.revenue)}</span>}
                </>
              ),
              aside: <span className={classes.rate}>{i.conversionRate}% conv.</span>,
              value: num(i.count),
            }))}
          />
        </>
      )}
    </RankCard>
  );
}
