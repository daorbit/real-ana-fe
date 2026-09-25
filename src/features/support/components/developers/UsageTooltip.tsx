import { useTranslation } from "react-i18next";
import { num } from "@/shared/lib/format";
import type { UsagePoint } from "../../hooks/useKeyUsage";
import { successRate } from "../../developers";
import classes from "./Developers.module.css";

interface Props {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: UsagePoint }>;
}

export function UsageTooltip({ active, payload }: Props) {
  const { t } = useTranslation();
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  return (
    <div className={classes.tooltip}>
      <div className={classes.tooltipDate}>{point.label}</div>
      <div className={classes.tooltipRow}>
        <span className={classes.legendDot} data-series="successful" />
        <span className={classes.tooltipLabel}>{t("developers.chartSuccessful")}</span>
        <span className={classes.tooltipValue}>{num(point.successful)}</span>
      </div>
      <div className={classes.tooltipRow}>
        <span className={classes.legendDot} data-series="failed" />
        <span className={classes.tooltipLabel}>{t("developers.chartFailed")}</span>
        <span className={classes.tooltipValue}>{num(point.failures)}</span>
      </div>
      <div className={classes.tooltipFoot}>
        <span>{t("developers.statSuccessRate")}</span>
        <span className={classes.tooltipValue}>{successRate(point.requests, point.failures)}</span>
      </div>
    </div>
  );
}
