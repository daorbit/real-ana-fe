import { useMemo, type ReactNode } from "react";
import type { AuditEntry } from "@/shared/types";
import { groupByDay } from "../lib/groupByDay";
import { AuditRow } from "./AuditRow";
import classes from "./AuditLog.module.css";

export function AuditTimeline({
  entries,
  selectedId,
  footer,
  endNote,
  onSelect,
}: {
  entries: AuditEntry[];
  selectedId?: string | null;
  footer?: ReactNode;
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
                <AuditRow
                  key={entry.id}
                  entry={entry}
                  perspective="team"
                  selected={entry.id === selectedId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {footer}
      {endNote && <p className={classes.end}>{endNote}</p>}
    </>
  );
}
