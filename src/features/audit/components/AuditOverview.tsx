import type { ReactNode } from "react";
import { Clock3, History, ListChecks, UsersRound, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { num, timeAgo } from "@/shared/lib/format";
import type { AuditSummary, WorkspaceAuditPage } from "@/shared/types";
import classes from "./AuditOverview.module.css";

function windowLabel(days: number) {
  if (days >= 365) return "1 year";
  if (days === 1) return "1 day";
  return `${days} days`;
}

function Stat({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  note: ReactNode;
}) {
  return (
    <div className={classes.stat}>
      <span className={classes.statIcon}>
        <Icon size={16} />
      </span>
      <div className={classes.statText}>
        <span className={classes.statLabel}>{label}</span>
        <span className={classes.statValue}>{value}</span>
        <span className={classes.statNote}>{note}</span>
      </div>
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
    <section className={`${classes.card} tone-tile`} data-tone="violet">
      <Stat
        icon={ListChecks}
        label="Changes"
        value={num(summary.total)}
        note={`In the last ${windowLabel(retention.days)}`}
      />
      <Stat
        icon={UsersRound}
        label="People"
        value={num(summary.people)}
        note={summary.people === 0 ? "No one yet" : summary.people === 1 ? "Made a change" : "Made changes"}
      />
      <Stat
        icon={Clock3}
        label="Last change"
        value={summary.lastAt ? timeAgo(summary.lastAt) : "—"}
        note={summary.lastAt ? "Most recent entry" : "Nothing recorded yet"}
      />
      <Stat
        icon={History}
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
