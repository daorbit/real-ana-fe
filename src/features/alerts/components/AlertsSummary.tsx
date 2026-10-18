import { Anchor } from "@mantine/core";
import { Link } from "react-router-dom";
import { timeAgo } from "@/shared/lib/format";
import { checkCadence } from "@/features/alerts/lib/alertMeta";
import type { AlertsOverview } from "@/features/alerts/types";
import classes from "@/features/alerts/components/Alerts.module.css";

function nextCheckLabel(next: string | null): string {
  if (!next) return "Paused";
  const minutes = Math.round((new Date(next).getTime() - Date.now()) / 60000);
  if (minutes <= 1) return "Within minutes";
  if (minutes < 60) return `In ${minutes} min`;
  return `In ${Math.round(minutes / 60)} h`;
}

export function AlertsSummary({ overview }: { overview: AlertsOverview }) {
  const ongoing = overview.ongoing > 0;
  return (
    <section className={classes.summary}>
      <div className={classes.summaryItem}>
        <span className={classes.summaryLabel}>Status</span>
        <span className={classes.summaryValue}>
          <span className={classes.pulse} data-state={ongoing ? "ongoing" : "clear"} />
          {ongoing ? `${overview.ongoing} ongoing ${overview.ongoing === 1 ? "alert" : "alerts"}` : "All clear"}
        </span>
      </div>
      <div className={classes.summaryItem}>
        <span className={classes.summaryLabel}>Checks</span>
        <span className={classes.summaryValue}>{checkCadence(overview.checkEveryHours)}</span>
      </div>
      <div className={classes.summaryItem}>
        <span className={classes.summaryLabel}>Last check</span>
        <span className={classes.summaryValue}>{overview.lastCheckedAt ? timeAgo(overview.lastCheckedAt) : "Not yet"}</span>
      </div>
      <div className={classes.summaryItem}>
        <span className={classes.summaryLabel}>Next check</span>
        <span className={classes.summaryValue}>{nextCheckLabel(overview.nextCheckAt)}</span>
      </div>
      {overview.checkEveryHours > 1 && (
        <span className={classes.summaryAside}>
          Hourly checks come with Starter and Pro.{" "}
          <Anchor component={Link} to="/app/billing/plans" size="xs">
            Compare plans
          </Anchor>
        </span>
      )}
    </section>
  );
}
