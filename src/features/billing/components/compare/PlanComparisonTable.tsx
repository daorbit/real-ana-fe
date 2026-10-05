import { Fragment, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { priceIn } from "@/shared/lib/currency";
import type { BillingCycle, Currency, Plan } from "@/shared/types";
import { PlanIcon, PLAN_ACCENTS, PLAN_GRADIENTS, PLAN_ON_ACCENT } from "../PlanIcons";
import { RIBBON_FALLBACK } from "../../lib/constants";
import { allPlanFeatures } from "../../lib/planFeatures";
import { CompareCell } from "./CompareCell";
import { featureRows, limitRows, type ComparisonRow } from "./comparisonRows";
import classes from "./Compare.module.css";

interface Props {
  plans: Plan[];
  currentSlug: string | null;
  featuredSlug: string | null;
  cycle: BillingCycle;
  currency: Currency;
  money: (amountMinor: number) => string;
}

export function PlanComparisonTable({ plans, currentSlug, featuredSlug, cycle, currency, money }: Props) {
  const { t } = useTranslation();

  const groups: { title: string; rows: ComparisonRow[] }[] = [
    { title: t("billing.compareLimits", "Limits"), rows: limitRows(t) },
    { title: t("billing.compareFeatures", "Features"), rows: featureRows(allPlanFeatures(plans)) },
  ];

  const columnState = (plan: Plan) => ({
    "data-current": plan.slug === currentSlug || undefined,
    "data-featured": (plan.slug === featuredSlug && plan.slug !== currentSlug) || undefined,
  });

  return (
    <div className={classes.frame}>
      <div className={classes.scroll}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th className={classes.labelHead} scope="col">
                {t("billing.compareFeatureCol", "Compare")}
              </th>
              {plans.map((plan) => {
                const price = priceIn(cycle === "yearly" ? plan.priceYearly : plan.priceMonthly, currency);
                const current = plan.slug === currentSlug;
                const featured = plan.slug === featuredSlug && !current;
                return (
                  <th
                    key={plan.slug}
                    scope="col"
                    className={classes.planHead}
                    {...columnState(plan)}
                    style={{
                      "--plan-accent": PLAN_ACCENTS[plan.slug] ?? RIBBON_FALLBACK,
                      "--plan-gradient": PLAN_GRADIENTS[plan.slug] ?? PLAN_ACCENTS[plan.slug] ?? RIBBON_FALLBACK,
                      "--plan-on": PLAN_ON_ACCENT[plan.slug] ?? "#fff",
                    } as CSSProperties}
                  >
                    <div className={classes.planHeadInner}>
                      <PlanIcon slug={plan.slug} size={26} uid={`matrix-${plan.slug}`} />
                      <span className={classes.planName}>{plan.name}</span>
                      <span className={classes.planPrice}>
                        {price === 0
                          ? t("billing.compareFree", "Free")
                          : `${money(price)} / ${cycle === "yearly" ? t("billing.perYear") : t("billing.perMonth")}`}
                      </span>
                      {(current || featured) && (
                        <span className={classes.planTag}>
                          {current ? t("billing.ribbonCurrent") : t("billing.ribbonRecommended")}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {groups.map((group) => (
              <Fragment key={group.title}>
                <tr className={classes.groupRow}>
                  <th colSpan={plans.length + 1} scope="colgroup">
                    {group.title}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.label} className={classes.row}>
                    <th scope="row" className={classes.rowLabel}>
                      {row.label}
                    </th>
                    {plans.map((plan) => (
                      <td key={plan.slug} className={classes.cell} {...columnState(plan)}>
                        <CompareCell value={row.value(plan)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
