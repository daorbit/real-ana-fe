import { useEffect, useState } from "react";
import { Text, Stack, Alert, Tabs } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { PageHelpButton } from "@/shared/ui/PageHelpButton";
import { BillingSkeleton } from "@/shared/ui/Skeletons";
import { useGetPlansQuery, useGetAddonPacksQuery, useGetWorkspaceUsageQuery } from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { useWorkspace } from "@/features/workspace/context";
import type { Plan, AddonPack, CouponCheckResult } from "@/shared/types";

import { useBillingView } from "../hooks/useBillingView";
import { useCheckout } from "../hooks/useCheckout";
import { useCheckoutIntent } from "../hooks/useCheckoutIntent";
import { featuredPlanSlug } from "../lib/planFeatures";
import { PlanOverview } from "../components/overview/PlanOverview";
import { BillingTabs } from "../components/BillingTabs";
import { PlansTab } from "../components/PlansTab";
import { AddonsTab } from "../components/AddonsTab";
import { Receipts } from "../components/Receipts";
import { UsageOverviewTab } from "../components/usage/UsageOverviewTab";
import { PlanCheckoutModal } from "../components/PlanCheckoutModal";
import { AddonCheckoutModal } from "../components/AddonCheckoutModal";
import { CheckoutOutcome } from "../components/CheckoutOutcome";
import { ReferralsTab } from "@/features/referrals/components/ReferralsTab";
import { useTitle } from "@/shared/lib/useTitle";

/**
 * Billing: what this workspace is on, what it could be on, and what it has
 * paid.
 *
 * The page itself only decides which of those three questions is being asked
 * and hands the answer to a tab — the pricing grid, the credit packs and the
 * receipts each own their own layout, and the purchase flows live in
 * `useCheckout` because opening a payment sheet is not a rendering concern.
 */
