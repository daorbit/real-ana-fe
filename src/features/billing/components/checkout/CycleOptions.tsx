import { useTranslation } from "react-i18next";
import { priceIn } from "@/shared/lib/currency";
import type { BillingCycle, Currency, Plan } from "@/shared/types";
import { yearlySaving } from "../../lib/checkoutSavings";
import s from "./CheckoutPage.module.css";

export function CycleOptions({
  plan,
  cycle,
  currency,
  money,
  busy,
  onChange,
}: {
  plan: Plan;
  cycle: BillingCycle;
  currency: Currency;
  money: (amountMinor: number) => string;
  busy: boolean;
  onChange: (cycle: BillingCycle) => void;
}) {
  const { t } = useTranslation();
  const monthly = priceIn(plan.priceMonthly, currency);
  const yearly = priceIn(plan.priceYearly, currency);
  const saving = yearlySaving(plan, currency);

  const options = [
    {
      value: "monthly" as const,
      name: t("billing.cycleMonthly"),
      price: money(monthly),
      per: t("billing.perMonth"),
      note: t("billing.billedEveryMonth", "Billed every month"),
      save: false,
    },
    {
      value: "yearly" as const,
      name: t("billing.yearlyName", "Yearly"),
      price: money(yearly),
      per: t("billing.perYear"),
      note: saving.amount > 0
        ? t("billing.yearlyNote", "{{monthly}}/mo · save {{amount}} a year", {
            monthly: money(Math.round(yearly / 12)),
            amount: money(saving.amount),
          })
        : t("billing.billedEveryYear", "Billed once a year"),
      save: saving.amount > 0,
    },
  ];

  return (
    <div className={s.cycles} role="radiogroup" aria-label={t("billing.billingPeriod", "Billing period")}>
      {options.map((o) => {
        const active = cycle === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            className={s.cycle}
            data-active={active || undefined}
            disabled={busy}
            onClick={() => onChange(o.value)}
          >
            <span className={s.radio} aria-hidden />
            <span className={s.cycleBody}>
              <span className={s.cycleTop}>
                <span className={s.cycleName}>{o.name}</span>
                {o.save && (
                  <span className={s.badge}>
                    {t("billing.savePercent", "Save {{percent}}%", { percent: saving.percent })}
                  </span>
                )}
              </span>
              <span className={s.cyclePrice}>
                <span className={s.cyclePriceValue}>{o.price}</span>
                <span className={s.cyclePer}>/ {o.per}</span>
              </span>
              <span className={s.cycleNote}>{o.note}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
