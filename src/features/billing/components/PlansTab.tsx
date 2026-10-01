import { SegmentedControl } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { BadgeCheck, Layers, Receipt } from "lucide-react";
import type { BillingCycle, Plan, QuotaSummary, Currency } from "@/shared/types";
import { SectionHeader } from "./common/SectionHeader";
import { CurrencyControl } from "./common/CurrencyControl";
import { RefetchButton } from "./common/RefetchButton";
import { FactList } from "./common/FactList";
import { PlanCard } from "./plans/PlanCard";
import classes from "./plans/Plans.module.css";

interface Props {
  plans: Plan[];
  usage: QuotaSummary;
  expired: boolean;
  featuredSlug: string | null;
  cycle: BillingCycle;
  setCycle: (cycle: BillingCycle) => void;
  currency: Currency;
  changeCurrency: (currency: Currency) => void;
  money: (amountMinor: number) => string;
  refetching: boolean;
  refetchPrices: () => void;
  isDemo: boolean;
  selectedWorkspaceId: string | null;
  subscribing: string | null;
  onPick: (plan: Plan) => void;
}

export function PlansTab({
  plans, usage, expired, featuredSlug, cycle, setCycle, currency, changeCurrency,
  money, refetching, refetchPrices, isDemo, selectedWorkspaceId, subscribing, onPick,
}: Props) {
  const { t } = useTranslation();
  const currentIndex = plans.findIndex((p) => p.slug === usage?.plan.slug);

  return (
    <div>
      <SectionHeader
        title={t("billing.plansTitle")}
        description={t("billing.plansSubtitle")}
        actions={
          <>
            <CurrencyControl value={currency} onChange={changeCurrency} />
            <SegmentedControl
              size="sm"
              radius="md"
              value={cycle}
              onChange={(v) => setCycle(v as BillingCycle)}
              data={[
                { label: t("billing.cycleMonthly"), value: "monthly" },
                { label: t("billing.cycleYearly"), value: "yearly" },
              ]}
            />
            <RefetchButton label={t("billing.refetchPrices")} loading={refetching} onClick={refetchPrices} />
          </>
        }
      />

      <div className={classes.grid}>
        {plans.map((plan, index) => {
          const current = usage?.plan.slug === plan.slug && !expired;
          return (
            <PlanCard
              key={plan.slug}
              plan={plan}
              usage={usage}
              expired={expired}
              featured={plan.slug === featuredSlug && !current}
              lower={!expired && currentIndex > -1 && index < currentIndex}
              cycle={cycle}
              currency={currency}
              money={money}
              isDemo={isDemo}
              selectedWorkspaceId={selectedWorkspaceId}
              subscribing={subscribing}
              onPick={onPick}
            />
          );
        })}
      </div>

      <FactList
        facts={[
          {
            icon: BadgeCheck,
            title: t("billing.factNoAutoRenewT", "No auto-renew"),
            text: t("billing.factNoAutoRenewD", "Every plan is a one-time payment for its cycle. Nothing is charged again unless you renew."),
          },
          {
            icon: Layers,
            title: t("billing.factKeepUsageT", "Upgrade any time"),
            text: t("billing.factKeepUsageD", "The new limit applies straight away, and this month's usage carries over."),
          },
          {
            icon: Receipt,
            title: t("billing.factReceiptT", "Receipts by email"),
            text: t("billing.factReceiptD", "A receipt lands in your inbox after every payment and stays under Payment history."),
          },
        ]}
      />
    </div>
  );
}
