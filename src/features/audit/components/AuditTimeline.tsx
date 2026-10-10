import { useMemo } from "react";
import { Button } from "@mantine/core";
import type { AuditEntry } from "@/shared/types";
import { groupByDay } from "../lib/groupByDay";
import { AuditRow } from "./AuditRow";
import classes from "./AuditLog.module.css";

export function AuditTimeline({
  entries,
  hasMore,
  loadingMore,
  onLoadMore,
  endNote,
  onSelect,
}: {
  entries: AuditEntry[];
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  endNote?: string;
  onSelect: (entry: AuditEntry) => void;
}) {
  const days = useMemo(() => groupByDay(entries), [entries]);

  return (
    <>
      <div className={classes.days}>
        {days.map((day) => (
          <section key={day.key}>
            <h2 className={classes.dayLabel}>{day.label}</h2>
            <div className={classes.list}>
              {day.entries.map((entry) => (
                <AuditRow key={entry.id} entry={entry} perspective="team" onSelect={onSelect} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {hasMore ? (
        <div className={classes.more}>
          <Button variant="default" radius="md" size="sm" loading={loadingMore} onClick={onLoadMore}>
            Load older activity
          </Button>
        </div>
      ) : (
        endNote && <p className={classes.end}>{endNote}</p>
      )}
    </>
  );
}
