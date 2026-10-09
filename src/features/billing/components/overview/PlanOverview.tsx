import type { CSSProperties } from "react";
import { Button } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { AlertTriangle, ArrowUpRight, Clock, RotateCcw, ShoppingCart } from "lucide-react";
import type { QuotaSummary } from "@/shared/types";
import { PlanIcon, PLAN_ACCENTS } from "../PlanIcons";
import { RIBBON_FALLBACK } from "../../lib/constants";
import { daysUntil } from "../../lib/usageMonth";
import classes from "./PlanOverview.module.css";

const RENEW_SOON_DAYS = 7;

function shortDate(iso: string, options: Intl.DateTimeFormatOptions = {}) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", ...options });
}

export function PlanOverview({
  usage,
  expired,
  onChangePlan,
  onBuyAddons,
}: {
  usage: NonNullable<QuotaSummary>;
  expired: boolean;
  onChangePlan: () => void;
  onBuyAddons: () => void;
}) {
  const { t } = useTranslation();
  const accent = PLAN_ACCENTS[usage.plan.slug] ?? RIBBON_FALLBACK;
  const periodEnd = usage.currentPeriodEnd;
  const daysLeft = periodEnd && !expired ? daysUntil(periodEnd) : null;
  const cycleWord = t(usage.cycle === "yearly" ? "billing.cycleYearlyWord" : "billing.cycleMonthlyWord");

  return (
    <section
      className={classes.root}
      data-plan={usage.plan.slug}
      data-expired={expired || undefined}
      style={{ "--plan-accent": accent } as CSSProperties}
    >
      <header className={classes.head}>
        <div className={classes.identity}>
          <span className={classes.planMark}>
            <PlanIcon slug={usage.plan.slug} size={34} uid="hero" />
          </span>
          <div>
            <span className={classes.eyebrow}>{t("billing.currentPlan", "Current plan")}</span>
            <div className={classes.titleRow}>
              <h2 className={classes.planName}>{usage.plan.name}</h2>
            </div>
            {periodEnd && (
              <div className={classes.meta}>
                <span className={classes.metaItem}>
                  <Clock size={13} />
                  {t(expired ? "billing.expiredOn" : "billing.renewsOn", {
                    date: shortDate(periodEnd, { year: "numeric" }),
                  })}
                  {t("billing.billedSuffix", { cycle: cycleWord })}
                </span>
                {daysLeft !== null && (
                  <span className={classes.daysPill} data-soon={daysLeft <= RENEW_SOON_DAYS || undefined}>
                    {t("billing.daysLeft", { defaultValue: "{{count}} days left", count: daysLeft })}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={classes.actions}>
          <Button variant="default" radius="md" leftSection={<ShoppingCart size={15} />} onClick={onBuyAddons}>
            {t("billing.buyAddons", "Buy add-ons")}
          </Button>
          <Button
            color="emerald"
            radius="md"
            leftSection={expired ? <RotateCcw size={15} /> : <ArrowUpRight size={15} />}
            onClick={onChangePlan}
          >
            {expired ? t("billing.renewPlan", "Renew plan") : t("billing.changePlan", "Change plan")}
          </Button>
        </div>
      </header>

      {expired && (
        <div className={classes.expiredNote}>
          <AlertTriangle size={15} />
          <span>{t("billing.expiredNotice")}</span>
        </div>
      )}
    </section>
  );
}