export default function Billing() {
  useTitle("Billing");
  const { t } = useTranslation();
  const { user: _user, isDemo } = useAuth();
  const { tab, setTab, cycle, setCycle, currency, changeCurrency, money } = useBillingView();

  // The workspace being bought for is the one selected in the sidebar.
  const { workspaces, active, loading: billingLoading } = useWorkspace();
  const selectedWorkspaceId = active?._id ?? null;

  const {
    data: plans = [], isLoading: plansLoading, isFetching: plansFetching, refetch: refetchPlans,
  } = useGetPlansQuery({ currency, workspaceId: selectedWorkspaceId }, { refetchOnMountOrArgChange: true });
  const {
    data: addons = [], isLoading: addonsLoading, isFetching: addonsFetching, refetch: refetchAddons,
  } = useGetAddonPacksQuery({ currency }, { refetchOnMountOrArgChange: true });

  const {
    data: liveUsage, isFetching: usageFetching, refetch: refetchUsage,
  } = useGetWorkspaceUsageQuery(selectedWorkspaceId ?? "", { skip: !selectedWorkspaceId });
  const usage = liveUsage ?? active?.billing ?? null;

  const refetching = plansFetching || addonsFetching || usageFetching;
  // Usage travels with prices: the Add-ons tab's balance cards are read from it,
  // so refreshing one without the other leaves the balances stale next to
  // freshly fetched packs.
  const refetchPrices = () => { refetchPlans(); refetchAddons(); refetchUsage(); };

  /** What is in the confirm dialog, and the coupon typed into it. */
  const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);
  const [confirmAddon, setConfirmAddon] = useState<AddonPack | null>(null);
  const [planCoupon, setPlanCoupon] = useState<CouponCheckResult | null>(null);
  const [addonCoupon, setAddonCoupon] = useState<CouponCheckResult | null>(null);

  const {
    subscribe, buyAddon, subscribing, buying,
    celebration, setCelebration, cancelled, setCancelled,
  } = useCheckout({ workspaceId: selectedWorkspaceId, cycle, currency, planCoupon, addonCoupon });

  useEffect(() => {
    if (!celebration) return;
    setConfirmPlan(null);
    setConfirmAddon(null);
  }, [celebration]);

  useEffect(() => {
    if (cancelled && (confirmPlan || confirmAddon)) setCancelled(null);
  }, [cancelled]);

  const loading = plansLoading || addonsLoading || billingLoading;
  const expired = usage?.status === "expired";

  // A renewal is the current plan bought again, on its own cycle, before the
  // period has lapsed. The server stacks another cycle onto the existing end
  // date in that case; this mirrors the sum so the checkout dialog can show
  // the resulting date.
  const CYCLE_DAYS = cycle === "yearly" ? 365 : 30;
  const renewal =
    confirmPlan &&
    usage &&
    !expired &&
    usage.plan.slug === confirmPlan.slug &&
    usage.cycle === cycle &&
    usage.currentPeriodEnd
      ? {
          newPeriodEnd: new Date(
            new Date(usage.currentPeriodEnd).getTime() + CYCLE_DAYS * 24 * 60 * 60 * 1000,
          ).toISOString(),
        }
      : null;

  const featuredSlug = featuredPlanSlug(plans, usage?.plan.slug ?? null, currency);

  const pickPlan = (plan: Plan) => { setPlanCoupon(null); setConfirmPlan(plan); };
  useCheckoutIntent(plans, pickPlan);

  return (
    <AppShell>
      <PageHeader
        title={t("billing.title")}
        description={t("billing.description")}
        docsPath={tab === "referrals" ? DOCS_SLUGS.referrals : DOCS_SLUGS.billing}
        actions={<PageHelpButton />}
      />

      {loading ? (
        <BillingSkeleton />
      ) : (
        <Stack gap={32}>
          {usage && (
            <PlanOverview
              usage={usage}
              expired={expired}
              onChangePlan={() => setTab("plans")}
              onBuyAddons={() => setTab("addons")}
            />
          )}

          {/* The demo has no account behind it, so it has no plan either —
              saying "you don't have a plan yet" would read as a problem to fix
              rather than the nature of a demo. Prices below are the real ones. */}
          {isDemo ? (
            <Alert variant="light" color="gray" icon={<Info size={16} />} radius="md">
              <Text size="sm">
                These are our real plans and prices, but nothing can be bought in
                the demo — it runs without an account. Sign up to subscribe.
              </Text>
            </Alert>
          ) : workspaces.length === 0 ? (
            /* Nothing to bill: plans attach to a workspace, so there is no
               purchase to make until one exists. */
            <Alert variant="light" color="gray" icon={<Info size={16} />} radius="md">
              <Text size="sm">
                Plans are bought per workspace, and you don&apos;t have one yet.
                Create a workspace first — it starts on Free, and you can upgrade
                it here.
              </Text>
            </Alert>
          ) : !usage && (
            <Alert variant="light" color="gray" icon={<Info size={16} />} radius="md">
              <Text size="sm">
                This workspace has no plan — pick one under Plans to unlock SEO
                audits and crawls for it.
              </Text>
            </Alert>
          )}

          {/* Three separate jobs — choosing a plan, topping up credits, and
              looking up a past payment — split so the page answers one question
              at a time. The usage panel stays above them because "what am I on"
              is context for all three. */}
          <BillingTabs value={tab} onChange={setTab}>
            <Tabs.Panel value="plans">
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
                refetchPrices={refetchPrices}
                isDemo={isDemo}
                selectedWorkspaceId={selectedWorkspaceId}
                subscribing={subscribing}
                onPick={pickPlan}
              />
            </Tabs.Panel>

            <Tabs.Panel value="usage">
              {selectedWorkspaceId ? (
                <UsageOverviewTab workspaceId={selectedWorkspaceId} usage={usage} />
              ) : (
                <Alert variant="light" color="gray" icon={<Info size={16} />} radius="md">
                  <Text size="sm">Create a workspace to see its usage here.</Text>
                </Alert>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="addons">
              <AddonsTab
                addons={addons}
                usage={usage}
                currency={currency}
                changeCurrency={changeCurrency}
                money={money}
                refetching={refetching}
                refetchPrices={refetchPrices}
                isDemo={isDemo}
                selectedWorkspaceId={selectedWorkspaceId}
                buying={buying}
                onPick={(pack) => { setAddonCoupon(null); setConfirmAddon(pack); }}
              />
            </Tabs.Panel>

            <Tabs.Panel value="history">
              {/* A demo session has no purchases behind it, so there is no history
                  to show — and an empty table would imply one that failed to load. */}
              {isDemo ? (
                <Alert variant="light" color="gray" icon={<Info size={16} />} radius="md">
                  <Text size="sm">
                    The demo has no account behind it, so there are no payments to
                    show. On a real account, every receipt lives here.
                  </Text>
                </Alert>
              ) : (
                <Receipts workspaceId={selectedWorkspaceId ?? ""} />
              )}
            </Tabs.Panel>

            <Tabs.Panel value="referrals">
              <ReferralsTab />
            </Tabs.Panel>
          </BillingTabs>
        </Stack>
      )}

      <PlanCheckoutModal
        plan={confirmPlan}
        plans={plans}
        usage={usage}
        cycle={cycle}
        onCycleChange={setCycle}
        currency={currency}
        addons={addons}
        coupon={planCoupon}
        onCoupon={setPlanCoupon}
        busy={!!confirmPlan && subscribing === confirmPlan.slug}
        renewal={renewal}
        onClose={() => setConfirmPlan(null)}
        onConfirm={(plan, selection, gateway, phone) => subscribe(plan, selection, gateway, phone)}
      />

      <AddonCheckoutModal
        pack={confirmAddon}
        currency={currency}
        coupon={addonCoupon}
        onCoupon={setAddonCoupon}
        busy={!!confirmAddon && buying === confirmAddon._id}
        onClose={() => setConfirmAddon(null)}
        onConfirm={(pack, packs, gateway, phone) => buyAddon(pack, packs, gateway, phone)}
      />

      <CheckoutOutcome
        cancelled={cancelled}
        setCancelled={setCancelled}
        celebration={celebration}
        setCelebration={setCelebration}
      />
    </AppShell>
  );
}
