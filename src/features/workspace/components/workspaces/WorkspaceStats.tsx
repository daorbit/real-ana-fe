import type { ReactNode } from "react";
import { Box, Progress } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { compact, shortDate } from "@/shared/lib/format";
import type { Workspace } from "@/shared/types";
import classes from "./Workspaces.module.css";

function Stat({
  label,
  value,
  total,
  used,
  quota,
  foot,
}: {
  label: string;
  value: ReactNode;
  total?: ReactNode;
  used?: number;
  quota?: number;
  foot?: ReactNode;
}) {
  const pct = used !== undefined && quota ? Math.min(100, (used / quota) * 100) : null;
  return (
    <Box className={classes.stat}>
      <span className={classes.statLabel}>{label}</span>
      <div className={classes.statValue}>
        {value}
        {total !== undefined && <span className={classes.statTotal}> / {total}</span>}
      </div>
      {pct !== null && (
        <Progress
          value={pct}
          size={4}
          radius="xl"
          color={pct >= 90 ? "red" : pct >= 75 ? "yellow" : "gray"}
          className={classes.statBar}
        />
      )}
      {foot && <div className={classes.statFoot}>{foot}</div>}
    </Box>
  );
}

export function WorkspaceStats({ workspace, siteCount }: { workspace: Workspace; siteCount: number }) {
  const { t } = useTranslation();
  const billing = workspace.billing;
  if (!billing) return null;

  const siteQuota = billing.sites.quota + (billing.sites.addonSlots ?? 0);
  const orbit = billing.orbit;
  const orbitQuota = orbit ? orbit.planQuota + orbit.addonCredits : 0;

  const planFoot =
    billing.status === "expired"
      ? t("workspaces.planExpired", "Expired — renew to keep collecting")
      : billing.currentPeriodEnd
        ? t("workspaces.planRenews", { date: shortDate(billing.currentPeriodEnd), defaultValue: "Renews {{date}}" })
        : t("workspaces.planNoRenewal", "No renewal date");

  return (
    <Box className={`${classes.card} ${classes.stats}`}>
      <Stat label={t("workspaces.statSites")} value={siteCount} total={siteQuota} used={siteCount} quota={siteQuota} />
      <Stat
        label={t("workspaces.statEvents", "Events this cycle")}
        value={compact(billing.events.used)}
        total={compact(billing.events.planQuota)}
        used={billing.events.used}
        quota={billing.events.planQuota}
      />
      <Stat
        label={t("workspaces.statOrbit", "Orbit AI questions")}
        value={orbit ? compact(orbit.used) : "—"}
        total={orbit ? compact(orbitQuota) : undefined}
        used={orbit?.used}
        quota={orbit ? orbitQuota : undefined}
        foot={orbit ? undefined : t("workspaces.orbitNone", "Not included in this plan")}
      />
      <Stat label={t("workspaces.statPlan", "Plan")} value={billing.plan.name} foot={planFoot} />
    </Box>
  );
}
