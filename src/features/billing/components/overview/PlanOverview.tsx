import type { CSSProperties } from "react";
import { Button } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { AlertTriangle, ArrowUpRight, CircleX, Clock, Infinity as InfinityIcon, RefreshCw, RotateCcw, ShoppingCart } from "lucide-react";
import type { QuotaSummary } from "@/shared/types";
import { useCancelAutoRenew } from "../../hooks/useCancelAutoRenew";
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
  onTurnOnAutoRenew,
}: {
  usage: NonNullable<QuotaSummary>;
  expired: boolean;
  onChangePlan: () => void;
  onBuyAddons: () => void;
  onTurnOnAutoRenew: () => void;
}) {
  const { t } = useTranslation();
  const accent = PLAN_ACCENTS[usage.plan.slug] ?? RIBBON_FALLBACK;
  const periodEnd = usage.currentPeriodEnd;
  const renewal = usage.renewal;
  const autoRenewing = !expired && !!renewal?.autoRenew;
  const paidPlan = usage.plan.slug !== "free";
  const canTurnOn = !expired && !autoRenewing && paidPlan;
  const daysLeft = periodEnd && !expired && !autoRenewing && paidPlan ? daysUntil(periodEnd) : null;
  const cycleWord = t(usage.cycle === "yearly" ? "billing.cycleYearlyWord" : "billing.cycleMonthlyWord");
  const askCancel = useCancelAutoRenew(usage.workspaceId, usage.plan.name, periodEnd);

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
            {!paidPlan && !expired && (
              <div className={classes.meta}>
                <span className={classes.metaItem}>
                  <InfinityIcon size={13} />
                  {t("billing.freeForever", "Free forever · upgrade any time")}
                </span>
              </div>
            )}
            {periodEnd && (paidPlan || expired) && (
              <div className={classes.meta}>
                {autoRenewing ? (
                  <span className={classes.metaItem}>
                    <RefreshCw size={13} />
                    {renewal?.nextChargeAt
                      ? t("billing.autoRenewsOn", "Renews automatically on {{date}}", {
                          date: shortDate(renewal.nextChargeAt, { year: "numeric" }),
                        })
                      : t("billing.autoRenewsOnNoDate", "Renews automatically")}
                    {t("billing.billedSuffix", { cycle: cycleWord })}
                  </span>
                ) : (
                  <span className={classes.metaItem}>
                    <Clock size={13} />
                    {t(expired ? "billing.expiredOn" : "billing.renewsOn", {
                      date: shortDate(periodEnd, { year: "numeric" }),
                    })}
                    {t("billing.billedSuffix", { cycle: cycleWord })}
                  </span>
                )}
                {renewal?.status === "pending" && !expired && (
                  <span className={classes.daysPill} data-soon>
                    {t("billing.renewalRetrying", "Payment retrying")}
                  </span>
                )}
                {renewal?.status === "halted" && !expired && (
                  <span className={classes.daysPill} data-soon>
                    {t("billing.renewalHalted", "Auto-renew stopped")}
                  </span>
                )}
                {renewal?.status === "cancelled" && !expired && paidPlan && (
                  <span className={classes.daysPill}>{t("billing.subscriptionCancelled", "Cancelled")}</span>
                )}
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
          {autoRenewing && (
            <Button variant="light" color="red" radius="md" leftSection={<CircleX size={15} />} onClick={askCancel}>
              {t("billing.cancelSub", "Cancel subscription")}
            </Button>
          )}
          {canTurnOn && (
            <Button variant="subtle" color="gray" radius="md" leftSection={<RefreshCw size={15} />} onClick={onTurnOnAutoRenew}>
              {t("billing.turnOnAutoRenew", "Turn on auto-renew")}
            </Button>
          )}
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
