import { useMemo, useState } from "react";
import { Anchor, Select } from "@mantine/core";
import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { RULE_META, RULE_ORDER } from "@/features/alerts/lib/alertMeta";
import { clockTime, groupByDay } from "@/features/alerts/lib/alertTime";
import type { AlertHistoryItem, AlertRule } from "@/features/alerts/types";
import classes from "@/features/alerts/components/Alerts.module.css";

const ALL = "all";

export function AlertTimeline({ history }: { history: AlertHistoryItem[] }) {
  const [filter, setFilter] = useState<string>(ALL);

  const options = useMemo(() => {
    const present = new Set(history.map((h) => h.rule));
    return [
      { value: ALL, label: "All alerts" },
      ...RULE_ORDER.filter((rule) => present.has(rule)).map((rule) => ({ value: rule, label: RULE_META[rule].title })),
    ];
  }, [history]);

  const groups = useMemo(
    () => groupByDay(filter === ALL ? history : history.filter((h) => h.rule === (filter as AlertRule))),
    [history, filter],
  );

  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div>
          <h3 className={classes.cardTitle}>Timeline</h3>
          <div className={classes.cardSub}>Everything that fired in the last 90 days.</div>
        </div>
        {history.length > 0 && (
          <Select size="xs" w={150} data={options} value={filter} allowDeselect={false} onChange={(v) => setFilter(v ?? ALL)} aria-label="Filter alerts" />
        )}
      </div>
      {groups.length === 0 ? (
        <div className={classes.empty}>
          <span className={classes.emptyIcon}>
            <ShieldCheck size={18} />
          </span>
          No alerts yet. That is a good thing.
        </div>
      ) : (
        <div className={classes.timeline}>
          {groups.map((group) => (
            <div key={group.label}>
              <div className={classes.dayLabel}>{group.label}</div>
              {group.items.map((item) => {
                const meta = RULE_META[item.rule];
                const Icon = meta.icon;
                return (
                  <div key={item.id} className={classes.event}>
                    <span className={classes.icon} data-tone={meta.tone}>
                      <Icon size={15} />
                    </span>
                    <div>
                      <div className={classes.eventTitle}>{item.title}</div>
                      <div className={classes.eventSummary}>{item.summary}</div>
                      <div className={classes.eventMeta}>
                        <span>{clockTime(item.createdAt)}</span>
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
          ))}
        </div>
      )}
    </section>
  );
}
