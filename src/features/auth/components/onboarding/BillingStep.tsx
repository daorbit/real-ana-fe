import { useState } from "react";
import { Button } from "@mantine/core";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BillingSkeleton } from "@/shared/ui/Skeletons";
import { useGetPlansQuery, useGetAddonPacksQuery, useGetWorkspaceUsageQuery } from "@/app/store";
import { useWorkspace } from "@/features/workspace/context";
import { priceIn } from "@/shared/lib/currency";
import { detectCurrency, formatMoney, getStoredCurrency, setStoredCurrency } from "@/shared/lib/currency";
import type { BillingCycle, Currency, Plan, CouponCheckResult } from "@/shared/types";
import { PlansTab } from "@/features/billing/components/PlansTab";
import { PlanCheckoutModal } from "@/features/billing/components/PlanCheckoutModal";
import { CheckoutOutcome } from "@/features/billing/components/CheckoutOutcome";
import { useCheckout } from "@/features/billing/hooks/useCheckout";
import s from "./AppearanceStep.module.css";


export function BillingStep({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const { active, workspaces } = useWorkspace();
  const workspaceId = active?._id ?? workspaces[0]?._id ?? null;

  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [currency, setCurrency] = useState<Currency>(() => getStoredCurrency() ?? detectCurrency());
  const changeCurrency = (v: Currency) => {
    setCurrency(v);
    setStoredCurrency(v);
  };
  const money = (amountMinor: number) => formatMoney(amountMinor, currency);

  const {
    data: plans = [], isLoading: plansLoading, isFetching: plansFetching, refetch: refetchPlans,
  } = useGetPlansQuery({ currency }, { refetchOnMountOrArgChange: true });

  const {
    data: addons = [], isFetching: addonsFetching, refetch: refetchAddons,
  } = useGetAddonPacksQuery({ currency }, { refetchOnMountOrArgChange: true });

  const {
    data: liveUsage, isFetching: usageFetching, refetch: refetchUsage,
  } = useGetWorkspaceUsageQuery(workspaceId ?? "", { skip: !workspaceId });
  const usage = liveUsage ?? active?.billing ?? null;

  const refetching = plansFetching || addonsFetching || usageFetching;

  const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);
  const [planCoupon, setPlanCoupon] = useState<CouponCheckResult | null>(null);

  const {
    subscribe, subscribing, celebration, setCelebration, cancelled, setCancelled,
  } = useCheckout({ workspaceId, cycle, currency, planCoupon, addonCoupon: null });

  const expired = usage?.status === "expired";

  const featuredSlug = (() => {
    if (!plans.length) return null;
    const sorted = [...plans].sort(
      (a, b) => priceIn(a.priceMonthly, currency) - priceIn(b.priceMonthly, currency),
    );
    const currentIdx = usage ? sorted.findIndex((p) => p.slug === usage.plan.slug) : -1;
    const next = currentIdx >= 0 ? sorted[currentIdx + 1] : sorted[sorted.length - 2];
    return next?.slug ?? sorted[sorted.length - 1]?.slug ?? null;
  })();

  const loading = plansLoading || !workspaceId;

  return (
    <div className={`onb-form ${s.page}`}>
      <div className={s.actionsRow}>
        <div className={s.actions}>
          <Button
            className="auth-btn"
            variant="default"
            leftSection={<ArrowLeft size={15} />}
            onClick={onBack}
          >
            Back
          </Button>
          <Button className="auth-btn" onClick={onDone} rightSection={<ArrowRight size={16} />}>
            Continue with Free
          </Button>
        </div>
      </div>

      <div className={s.controls} style={{ flex: 1, overflowY: "auto" }}>
        {loading || !usage ? (
          <BillingSkeleton />
        ) : (
          <PlansTab
            plans={plans}
            usage={usage}
            expired={expired}
            featuredSlug={featuredSlug}
            cycle={cycle}
            setCycle={setCycle}
            currency={currency}
            changeCurrency={changeCurrency}
            money={money}
            refetching={refetching}
            refetchPrices={() => { refetchPlans(); refetchAddons(); refetchUsage(); }}
            isDemo={false}
            selectedWorkspaceId={workspaceId}
            subscribing={subscribing}
            onPick={(plan) => { setPlanCoupon(null); setConfirmPlan(plan); }}
          />
        )}
      </div>

      <PlanCheckoutModal
        plan={confirmPlan}
        cycle={cycle}
        currency={currency}
        addons={addons}
        coupon={planCoupon}
        onCoupon={setPlanCoupon}
        busy={!!confirmPlan && subscribing === confirmPlan.slug}
        renewal={null}
        onClose={() => setConfirmPlan(null)}
        onConfirm={(plan, selection, gateway, phone) => { setConfirmPlan(null); subscribe(plan, selection, gateway, phone); }}
      />

      <CheckoutOutcome
        cancelled={cancelled}
        setCancelled={setCancelled}
        celebration={celebration}

        setCelebration={(value) => {
          setCelebration(value);
          if (!value) onDone();
        }}
      />
    </div>
  );
}
