import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { num, timeAgo } from "@/shared/lib/format";
import type { AuditSummary, WorkspaceAuditPage } from "@/shared/types";
import classes from "./AuditOverview.module.css";

function windowLabel(days: number) {
  if (days >= 365) return "1 year";
  if (days === 1) return "1 day";
  return `${days} days`;
}

function Stat({ label, value, note }: { label: string; value: ReactNode; note: ReactNode }) {
  return (
    <div className={classes.stat}>
      <span className={classes.statLabel}>{label}</span>
      <span className={classes.statValue}>{value}</span>
      <span className={classes.statNote}>{note}</span>
    </div>
  );
}

export function AuditOverview({
  summary,
  retention,
}: {
  summary: AuditSummary;
  retention: WorkspaceAuditPage["retention"];
}) {
  return (
    <section className={classes.card} aria-label="Summary">
      <Stat
        label="Changes"
        value={num(summary.total)}
        note={retention.days >= 365 ? "In the last year" : `In the last ${windowLabel(retention.days)}`}
      />
      <Stat
        label="People"
        value={num(summary.people)}
        note={summary.people === 0 ? "No one yet" : summary.people === 1 ? "Made a change" : "Made changes"}
      />
      <Stat
        label="Last change"
        value={summary.lastAt ? timeAgo(summary.lastAt) : "—"}
        note={summary.lastAt ? "Most recent entry" : "Nothing recorded yet"}
      />
      <Stat
        label="History kept"
        value={windowLabel(retention.days)}
        note={
          retention.upgradable ? (
            <Link to="/app/billing/plans" className={classes.upgrade}>
              Keep longer
            </Link>
          ) : (
            `On the ${retention.plan} plan`
          )
        }
      />
    </section>
  );
}
