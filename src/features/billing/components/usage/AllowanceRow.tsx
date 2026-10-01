import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { num } from "@/shared/lib";
import { meterState, usageShare } from "../../lib/usageMonth";
import { formatAllowance, type UsageMeterData } from "../../lib/usageMeters";
import classes from "./UsageOverview.module.css";

function percentLabel(used: number, share: number): string {
  if (used > 0 && share < 1) return "<1%";
  return `${Math.round(share)}%`;
}

export function AllowanceRow({ meter }: { meter: UsageMeterData }) {
  const { t } = useTranslation();
  const Icon = meter.icon;
  const total = meter.quota + meter.credits;
  const share = usageShare(meter.used, total);
  const state = meterState(share);
  const visibleShare = meter.used > 0 ? Math.max(share, 1.5) : 0;
  const planMark = meter.credits > 0 && total > 0 ? (meter.quota / total) * 100 : null;
  const left = Math.max(0, total - meter.used);

  const detail =
    state === "over"
      ? t("billing.limitReached", "Limit reached")
      : meter.credits > 0
        ? t("billing.planPlusAddon", { quota: num(meter.quota), credits: num(meter.credits) })
        : t("billing.meterLeft", { defaultValue: "{{n}} left", n: num(left) });

  return (
    <li className={classes.allowance} data-state={state}>
      <span className={classes.allowanceIcon}>
        <Icon size={16} />
      </span>

      <div className={classes.allowanceText}>
        <span className={classes.allowanceLabel}>{meter.label}</span>
        <span className={classes.allowanceDetail}>{detail}</span>
      </div>

      <div className={classes.allowanceValue}>
        <span className={classes.allowanceUsed}>
          {num(meter.used)}
          <span className={classes.allowanceTotal}> / {formatAllowance(total)}</span>
        </span>
        <span className={classes.allowancePct}>{percentLabel(meter.used, share)}</span>
      </div>

      <div
        className={classes.allowanceTrack}
        role="progressbar"
        aria-label={meter.label}
        aria-valuenow={Math.round(share)}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ "--share": `${visibleShare}%`, "--mark": `${planMark ?? 0}%` } as CSSProperties}
      >
        <span className={classes.meterFill} data-state={state} />
        {planMark !== null && <span className={classes.allowanceMark} />}
      </div>
    </li>
  );
}
