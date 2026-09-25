import type { ReactNode } from "react";
import { Box } from "@mantine/core";
import { Link } from "react-router-dom";
import { Activity, ArrowUpRight, CreditCard, Globe, Sparkles, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { compact, shortDate } from "@/shared/lib/format";
import type { Workspace } from "@/shared/types";
import classes from "./Workspaces.module.css";

/** How full a meter is, as a tone: calm until it's worth noticing. */
const toneFor = (pct: number) => (pct >= 90 ? "danger" : pct >= 75 ? "warn" : "ok");

/** One usage tile: an icon, a figure against its allowance, and a meter. */
function Meter({
  icon: Icon,
  label,
  value,
  total,
  used,
  quota,
  foot,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  total?: ReactNode;
  used?: number;
  quota?: number;
  foot?: ReactNode;
}) {
  const pct = used !== undefined && quota ? Math.min(100, (used / quota) * 100) : null;
  const tone = pct === null ? undefined : toneFor(pct);

  return (
    <Box className={classes.tile} data-tone={tone}>
      <div className={classes.tileHead}>
        <span className={classes.tileIcon}>
          <Icon size={15} />
        </span>
        <span className={classes.tileLabel}>{label}</span>
      </div>
      <div className={classes.tileValue}>
        {value}
        {total !== undefined && <span className={classes.tileTotal}> / {total}</span>}
      </div>
      {pct !== null && (
        <div
          className={classes.meter}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          aria-label={label}
        >
          <span style={{ width: `${Math.max(pct, 2)}%` }} />
        </div>
      )}
      {(foot || pct !== null) && (
        <div className={classes.tileFoot}>
          <span>{foot}</span>
          {pct !== null && <span className={classes.tilePct}>{Math.round(pct)}%</span>}
        </div>
      )}
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
  const expired = billing.status === "expired";

  const left = (used: number, quota: number) =>
    used >= quota
      ? t("workspaces.limitReached", "Limit reached")
      : t("workspaces.left", { n: compact(quota - used), defaultValue: "{{n}} left" });

  const planFoot = expired
    ? t("workspaces.planExpired", "Expired — renew to keep collecting")
    : billing.currentPeriodEnd
      ? t("workspaces.planRenews", { date: shortDate(billing.currentPeriodEnd), defaultValue: "Renews {{date}}" })
      : t("workspaces.planNoRenewal", "No renewal date");

  return (
    <Box className={classes.tiles}>
      <Meter
        icon={Globe}
        label={t("workspaces.statSites")}
        value={siteCount}
        total={siteQuota}
        used={siteCount}
        quota={siteQuota}
        foot={left(siteCount, siteQuota)}
      />
      <Meter
        icon={Activity}
        label={t("workspaces.statEvents", "Events this cycle")}
        value={compact(billing.events.used)}
        total={compact(billing.events.planQuota)}
        used={billing.events.used}
        quota={billing.events.planQuota}
        foot={left(billing.events.used, billing.events.planQuota)}
      />
      <Meter
        icon={Sparkles}
        label={t("workspaces.statOrbit", "Orbit AI questions")}
        value={orbit ? compact(orbit.used) : "—"}
        total={orbit ? compact(orbitQuota) : undefined}
        used={orbit?.used}
        quota={orbit ? orbitQuota : undefined}
        foot={orbit ? left(orbit.used, orbitQuota) : t("workspaces.orbitNone", "Not included in this plan")}
      />

      <Box className={`${classes.tile} ${classes.planTile}`} data-tone={expired ? "danger" : undefined}>
        <div className={classes.tileHead}>
          <span className={classes.tileIcon}>
            <CreditCard size={15} />
          </span>
          <span className={classes.tileLabel}>{t("workspaces.statPlan", "Plan")}</span>
        </div>
        <div className={classes.tileValue}>{billing.plan.name}</div>
        <div className={classes.tileFoot}>{planFoot}</div>
        <Link to="/app/billing" className={classes.planLink}>
          {t("workspaces.managePlan", "Manage plan")}
          <ArrowUpRight size={13} />
        </Link>
      </Box>
    </Box>
  );
}
