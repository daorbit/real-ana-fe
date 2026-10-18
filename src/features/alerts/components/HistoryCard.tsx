import { Anchor } from "@mantine/core";
import { Link } from "react-router-dom";
import { timeAgo } from "@/shared/lib/format";
import { RULE_META } from "@/features/alerts/lib/alertMeta";
import type { AlertHistoryItem } from "@/features/alerts/types";
import classes from "@/features/alerts/components/Alerts.module.css";

export function HistoryCard({ history }: { history: AlertHistoryItem[] }) {
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div>
          <h3 className={classes.cardTitle}>Recent alerts</h3>
          <div className={classes.cardSub}>The last 90 days.</div>
        </div>
      </div>
      {history.length === 0 ? (
        <div className={classes.empty}>No alerts yet. That is a good thing.</div>
      ) : (
        <div className={classes.history}>
          {history.map((item) => {
            const meta = RULE_META[item.rule];
            const Icon = meta.icon;
            return (
              <div key={item.id} className={classes.event}>
                <span className={classes.icon} data-tone={meta.tone}>
                  <Icon size={16} />
                </span>
                <div className={classes.eventBody}>
                  <div className={classes.eventTitle}>{item.title}</div>
                  <div className={classes.eventSummary}>{item.summary}</div>
                  <div className={classes.eventMeta}>
                    <span>{timeAgo(item.createdAt)}</span>
                    {item.link && (
                      <Anchor component={Link} to={item.link} size="xs">
                        Open
                      </Anchor>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
