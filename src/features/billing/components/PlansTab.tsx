import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { BillingCycle, Plan, QuotaSummary, Currency } from "@/shared/types";
import { SectionHeader } from "./common/SectionHeader";
import { CurrencyControl } from "./common/CurrencyControl";
import { CycleControl } from "./common/CycleControl";
import { RefetchButton } from "./common/RefetchButton";
import { PlanGrid } from "./plans/PlanGrid";
import { CARD_FEATURE_LIMIT } from "../lib/planFeatures";
import { COMPARE_PLANS_PATH } from "../lib/constants";

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
  const nav = useNavigate();

  return (
    <div>
      <SectionHeader
        title={t("billing.plansTitle")}
        description={t("billing.plansSubtitle")}
        actions={
          <>
            <CurrencyControl value={currency} onChange={changeCurrency} />
            <CycleControl value={cycle} onChange={setCycle} />
            <RefetchButton label={t("billing.refetchPrices")} loading={refetching} onClick={refetchPrices} />
          </>
        }
      />

      <PlanGrid
        plans={plans}
        usage={usage}
        expired={expired}
        featuredSlug={featuredSlug}
        cycle={cycle}
        currency={currency}
        money={money}
        isDemo={isDemo}
        selectedWorkspaceId={selectedWorkspaceId}
        subscribing={subscribing}
        onPick={onPick}
        featureLimit={CARD_FEATURE_LIMIT}
        onSeeAll={() => nav(`${COMPARE_PLANS_PATH}?cycle=${cycle}`)}
      />
    </div>
  );
}
