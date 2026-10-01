import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { num } from "@/shared/lib";
import classes from "./addons/Addons.module.css";

export function CreditBalance({
  icon: Icon,
  label,
  planLeft,
  addonCredits,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  planLeft: number;
  addonCredits: number;
}) {
  const { t } = useTranslation();
  const total = planLeft + addonCredits;

  return (
    <div className={classes.balance} data-empty={total === 0 || undefined}>
      <div className={classes.balanceHead}>
        <span className={classes.balanceIcon}>
          <Icon size={14} />
        </span>
        <span className={classes.balanceLabel}>{label}</span>
        {total === 0 && <span className={classes.outPill}>{t("billing.out")}</span>}
      </div>

      <span className={classes.balanceValue}>{num(total)}</span>

      <div className={classes.split} aria-hidden style={{ "--plan": planLeft, "--bought": addonCredits } as CSSProperties}>
        {planLeft > 0 && <span className={classes.splitPlan} />}
        {addonCredits > 0 && <span className={classes.splitBought} />}
      </div>

      <div className={classes.legend}>
        <span className={classes.legendItem}>
          <span className={classes.legendDot} />
          {t("billing.creditsFromPlan", { planLeft: num(planLeft) })}
        </span>
        {addonCredits > 0 && (
          <span className={classes.legendItem}>
            <span className={classes.legendDot} data-bought />
            {t("billing.creditsBoughtOnly", { defaultValue: "{{n}} bought", n: num(addonCredits) })}
          </span>
        )}
      </div>
    </div>
  );
}
