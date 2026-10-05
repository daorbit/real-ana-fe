import type { CSSProperties } from "react";
import { Button } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowUpRight, Check, Clock, CreditCard } from "lucide-react";
import { priceIn } from "@/shared/lib/currency";
import type { BillingCycle, Currency, Plan, QuotaSummary } from "@/shared/types";
import { PlanIcon, PLAN_ACCENTS, PLAN_GRADIENTS, PLAN_ON_ACCENT } from "../PlanIcons";
import { FeatureLine } from "../FeatureLine";
import { RIBBON_FALLBACK } from "../../lib/constants";
import { planFeatureLines } from "../../lib/planFeatures";
import { daysUntil } from "../../lib/usageMonth";
import classes from "./Plans.module.css";

const RENEW_WITHIN_DAYS = 7;

interface Props {
  plan: Plan;
  usage: QuotaSummary;
  expired: boolean;
  featured: boolean;
  lower: boolean;
  cycle: BillingCycle;
  currency: Currency;
  money: (amountMinor: number) => string;
  isDemo: boolean;
  selectedWorkspaceId: string | null;
  subscribing: string | null;
  onPick: (plan: Plan) => void;
  featureLimit?: number;
  onSeeAll?: () => void;
}

export function PlanCard({
  plan, usage, expired, featured, lower, cycle, currency, money,
  isDemo, selectedWorkspaceId, subscribing, onPick, featureLimit, onSeeAll,
}: Props) {
  const { t } = useTranslation();
  const accent = PLAN_ACCENTS[plan.slug] ?? RIBBON_FALLBACK;
  const gradient = PLAN_GRADIENTS[plan.slug] ?? accent;
  const onAccent = PLAN_ON_ACCENT[plan.slug] ?? "#fff";

  const price = priceIn(cycle === "yearly" ? plan.priceYearly : plan.priceMonthly, currency);
  const buyable = price > 0;
  const current = usage?.plan.slug === plan.slug && !expired;
  const daysLeft = usage?.currentPeriodEnd ? daysUntil(usage.currentPeriodEnd) : null;
  const renewable =
    current && buyable && usage?.cycle === cycle && daysLeft !== null && daysLeft > 0 && daysLeft <= RENEW_WITHIN_DAYS;
  const highlight = featured || current;
  const resting = !featured && ((current && !renewable) || lower || !buyable);

  const pill = renewable
    ? { icon: Clock, label: t("billing.ribbonRenewSoon", "Renew soon") }
    : current
      ? { icon: Check, label: t("billing.ribbonCurrent") }
      : featured
        ? { icon: ArrowUpRight, label: t("billing.ribbonRecommended") }
        : null;

  const ctaLabel = isDemo ? t("billing.ctaSignUpSubscribe")
    : renewable ? t("billing.ctaRenew")
    : current ? t("billing.ctaCurrentPlan")
    : lower ? t("billing.ctaIncludedInPlan")
    : !buyable ? t("billing.ctaIncludedFree")
    : usage?.plan.slug === plan.slug ? t("billing.ctaRenew")
    : t("billing.ctaSubscribe");

  const features = planFeatureLines(plan, t);
  const visibleFeatures = featureLimit ? features.slice(0, featureLimit) : features;
  const hiddenCount = features.length - visibleFeatures.length;

  const ctaClass = [classes.cta, featured ? classes.ctaFeatured : "", resting ? "plan-cta--resting" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={classes.card}
      data-highlight={highlight || undefined}
      style={{ "--plan-accent": accent, "--plan-gradient": gradient, "--plan-on": onAccent } as CSSProperties}
    >
      <div className={classes.top}>
        <PlanIcon slug={plan.slug} size={44} uid={`card-${plan.slug}`} />
        {pill && (
          <span className={classes.pill}>
            <pill.icon size={12} strokeWidth={2.75} />
            {pill.label}
          </span>
        )}
      </div>

      <h4 className={classes.name}>{plan.name}</h4>
      <p className={classes.description}>{plan.description}</p>

      <div className={classes.priceRow}>
        <span className={classes.price}>{money(price)}</span>
        {buyable && (
          <span className={classes.per}>/ {cycle === "yearly" ? t("billing.perYear") : t("billing.perMonth")}</span>
        )}
      </div>

      <div className={classes.saving}>
        {buyable && cycle === "yearly" &&
          t("billing.savesPerYear", { amount: money(priceIn(plan.priceMonthly, currency) * 12 - price) })}
      </div>

      <Button
        fullWidth
        size="md"
        radius="md"
        color="emerald"
        variant={renewable || featured ? "filled" : "light"}
        className={ctaClass}
        disabled={(current && !renewable) || lower || !buyable || isDemo || !selectedWorkspaceId}
        loading={subscribing === plan.slug}
        leftSection={buyable && !current && !lower ? <CreditCard size={15} /> : undefined}
        onClick={() => onPick(plan)}
      >
        {ctaLabel}
      </Button>

      <div className={classes.divider} />

      <p className={classes.headline}>{t("billing.featureAudits", { count: plan.monthlyAuditQuota })}</p>
      <ul className={classes.features}>
        {visibleFeatures.map((f, i) => (
          <FeatureLine key={`${i}:${f}`} text={f} />
        ))}
      </ul>

      {hiddenCount > 0 && onSeeAll && (
        <button type="button" className={classes.seeAll} onClick={onSeeAll}>
          {t("billing.seeAllFeatures", {
            defaultValue: "See all {{count}} features",
            count: features.length,
          })}
          <ArrowRight size={14} strokeWidth={2.2} />
        </button>
      )}
    </article>
  );
}
