import { useTranslation } from "react-i18next";
import { num } from "@/shared/lib";
import type { referralTotals } from "../lib/rewards";
import classes from "./Referrals.module.css";

export function ReferralStats({ totals }: { totals: ReturnType<typeof referralTotals> }) {
  const { t } = useTranslation();

  const stats = [
    { label: t("referrals.statJoined", "Joined with your link"), value: totals.joined },
    { label: t("referrals.statRewards", "Coupons earned"), value: totals.earned },
    { label: t("referrals.statUnused", "Ready to use"), value: totals.ready, highlight: totals.ready > 0 },
    { label: t("referrals.statUsed", "Used"), value: totals.used },
  ];

  return (
    <div className={classes.stats}>
      {stats.map((s) => (
        <div key={s.label} className={classes.stat}>
          <span className={classes.statLabel}>{s.label}</span>
          <span className={classes.statValue} data-highlight={s.highlight || undefined}>{num(s.value)}</span>
        </div>
      ))}
    </div>
  );
}
