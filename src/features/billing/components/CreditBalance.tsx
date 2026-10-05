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
        <Icon size={14} />
        <span className={classes.balanceLabel}>{label}</span>
        {total === 0 && <span className={classes.outPill}>{t("billing.out")}</span>}
      </div>

      <span className={classes.balanceValue}>{num(total)}</span>

      <span className={classes.balanceSub}>
        {t("billing.creditsFromPlan", { planLeft: num(planLeft) })}
        {addonCredits > 0 &&
          ` · ${t("billing.creditsBoughtOnly", { defaultValue: "{{n}} bought", n: num(addonCredits) })}`}
      </span>
    </div>
  );
}
