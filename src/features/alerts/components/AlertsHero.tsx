import { Anchor } from "@mantine/core";
import { AlertTriangle, Clock, Globe, PauseCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { timeAgo } from "@/shared/lib/format";
import { checkCadence } from "@/features/alerts/lib/alertMeta";
import { nextCheckLabel } from "@/features/alerts/lib/alertTime";
import type { AlertsOverview } from "@/features/alerts/types";
import { ActivityChart } from "@/features/alerts/components/ActivityChart";
import classes from "@/features/alerts/components/Alerts.module.css";

function heroState(overview: AlertsOverview): { state: "clear" | "ongoing" | "paused"; title: string } {
  const anyRule = Object.values(overview.config.rules).some((r) => r.enabled);
  if (!anyRule) return { state: "paused", title: "Every alert is switched off." };
  if (overview.ongoing > 0) {
    return {
      state: "ongoing",
      title: overview.ongoing === 1 ? "One thing needs a look." : `${overview.ongoing} things need a look.`,
    };
  }
  return { state: "clear", title: "All clear. Nothing needs you right now." };
}

export function AlertsHero({ overview }: { overview: AlertsOverview }) {
  const { state, title } = heroState(overview);
  const Icon = state === "ongoing" ? AlertTriangle : state === "paused" ? PauseCircle : ShieldCheck;

  return (
    <section className={classes.hero}>
      <div className={classes.heroMain}>
        <span className={classes.heroIcon} data-state={state}>
          <Icon size={24} />
        </span>
        <div>
          <div className={classes.heroEyebrow}>Quantalog Alerts</div>
          <h2 className={classes.heroTitle}>{title}</h2>
          <div className={classes.heroMeta}>
            <span className={classes.metaChip}>
              <Globe size={13} />
              Watching {overview.sitesWatched} {overview.sitesWatched === 1 ? "site" : "sites"}
            </span>
            <span className={classes.metaChip}>
              <RefreshCw size={13} />
              Checks {checkCadence(overview.checkEveryHours)}
            </span>
            <span className={classes.metaChip}>
              <Clock size={13} />
              {overview.lastCheckedAt ? `Last check ${timeAgo(overview.lastCheckedAt)}` : "First check soon"} · next{" "}
              {nextCheckLabel(overview.nextCheckAt)}
            </span>
          </div>
          {overview.checkEveryHours > 1 && (
            <div className={classes.upgrade}>
              Hourly checks come with Starter and Pro.{" "}
              <Anchor component={Link} to="/app/billing/plans" size="xs">
                Compare plans
              </Anchor>
            </div>
          )}
        </div>
      </div>
      <ActivityChart days={overview.daily} />
    </section>
  );
}
