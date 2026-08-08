import { useEffect, useState } from "react";
import {
  Title, Text, Group, Button, Card, Badge, SimpleGrid, Stack, Center, Loader,
  SegmentedControl, Progress, ThemeIcon, Alert, Modal, TextInput, Box, Divider,
  ActionIcon, Tooltip, Table, NumberInput, Grid, Tabs, UnstyledButton,
} from "@mantine/core";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import confetti from "canvas-confetti";
import {
  Check, Search, Globe2, Info, CreditCard, ShoppingCart, Tag, X,
  Layers, Clock, PartyPopper, RefreshCw, Download, Receipt,
  Plus, Minus,
} from "lucide-react";
import { PlanIcon, PLAN_ACCENTS, PLAN_GRADIENTS, PLAN_ON_ACCENT } from "@/features/billing/components/PlanIcons";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { PageHelpButton } from "@/shared/ui/PageHelpButton";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import {
  useGetPlansQuery, useGetAddonPacksQuery, useGetWorkspaceUsageQuery,
  useStartSubscriptionMutation, useVerifySubscriptionMutation,
  useStartAddonPurchaseMutation, useVerifyAddonPurchaseMutation,
  useCheckCouponMutation, useGetInvoicesQuery,
} from "@/app/store";
import { notify, errMessage } from "@/shared/lib/notify";
import { getToken } from "@/shared/lib/http";
import { useAuth } from "@/features/auth/context";
import { useWorkspace } from "@/features/workspace/context";
import { loadRazorpayCheckout, openRazorpayCheckout } from "@/features/billing/lib/razorpay";
import {
  CURRENCIES, detectCurrency, formatMoney, priceIn, getStoredCurrency, setStoredCurrency,
} from "@/shared/lib/currency";
import type {
  BillingCycle, Plan, AddonPack, CouponCheckResult, QuotaSummary, Currency, Invoice,
  AddonSelection,
} from "@/shared/types";
import { MAX_SITES_PER_WORKSPACE } from "@/shared/types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

/**
 * Subscription plans, addon credit packs, and the current usage against them.
 *
 * Everything on this page is scoped to one workspace, chosen at the top:
 * a plan is bought per workspace, so "your plan" is only meaningful once a
 * workspace is named. Buying more capacity for an account means either
 * upgrading a workspace here or creating another one on the Workspaces page.
 *
 * Every purchase — a plan period or an addon pack — is a one-time Razorpay
 * Order, not an auto-recurring subscription: nothing here ever charges a
 * card again on its own. A plan period simply ends at `currentPeriodEnd`, and
 * "renewing" is just buying the same plan again, same as switching to a
 * different one.
 */
/**
 * Logo shown in Razorpay Checkout. Razorpay needs an absolute URL and only
 * renders raster images — without it Checkout falls back to drawing the first
 * letter of the merchant name.
 */
const CHECKOUT_LOGO = `${window.location.origin}/favicon.png`;

/** The page's three jobs, one per tab. */
type BillingTab = "plans" | "addons" | "history";
const BILLING_TABS: BillingTab[] = ["plans", "addons", "history"];

/**
 * The API's credit-type identifiers, in the user's language and correctly
 * pluralised — the raw value is an identifier, not something to put on screen.
 *
 * A lookup rather than a ternary: with three types, an `audit ? … : …` would
 * silently label Orbit question packs as crawls, including on receipts.
 */
const CREDIT_TYPE_KEY: Record<string, string> = {
  audit: "billing.typeAudit",
  crawl: "billing.typeCrawl",
  orbit: "billing.typeOrbit",
};

function creditType(t: TFunction, type: string, count: number): string {
  return t(CREDIT_TYPE_KEY[type] ?? "billing.typeCrawl", { count });
}

export default function Billing() {
  const { t } = useTranslation();
  const { user, refreshUser, isDemo } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // The tab lives in the URL so a reload, a bookmark, or a link from an email
  // ("your receipt is in Billing") lands on the right one — and so the back
  // button steps between tabs rather than leaving the page.
  const tabParam = searchParams.get("tab");
  const tab: BillingTab = BILLING_TABS.includes(tabParam as BillingTab)
    ? (tabParam as BillingTab)
    : "plans";

  const setTab = (next: BillingTab) => {
    // Replace rather than push: flicking between tabs shouldn't bury the page
    // someone arrived from under a stack of history entries.
    setSearchParams(next === "plans" ? {} : { tab: next }, { replace: true });
  };

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
    data: addons = [], isLoading: addonsLoading, isFetching: addonsFetching, refetch: refetchAddons,
  } = useGetAddonPacksQuery({ currency }, { refetchOnMountOrArgChange: true });
  const refetching = plansFetching || addonsFetching;

  /**
   * The workspaces that can be bought for, each carrying the plan it is on.
   * The same list every other page uses — a plan travels with its workspace,
   * so there is nothing extra to fetch here.
   */
  const { workspaces, active, loading: billingLoading } = useWorkspace();

  /**
   * Which workspace is being bought for. Kept in the URL alongside the tab, so
   * a "your Pro plan expires soon" email can link straight at the workspace it
   * is about instead of landing on whichever one happens to sort first.
   */
  // Billing acts on whichever workspace the sidebar has selected, like every
  // other page — switching there switches what this page is about.
  const selectedWorkspaceId = active?._id ?? null;

  /**
   * Usage from its own endpoint rather than from the workspace list.
   *
   * The list carries a `billing` object too, but nothing invalidates it when a
   * credit is spent — so an Orbit question or an audit run elsewhere in the app
   * left these counters showing the figures from whenever the list was last
   * fetched. This query is tagged `Usage`, which every quota-spending mutation
   * invalidates, and falls back to the list's copy while it loads so the panel
   * never flashes empty.
   */
  const {
    data: liveUsage, isFetching: usageFetching, refetch: refetchUsage,
  } = useGetWorkspaceUsageQuery(selectedWorkspaceId ?? "", { skip: !selectedWorkspaceId });
  const usage = liveUsage ?? active?.billing ?? null;

  const [startSubscription] = useStartSubscriptionMutation();
  const [verifySubscription] = useVerifySubscriptionMutation();
  const [startAddonPurchase] = useStartAddonPurchaseMutation();
  const [verifyAddonPurchase] = useVerifyAddonPurchaseMutation();

  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [buying, setBuying] = useState<string | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);
  const [confirmAddon, setConfirmAddon] = useState<AddonPack | null>(null);
  const [planCoupon, setPlanCoupon] = useState<CouponCheckResult | null>(null);
  const [addonCoupon, setAddonCoupon] = useState<CouponCheckResult | null>(null);
  // What to celebrate once a purchase actually completes — set right before
  // the confetti burst, cleared when the dialog closes.
  const [celebration, setCelebration] = useState<
    | { kind: "plan"; planName: string; credits: { type: string; credits: number }[] }
    | { kind: "addon"; pack: AddonPack; packs: number }
    | null
  >(null);
  // What was being bought when the Razorpay window was dismissed — nothing was
  // charged, but closing the modal silently leaves no trace of the attempt.
  const [cancelled, setCancelled] = useState<string | null>(null);

  const fireConfetti = () => {
    const colors = ["#10b981", "#059669", "#34d399", "#fbbf24"];
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors });
    confetti({ particleCount: 60, spread: 100, startVelocity: 45, origin: { y: 0.5 }, colors, angle: 60, decay: 0.9 });
    confetti({ particleCount: 60, spread: 100, startVelocity: 45, origin: { y: 0.5 }, colors, angle: 120, decay: 0.9 });
  };

  const doSubscribe = async (plan: Plan, selection: AddonSelection = {}) => {
    setConfirmPlan(null);
    // Nothing to bill against. The buttons are disabled in this state, so this
    // only guards against a stale click while the list was still loading.
    if (!selectedWorkspaceId) return;
    setSubscribing(plan.slug);
    try {
      const chosen = Object.entries(selection)
        .filter(([, packs]) => packs > 0)
        .map(([slug, packs]) => ({ slug, packs }));

      const started = await startSubscription({
        workspaceId: selectedWorkspaceId,
        planSlug: plan.slug,
        cycle,
        couponCode: planCoupon?.coupon?.code,
        currency,
        ...(chosen.length ? { addons: chosen } : {}),
      }).unwrap();

      // A ₹0 plan (Free) is assigned directly server-side — no order, no
      // Razorpay modal to open.
      if ("free" in started && started.free) {
        await refreshUser();
        setCelebration({ kind: "plan", planName: plan.name, credits: [] });
        fireConfetti();
        return;
      }

      // What the server confirmed was in the order, not what the dialog asked
      // for — the two agree, but the celebration should report what was
      // actually bought.
      const boughtCredits = (started.addons ?? []).map((a) => ({
        type: a.type,
        credits: a.credits,
      }));

      // Razorpay closes its modal after a successful payment too, so `ondismiss`
      // alone can't tell "walked away" from "just paid" — this records that the
      // handler ran first.
      let paid = false;

      await loadRazorpayCheckout();
      openRazorpayCheckout({
        key: started.razorpayKeyId,
        amount: started.amount,
        currency: started.currency,
        order_id: started.orderId,
        name: "Quantalog",
        description: `${plan.name} — ${cycle}`,
        image: CHECKOUT_LOGO,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#059669" },
        handler: async (response) => {
          paid = true;
          try {
            await verifySubscription({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();
            await refreshUser();
            setCelebration({ kind: "plan", planName: plan.name, credits: boughtCredits });
            fireConfetti();
          } catch (e) {
            notify.error(errMessage(e, t("billing.verifyFailed")));
          }
        },
        modal: {
          ondismiss: () => {
            if (!paid) setCancelled(`${plan.name} — ${cycle}`);
          },
        },
      });
    } catch (e) {
      notify.error(errMessage(e, t("billing.checkoutError")));
    } finally {
      setSubscribing(null);
    }
  };

  const doBuyAddon = async (pack: AddonPack, packs: number) => {
    setConfirmAddon(null);
    if (!selectedWorkspaceId) return;
    setBuying(pack._id);
    try {
      const { orderId, amount, currency: orderCurrency, razorpayKeyId } = await startAddonPurchase({
        slug: pack.slug,
        workspaceId: selectedWorkspaceId,
        couponCode: addonCoupon?.coupon?.code,
        currency,
        packs,
      }).unwrap();

      // Same success/dismiss ambiguity as the plan flow above.
      let paid = false;

      await loadRazorpayCheckout();
      openRazorpayCheckout({
        key: razorpayKeyId,
        amount,
        currency: orderCurrency,
        order_id: orderId,
        name: "Quantalog",
        description: packs > 1 ? `${pack.name} × ${packs}` : pack.name,
        image: CHECKOUT_LOGO,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#059669" },
        handler: async (response) => {
          paid = true;
          try {
            await verifyAddonPurchase({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();
            await refreshUser();
            setCelebration({ kind: "addon", pack, packs });
            fireConfetti();
          } catch (e) {
            notify.error(errMessage(e, t("billing.verifyFailed")));
          }
        },
        modal: {
          ondismiss: () => {
            if (!paid) setCancelled(pack.name);
          },
        },
      });
    } catch (e) {
      notify.error(errMessage(e, t("billing.checkoutError")));
    } finally {
      setBuying(null);
    }
  };

  const loading = plansLoading || addonsLoading || billingLoading;
  const expired = usage?.status === "expired";
  // The plan one tier above the current one is the one worth calling out —
  // sorted by monthly price, since that's the one axis every plan (including
  // Free) actually has.
  const featuredSlug = (() => {
    if (!plans.length) return null;
    const sorted = [...plans].sort((a, b) => priceIn(a.priceMonthly, currency) - priceIn(b.priceMonthly, currency));
    const currentIdx = usage ? sorted.findIndex((p) => p.slug === usage.plan.slug) : -1;
    const next = currentIdx >= 0 ? sorted[currentIdx + 1] : sorted[sorted.length - 2];
    return next?.slug ?? sorted[sorted.length - 1]?.slug ?? null;
  })();

  return (
    <AppShell>
      <PageHeader
        title={t("billing.title")}
        description={t("billing.description")}
        actions={<PageHelpButton />}
      />

      {loading ? (
        <Center py={64}><Loader size="sm" /></Center>
      ) : (
        <Stack gap={40}>
          {/* The workspace being bought for is the one selected in the sidebar.
              Not restated here: the sidebar already shows it, and the usage
              panel below is visibly about one workspace. */}
          {usage && <UsageSummary usage={usage} expired={expired} />}

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
          <Tabs
            value={tab}
            onChange={(v) => v && setTab(v as BillingTab)}
            variant="pills"
            color="emerald"
            keepMounted={false}
          >
            <Tabs.List mb="xl">
              <Tabs.Tab value="plans" leftSection={<Layers size={15} />}>{t("billing.tabPlans")}</Tabs.Tab>
              <Tabs.Tab value="addons" leftSection={<ShoppingCart size={15} />}>{t("billing.tabAddons")}</Tabs.Tab>
              <Tabs.Tab value="history" leftSection={<Receipt size={15} />}>
                {t("billing.tabHistory")}
              </Tabs.Tab>
            </Tabs.List>

          <Tabs.Panel value="plans">
          <div>
            <Group justify="space-between" align="center" mb="lg" wrap="wrap">
              <div>
                <Title order={3} style={{ letterSpacing: "-0.01em" }}>{t("billing.plansTitle")}</Title>
                <Text size="sm" c="dimmed" mt={2}>{t("billing.plansSubtitle")}</Text>
              </div>
              <Group gap="sm" wrap="wrap">
                <SegmentedControl
                  size="sm"
                  radius="md"
                  value={currency}
                  onChange={(v) => changeCurrency(v as Currency)}
                  data={CURRENCIES.map((c) => ({ label: c, value: c }))}
                />
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
                <Tooltip label={t("billing.refetchPrices")}>
                  <ActionIcon
                    variant="light"
                    color="gray"
                    size="lg"
                    radius="md"
                    loading={refetching}
                    onClick={() => { refetchPlans(); refetchAddons(); }}
                  >
                    <RefreshCw size={15} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: Math.min(plans.length, 4) || 1 }} spacing="lg">
              {plans.map((plan) => {
                const price = priceIn(cycle === "yearly" ? plan.priceYearly : plan.priceMonthly, currency);
                // Free (or any zero-price plan) is assigned directly, not
                // bought — it stays "current" once assigned and never expires,
                // so there's nothing to re-buy.
                const buyable = price > 0;
                const current = usage?.plan.slug === plan.slug && !expired;
                const featured = plan.slug === featuredSlug && !current;
                return (
                  <Card
                    key={plan.slug}
                    withBorder
                    radius="lg"
                    padding="lg"
                    className="static-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      // The ribbon is positioned against this box and bleeds
                      // past the rounded corner, so the card cannot clip it.
                      position: "relative",
                      overflow: "visible",
                      // Only the recommended card takes a coloured border. The
                      // current plan is marked by its ribbon and its button —
                      // a third emerald marker was saying the same thing again
                      // and made every card look equally emphasised.
                      borderColor: featured
                        ? PLAN_ACCENTS[plan.slug] ?? RIBBON_FALLBACK
                        : undefined,
                    }}
                  >
                    {/* Both flags render in the plan's own tier colour rather
                        than the app's emerald: emerald is the accent for
                        everything else on screen, so using it here left the
                        ribbon indistinguishable from ordinary chrome. */}
                    {(featured || current) && (
                      <CornerRibbon
                        label={current ? t("billing.ribbonCurrent") : t("billing.ribbonRecommended")}
                        color={PLAN_ACCENTS[plan.slug] ?? RIBBON_FALLBACK}
                        background={PLAN_GRADIENTS[plan.slug]}
                        fg={PLAN_ON_ACCENT[plan.slug] ?? "#fff"}
                      />
                    )}

                    <Group gap={12} wrap="nowrap" align="center">
                      <PlanIcon slug={plan.slug} size={38} uid={`card-${plan.slug}`} />
                      <div style={{ minWidth: 0 }}>
                        <Text fw={700} fz={17} style={{ letterSpacing: "-0.01em" }}>
                          {plan.name}
                        </Text>
                        {plan.description && (
                          <Text size="xs" c="dimmed" lh={1.4} lineClamp={2}>
                            {plan.description}
                          </Text>
                        )}
                      </div>
                    </Group>

                    <Group gap={5} align="baseline" mt="lg">
                      <Text fz={34} fw={800} style={{ letterSpacing: "-0.03em" }}>{money(price)}</Text>
                      {buyable && (
                        <Text size="sm" c="dimmed">/ {cycle === "yearly" ? t("billing.perYear") : t("billing.perMonth")}</Text>
                      )}
                    </Group>

                    {/* What yearly actually saves, in money rather than in
                        "save 2 months" — the toggle already says that, and a
                        figure is what makes the case. */}
                    {buyable && cycle === "yearly" ? (
                      <Text size="xs" c="emerald" fw={600} mt={2}>
                        {t("billing.savesPerYear", {
                          amount: money(priceIn(plan.priceMonthly, currency) * 12 - price),
                        })}
                      </Text>
                    ) : (
                      <Text size="xs" c="transparent" mt={2}>.</Text>
                    )}

                    <Divider my="md" />

                    <Stack gap={8} mb="lg" style={{ flex: 1 }}>
                      {/* Sites are capped the same on every tier — it is a
                          property of a workspace, not of a plan — so it is
                          stated once here rather than sold as a differentiator. */}
                      <FeatureLine text={t("billing.featureSites", { count: MAX_SITES_PER_WORKSPACE })} />
                      <FeatureLine text={t("billing.featureAudits", { count: plan.monthlyAuditQuota })} />
                      <FeatureLine text={t("billing.featureCrawls", { count: plan.monthlyCrawlQuota })} />
                      {plan.features.map((f) => <FeatureLine key={f} text={f} />)}
                    </Stack>

                    <Button
                      fullWidth
                      size="md"
                      radius="md"
                      color="emerald"
                      variant={current ? "light" : featured ? "filled" : "outline"}
                      disabled={current || !buyable || isDemo || !selectedWorkspaceId}
                      loading={subscribing === plan.slug}
                      leftSection={<CreditCard size={15} />}
                      // The recommended plan's button carries that plan's
                      // colour rather than the shared accent, so the card the
                      // page is steering toward is visually one thing.
                      style={
                        featured
                          ? {
                              background:
                                PLAN_GRADIENTS[plan.slug] ??
                                PLAN_ACCENTS[plan.slug] ??
                                RIBBON_FALLBACK,
                              // The gold ramp is too light for white text —
                              // the label has to follow the fill.
                              color: PLAN_ON_ACCENT[plan.slug] ?? "#fff",
                              border: "none",
                            }
                          : undefined
                      }
                      onClick={() => { setPlanCoupon(null); setConfirmPlan(plan); }}
                    >
                      {isDemo ? t("billing.ctaSignUpSubscribe")
                        : current ? t("billing.ctaCurrentPlan")
                        : !buyable ? t("billing.ctaIncludedFree")
                        : usage?.plan.slug === plan.slug ? t("billing.ctaRenew")
                        : t("billing.ctaSubscribe")}
                    </Button>
                  </Card>
                );
              })}
            </SimpleGrid>
          </div>
          </Tabs.Panel>

          <Tabs.Panel value="addons">
          <div>
            <Group justify="space-between" align="center" mb="lg" wrap="wrap">
              <div>
                <Title order={3} style={{ letterSpacing: "-0.01em" }}>{t("billing.addonsTitle")}</Title>
                <Text size="sm" c="dimmed" mt={2}>
                  {t("billing.addonsSubtitle")}
                </Text>
              </div>
              <Group gap="sm" wrap="wrap">
                <SegmentedControl
                  size="sm"
                  radius="md"
                  value={currency}
                  onChange={(v) => changeCurrency(v as Currency)}
                  data={CURRENCIES.map((c) => ({ label: c, value: c }))}
                />
                {/* Refetches the packs *and* the usage behind the credit
                    balances below — someone who just spent a credit in another
                    tab expects this to move both numbers, not only the price. */}
                <Tooltip label={t("billing.refetchPrices")}>
                  <ActionIcon
                    variant="light"
                    color="gray"
                    size="lg"
                    radius="md"
                    loading={addonsFetching || usageFetching}
                    onClick={() => { refetchAddons(); refetchUsage(); }}
                  >
                    <RefreshCw size={15} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>

            {/* Credits on hand, shown here rather than only in the usage panel
                above: on the tab where someone is deciding whether to buy more,
                what they already have is the deciding number. */}
            {usage && (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" mb="lg">
                <CreditBalance
                  icon={Search}
                  label={t("billing.auditCredits")}
                  planLeft={Math.max(0, usage.audits.planQuota - usage.audits.used)}
                  addonCredits={usage.audits.addonCredits}
                />
                <CreditBalance
                  icon={Globe2}
                  label={t("billing.crawlCredits")}
                  planLeft={Math.max(0, usage.crawls.planQuota - usage.crawls.used)}
                  addonCredits={usage.crawls.addonCredits}
                />
                {usage.orbit && (
                  <CreditBalance
                    icon={OrbitMark}
                    label={t("billing.orbitCredits")}
                    planLeft={Math.max(0, usage.orbit.planQuota - usage.orbit.used)}
                    addonCredits={usage.orbit.addonCredits}
                  />
                )}
              </SimpleGrid>
            )}

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {addons.map((pack) => (
                <Card key={pack._id} withBorder radius="lg" padding="lg">
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <div>
                      <Text fw={650} size="md">{pack.name}</Text>
                      <Text size="sm" c="dimmed" mt={2}>
                        {t("billing.packQuantity", {
                          n: pack.quantity,
                          type: creditType(t, pack.type, pack.quantity),
                        })}
                      </Text>
                    </div>
                    <ThemeIcon size={38} radius="md" variant="light" color="emerald">
                      {pack.type === "audit" ? <Search size={17} /> : <Globe2 size={17} />}
                    </ThemeIcon>
                  </Group>
                  <Divider my="md" />
                  <Group justify="space-between" align="center">
                    <Text fz={22} fw={700} style={{ letterSpacing: "-0.02em" }}>{money(priceIn(pack.price, currency))}</Text>
                    <Button
                      size="sm"
                      radius="md"
                      variant="outline"
                      color="emerald"
                      disabled={isDemo || !selectedWorkspaceId}
                      loading={buying === pack._id}
                      onClick={() => { setAddonCoupon(null); setConfirmAddon(pack); }}
                    >
                      {isDemo ? t("billing.ctaSignUpBuy") : t("billing.ctaBuy")}
                    </Button>
                  </Group>
                </Card>
              ))}
              {!addons.length && (
                <Text size="sm" c="dimmed">{t("billing.noAddons")}</Text>
              )}
            </SimpleGrid>
          </div>
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
          </Tabs>
        </Stack>
      )}

      <PlanCheckoutModal
        plan={confirmPlan}
        cycle={cycle}
        currency={currency}
        addons={addons}
        coupon={planCoupon}
        onCoupon={setPlanCoupon}
        busy={!!confirmPlan && subscribing === confirmPlan.slug}
        onClose={() => setConfirmPlan(null)}
        onConfirm={doSubscribe}
      />

      <AddonCheckoutModal
        pack={confirmAddon}
        currency={currency}
        coupon={addonCoupon}
        onCoupon={setAddonCoupon}
        busy={!!confirmAddon && buying === confirmAddon._id}
        onClose={() => setConfirmAddon(null)}
        onConfirm={doBuyAddon}
      />

      <Modal
        opened={!!cancelled}
        onClose={() => setCancelled(null)}
        centered
        radius="lg"
        withCloseButton={false}
        size="sm"
      >
        <Stack align="center" gap="sm" py="md">
          <ThemeIcon size={56} radius="xl" variant="light" color="gray">
            <X size={26} />
          </ThemeIcon>
          <Title order={3} ta="center" style={{ letterSpacing: "-0.01em" }}>
            {t("billing.cancelledTitle")}
          </Title>
          <Text size="sm" c="dimmed" ta="center" maw={280}>
            {cancelled
              ? t("billing.cancelledBodyNamed", { what: cancelled })
              : t("billing.cancelledBody")}
          </Text>
          <Button variant="light" color="gray" radius="md" mt="sm" onClick={() => setCancelled(null)}>
            {t("common.close")}
          </Button>
        </Stack>
      </Modal>

      <Modal
        opened={!!celebration}
        onClose={() => setCelebration(null)}
        centered
        radius="lg"
        withCloseButton={false}
        size="sm"
      >
        {celebration && (
          <Stack align="center" gap="sm" py="md">
            <ThemeIcon size={56} radius="xl" variant="light" color="emerald">
              <PartyPopper size={26} />
            </ThemeIcon>
            <Title order={3} ta="center" style={{ letterSpacing: "-0.01em" }}>
              {celebration.kind === "plan"
                ? t("billing.celebrationPlanTitle")
                : t("billing.celebrationAddonTitle")}
            </Title>
            <Text size="sm" c="dimmed" ta="center" maw={280}>
              {celebration.kind === "plan" ? (
                <>
                  {t("billing.celebrationPlanBody", { plan: celebration.planName })}
                  {celebration.credits.length > 0 &&
                    t("billing.celebrationPlanExtra", {
                      extras: celebration.credits
                        .map((c) => `${c.credits} ${creditType(t, c.type, c.credits)}`)
                        .join(t("billing.and")),
                    })}
                </>
              ) : (
                t("billing.celebrationAddonBody", {
                  n: celebration.pack.quantity * celebration.packs,
                  type: creditType(
                    t,
                    celebration.pack.type,
                    celebration.pack.quantity * celebration.packs,
                  ),
                })
              )}
            </Text>
            <Button color="emerald" radius="md" mt="sm" onClick={() => setCelebration(null)}>
              {t("billing.letsGo")}
            </Button>
          </Stack>
        )}
      </Modal>
    </AppShell>
  );
}

/** Ribbon colour for a plan slug the tier palette doesn't know about. */
const RIBBON_FALLBACK = "#8b5cf6";

/**
 * A tab that sits on a card's top-right corner and folds behind it.
 *
 * A flag rather than a pill inside the card: a badge in the content area
 * competes with the plan name for the top line, while a ribbon reads as
 * annotation *about* the card and costs no layout inside it. The darker
 * triangle under the tail is the fold — without it the tab looks pasted on
 * rather than wrapped around.
 */
function CornerRibbon({
  label,
  color,
  background,
  fg = "#fff",
}: {
  label: string;
  /** Flat colour, and the colour the fold is derived from. */
  color: string;
  /** Optional gradient, matching the tier's icon. Falls back to `color`. */
  background?: string;
  /** Text colour. Not always white — see `PLAN_ON_ACCENT`. */
  fg?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: 14,
        right: -8,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: background ?? color,
          color: fg,
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          padding: "5px 10px",
          borderRadius: "4px 0 0 4px",
          // A notch cut into the left edge gives the tab its flag shape.
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 7px 50%)",
          paddingLeft: 16,
          whiteSpace: "nowrap",
          lineHeight: 1.2,
        }}
      >
        {label}
      </div>
      {/* The fold, tucked under the tail and darkened so it reads as shadow.
          Always the flat colour, never the gradient — a gradient across 8px
          reads as a colour mismatch rather than as a fold. */}
      <div
        style={{
          width: 8,
          height: 8,
          background: color,
          filter: "brightness(0.55)",
          clipPath: "polygon(0 0, 100% 0, 100% 100%)",
        }}
      />
    </div>
  );
}

/**
 * What's left to spend, split by where it came from.
 *
 * Plan quota and addon credits are kept apart rather than summed because they
 * behave differently: the plan's share resets at the end of the period and the
 * bought credits don't. A single total would hide the only fact that matters
 * when deciding whether to buy more.
 */
function CreditBalance({
  icon: Icon,
  label,
  planLeft,
  addonCredits,
}: {
  /**
   * A lucide icon, or the Orbit mark — which takes only `size`, so anything
   * rendered here must not depend on the icon accepting `style`.
   */
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  planLeft: number;
  addonCredits: number;
}) {
  const { t } = useTranslation();
  const total = planLeft + addonCredits;
  return (
    <Card withBorder radius="md" padding="md" className="static-card">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Group gap={6} mb={4}>
            {/* Colour on the wrapper rather than the icon: a lucide glyph
                inherits `currentColor`, and the Orbit mark — which is a logo,
                not a glyph — correctly ignores it. */}
            <Box component="span" c="dimmed" display="inline-flex">
              <Icon size={13} />
            </Box>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: "0.02em" }}>
              {label}
            </Text>
          </Group>
          <Text fz={26} fw={800} style={{ letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            {total}
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {addonCredits > 0
              ? t("billing.creditsBought", { planLeft, addonCredits })
              : t("billing.creditsFromPlan", { planLeft })}
          </Text>
        </div>
        {total === 0 && (
          <Badge size="sm" variant="light" color="red" tt="none">{t("billing.out")}</Badge>
        )}
      </Group>
    </Card>
  );
}

/** How many of one pack a single checkout may include. Mirrors the server's cap. */
const MAX_PACKS = 50;

/**
 * The smallest order Razorpay will accept, in the currency's minor unit.
 *
 * Mirrored from the server, which floors every order at the same figure. Shown
 * rather than silently applied: a 99% coupon that lands below this still gets
 * charged this, and a total on screen that differs from the amount in the
 * payment window reads as a bug.
 */
const MIN_CHARGE = 100;

/**
 * A quantity stepper.
 *
 * Buttons rather than a bare number input because the common moves are "one
 * more" and "one fewer", and because a free-text field invites values the
 * server will reject. Typing is still allowed for the person who wants ten.
 */
function PackStepper({
  value,
  onChange,
  disabled,
  min = 0,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  /** Floor. The plan dialog allows zero; the addon dialog needs at least one. */
  min?: number;
}) {
  const { t } = useTranslation();
  const clamp = (n: number) => Math.max(min, Math.min(MAX_PACKS, n));

  // One joined control rather than three spaced ones: a single 30px-tall
  // segmented block reads as one widget and stops the buttons and the field
  // from disagreeing about their heights.
  const H = 30;

  const step = (delta: number, label: string, disabledWhen: boolean) => (
    <UnstyledButton
      aria-label={label}
      disabled={disabled || disabledWhen}
      onClick={() => onChange(clamp(value + delta))}
      style={{
        width: H,
        height: H,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: disabled || disabledWhen
          ? "var(--mantine-color-dimmed)"
          : "var(--mantine-color-text)",
        cursor: disabled || disabledWhen ? "not-allowed" : "pointer",
        opacity: disabled || disabledWhen ? 0.4 : 1,
      }}
    >
      {delta < 0 ? <Minus size={13} /> : <Plus size={13} />}
    </UnstyledButton>
  );

  return (
    <Group
      gap={0}
      wrap="nowrap"
      style={{
        border: "1px solid var(--mantine-color-default-border)",
        borderRadius: 8,
        overflow: "hidden",
        height: H,
      }}
    >
      {step(-1, t("billing.oneFewer"), value <= min)}
      <NumberInput
        value={value}
        onChange={(v) => onChange(clamp(Number(v) || 0))}
        min={min}
        max={MAX_PACKS}
        clampBehavior="strict"
        hideControls
        disabled={disabled}
        size="xs"
        styles={{
          input: {
            width: 34,
            height: H,
            minHeight: H,
            textAlign: "center",
            fontWeight: 650,
            fontSize: 13,
            // The border is on the wrapper; an inner one would double up.
            border: "none",
            borderLeft: "1px solid var(--mantine-color-default-border)",
            borderRight: "1px solid var(--mantine-color-default-border)",
            borderRadius: 0,
            padding: 0,
            background: "transparent",
          },
        }}
      />
      {step(1, t("billing.oneMore"), value >= MAX_PACKS)}
    </Group>
  );
}

/**
 * Plan checkout: the plan, any addon packs bought alongside it, a coupon, and
 * one total.
 *
 * Addons live here rather than only in their own dialog because the moment
 * someone has decided to pay is the moment topping up costs them nothing extra
 * — one payment, one receipt, instead of a second trip through Razorpay. They
 * are offered prominently and default to none: a required addon is just a
 * higher price with more clicks, and it turns a working checkout into one
 * people abandon.
 *
 * Every figure shown is computed from the catalogue the same way the server
 * computes it. The client still sends only slugs and counts — the price it
 * displays is a preview, never the amount charged.
 */
function PlanCheckoutModal({
  plan,
  cycle,
  currency,
  addons,
  coupon,
  onCoupon,
  busy,
  onClose,
  onConfirm,
}: {
  plan: Plan | null;
  cycle: BillingCycle;
  currency: Currency;
  addons: AddonPack[];
  coupon: CouponCheckResult | null;
  onCoupon: (result: CouponCheckResult | null) => void;
  busy: boolean;
  onClose: () => void;
  onConfirm: (plan: Plan, selection: AddonSelection) => void;
}) {
  const { t } = useTranslation();
  const [selection, setSelection] = useState<AddonSelection>({});

  // Reset when a different plan is picked, so quantities chosen for one plan
  // don't silently carry into the next dialog.
  useEffect(() => {
    if (plan) setSelection({});
  }, [plan?.slug]);

  if (!plan) return <Modal opened={false} onClose={onClose} children={null} />;

  const money = (amountMinor: number) => formatMoney(amountMinor, currency);
  const planPrice = priceIn(cycle === "yearly" ? plan.priceYearly : plan.priceMonthly, currency);
  const isFreePlan =
    priceIn(plan.priceMonthly, currency) === 0 && priceIn(plan.priceYearly, currency) === 0;

  const chosen = addons
    .map((pack) => ({ pack, packs: selection[pack.slug] ?? 0 }))
    .filter((row) => row.packs > 0);

  const addonTotal = chosen.reduce(
    (sum, { pack, packs }) => sum + priceIn(pack.price, currency) * packs,
    0,
  );

  const subtotal = planPrice + addonTotal;
  // The coupon is checked against the plan price alone (that is what the field
  // was given), so its percentage is re-applied to the real subtotal here —
  // otherwise adding a pack after entering a code would show a discount that
  // covers only part of what is being bought.
  const percentOff = coupon?.coupon?.percentOff ?? 0;
  const total = percentOff ? Math.floor((subtotal * (100 - percentOff)) / 100) : subtotal;

  // A free plan with no packs needs no payment. Add a pack and it becomes a
  // real charge, which is why this tracks the total rather than the plan.
  const noCharge = total === 0 && !chosen.length;

  // What Razorpay will actually be asked for. The server floors the order the
  // same way, so showing the raw total here would understate the charge on a
  // heavily discounted order.
  const chargeable = noCharge ? 0 : Math.max(total, MIN_CHARGE);

  // Total credits this checkout grants, per type — the thing the buyer is
  // actually choosing, summarised once rather than left to be added up across
  // rows.
  const creditTotals = chosen.reduce<Record<string, number>>((acc, { pack, packs }) => {
    acc[pack.type] = (acc[pack.type] ?? 0) + pack.quantity * packs;
    return acc;
  }, {});

  return (
    <Modal
      opened
      onClose={onClose}
      title={<Text fw={700}>{t("billing.confirmSubscription")}</Text>}
      centered
      radius="lg"
      size={980}
    >
      <Grid gap="lg">
        {/* Left: what's being bought and what can be added to it. */}
        <Grid.Col span={{ base: 12, sm: 7 }}>
          <Stack gap="md">
            <Card withBorder radius="md" padding="md" className="static-card">
              <Group justify="space-between" wrap="nowrap">
                <Group gap={12} wrap="nowrap">
                  <PlanIcon slug={plan.slug} size={36} uid={`checkout-${plan.slug}`} />
                  <div>
                    <Text fw={700}>{t("billing.planNamed", { plan: plan.name })}</Text>
                    <Text size="xs" c="dimmed">
                      {t(
                        cycle === "yearly"
                          ? "billing.billedCycleYearly"
                          : "billing.billedCycleMonthly",
                        { audits: plan.monthlyAuditQuota, crawls: plan.monthlyCrawlQuota },
                      )}
                    </Text>
                  </div>
                </Group>
                <Text fz={20} fw={700} style={{ whiteSpace: "nowrap" }}>{money(planPrice)}</Text>
              </Group>
            </Card>

            {addons.length > 0 && (
              <div>
                <Group gap={8} mb={2}>
                  <Text size="sm" fw={650}>{t("billing.addExtraCredits")}</Text>
                  <Badge size="xs" variant="light" color="gray" tt="none">{t("billing.optional")}</Badge>
                </Group>
                <Text size="xs" c="dimmed" mb="sm">
                  {t("billing.addCreditsDesc")}
                </Text>

                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
                  {addons.map((pack) => {
                    const packs = selection[pack.slug] ?? 0;
                    const unit = priceIn(pack.price, currency);
                    const picked = packs > 0;
                    return (
                      <Card
                        key={pack._id}
                        withBorder
                        radius="md"
                        padding="md"
                        className="static-card"
                        style={{
                          // A chosen card is outlined rather than merely
                          // annotated: with several packs on screen, "which
                          // ones did I pick" should be answerable at a glance.
                          borderColor: picked ? "var(--mantine-color-emerald-6)" : undefined,
                          transition: "border-color 120ms ease",
                        }}
                      >
                        <Stack gap="sm">
                          <Group gap={10} wrap="nowrap">
                            <ThemeIcon size={34} radius="md" variant="light" color="emerald">
                              {pack.type === "audit" ? <Search size={16} /> : <Globe2 size={16} />}
                            </ThemeIcon>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <Text size="sm" fw={650} truncate>{pack.name}</Text>
                              <Text size="xs" c="dimmed">
                                {t("billing.packUnit", {
                                  n: pack.quantity,
                                  type: creditType(t, pack.type, pack.quantity),
                                  price: money(unit),
                                })}
                              </Text>
                            </div>
                          </Group>

                          <Group justify="space-between" wrap="nowrap">
                            <PackStepper
                              value={packs}
                              disabled={busy}
                              onChange={(v) =>
                                setSelection((prev) => ({ ...prev, [pack.slug]: v }))
                              }
                            />
                            <Text
                              size="sm"
                              fw={700}
                              c={picked ? undefined : "dimmed"}
                              style={{ whiteSpace: "nowrap" }}
                            >
                              {money(unit * packs)}
                            </Text>
                          </Group>

                          {/* Reserved height whether or not a pack is picked,
                              so stepping up and down doesn't make the grid
                              jump under the cursor. */}
                          <Text size="xs" c={picked ? "emerald" : "transparent"} fw={600} mt={-4}>
                            {picked
                              ? t("billing.packAdded", {
                                  n: pack.quantity * packs,
                                  type: creditType(t, pack.type, pack.quantity * packs),
                                })
                              : " "}
                          </Text>
                        </Stack>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              </div>
            )}
          </Stack>
        </Grid.Col>

        {/* Right: coupon, the money, and the commit button. */}
        <Grid.Col span={{ base: 12, sm: 5 }}>
          <Card withBorder radius="md" padding="md" className="static-card" bg="var(--mantine-color-body)">
            <Stack gap="md">
              <Text size="sm" fw={700}>{t("billing.orderSummary")}</Text>

              {!isFreePlan && (
                <CouponField amount={subtotal} result={coupon} onChange={onCoupon} />
              )}

              <Divider />

              <Stack gap={8}>
                <Group justify="space-between" wrap="nowrap">
                  <Text size="sm" c="dimmed">{t("billing.planNamed", { plan: plan.name })}</Text>
                  <Text size="sm" fw={600} style={{ whiteSpace: "nowrap" }}>{money(planPrice)}</Text>
                </Group>

                {chosen.map(({ pack, packs }) => (
                  <Group key={pack._id} justify="space-between" wrap="nowrap">
                    <Text size="sm" c="dimmed" truncate>
                      {t("billing.packTimes", { name: pack.name, packs })}
                    </Text>
                    <Text size="sm" fw={600} style={{ whiteSpace: "nowrap" }}>
                      {money(priceIn(pack.price, currency) * packs)}
                    </Text>
                  </Group>
                ))}

                {percentOff > 0 && (
                  <>
                    <Divider variant="dashed" my={2} />
                    <Group justify="space-between" wrap="nowrap">
                      <Text size="sm" c="dimmed">{t("billing.subtotal")}</Text>
                      <Text size="sm" style={{ whiteSpace: "nowrap" }}>{money(subtotal)}</Text>
                    </Group>
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap={6} wrap="nowrap">
                        <Tag size={12} />
                        <Text size="sm" c="dimmed" truncate>
                          {t("billing.couponOff", {
                            code: coupon?.coupon?.code,
                            percent: percentOff,
                          })}
                        </Text>
                      </Group>
                      <Text size="sm" c="emerald" fw={600} style={{ whiteSpace: "nowrap" }}>
                        − {money(subtotal - total)}
                      </Text>
                    </Group>
                  </>
                )}
              </Stack>

              <Divider />

              <Group justify="space-between" align="flex-end" wrap="nowrap">
                <Text fw={700}>{t("billing.total")}</Text>
                <Text fz={26} fw={800} style={{ letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
                  {money(chargeable)}
                </Text>
              </Group>

              {/* A coupon can discount below what Razorpay will accept as an
                  order. Saying so here is the difference between a surprising
                  charge and an explained one. */}
              {chargeable > total && (
                <Text size="xs" c="dimmed" mt={-6}>
                  {t("billing.minimumCharge", { amount: money(MIN_CHARGE) })}
                </Text>
              )}

              {Object.keys(creditTotals).length > 0 && (
                <Card withBorder radius="sm" padding="xs" className="static-card" bg="var(--mantine-color-default-hover)">
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>
                    {t("billing.creditsIncluded")}
                  </Text>
                  <Stack gap={2}>
                    {Object.entries(creditTotals).map(([type, credits]) => (
                      <Group key={type} justify="space-between" gap={6}>
                        <Text size="xs" c="dimmed">{creditType(t, type, credits)}</Text>
                        <Text size="xs" fw={700} c="emerald">+{credits}</Text>
                      </Group>
                    ))}
                  </Stack>
                </Card>
              )}

              <Button
                fullWidth
                size="md"
                color="emerald"
                leftSection={<CreditCard size={16} />}
                loading={busy}
                onClick={() => onConfirm(plan, selection)}
              >
                {noCharge ? t("billing.confirm") : t("billing.payAmount", { amount: money(chargeable) })}
              </Button>

              <Button fullWidth variant="subtle" color="gray" onClick={onClose} disabled={busy}>
                {t("common.cancel")}
              </Button>

              <Text size="xs" c="dimmed" ta="center">
                {noCharge
                  ? t("billing.planIsFree")
                  : t(
                      cycle === "yearly"
                        ? "billing.oneTimeChargeYear"
                        : "billing.oneTimeChargeMonth",
                    )}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Modal>
  );
}

/**
 * Addon checkout, bought on its own rather than alongside a plan.
 *
 * Same quantity model as the plan dialog, so the two agree on what "× 3" means
 * and on the cap.
 */
function AddonCheckoutModal({
  pack,
  currency,
  coupon,
  onCoupon,
  busy,
  onClose,
  onConfirm,
}: {
  pack: AddonPack | null;
  currency: Currency;
  coupon: CouponCheckResult | null;
  onCoupon: (result: CouponCheckResult | null) => void;
  busy: boolean;
  onClose: () => void;
  onConfirm: (pack: AddonPack, packs: number) => void;
}) {
  const { t } = useTranslation();
  const [packs, setPacks] = useState(1);

  useEffect(() => {
    if (pack) setPacks(1);
  }, [pack?._id]);

  if (!pack) return <Modal opened={false} onClose={onClose} children={null} />;

  const money = (amountMinor: number) => formatMoney(amountMinor, currency);
  const unit = priceIn(pack.price, currency);
  const subtotal = unit * packs;
  const percentOff = coupon?.coupon?.percentOff ?? 0;
  const total = percentOff ? Math.floor((subtotal * (100 - percentOff)) / 100) : subtotal;
  // Same Razorpay floor the server applies — see MIN_CHARGE.
  const chargeable = Math.max(total, MIN_CHARGE);

  return (
    <Modal
      opened
      onClose={onClose}
      title={<Text fw={700}>{t("billing.confirmPurchase")}</Text>}
      centered
      radius="lg"
    >
      <Stack gap="lg">
        <Group justify="space-between" wrap="nowrap">
          <Group gap={10} wrap="nowrap">
            <ThemeIcon size={38} radius="md" variant="light" color="emerald">
              {pack.type === "audit" ? <Search size={17} /> : <Globe2 size={17} />}
            </ThemeIcon>
            <div>
              <Text fw={650}>{pack.name}</Text>
              <Text size="xs" c="dimmed">
                {t("billing.packUnitPerPack", {
                  n: pack.quantity,
                  type: creditType(t, pack.type, pack.quantity),
                  price: money(unit),
                })}
              </Text>
            </div>
          </Group>
        </Group>

        <Group justify="space-between">
          <div>
            <Text size="sm" fw={600}>{t("billing.howManyPacks")}</Text>
            <Text size="xs" c="emerald" fw={600}>
              {t("billing.packTotal", {
                n: pack.quantity * packs,
                type: creditType(t, pack.type, pack.quantity * packs),
              })}
            </Text>
          </div>
          <PackStepper
            value={packs}
            disabled={busy}
            // At least one — this dialog exists to buy something, and a zero
            // here would leave the confirm button doing nothing.
            min={1}
            onChange={setPacks}
          />
        </Group>

        <CouponField amount={subtotal} result={coupon} onChange={onCoupon} />

        <Divider />

        <Stack gap={6}>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">{t("billing.packTimes", { name: pack.name, packs })}</Text>
            <Text size="sm">{money(subtotal)}</Text>
          </Group>

          {percentOff > 0 && (
            <Group justify="space-between">
              <Group gap={6}>
                <Tag size={12} />
                <Text size="sm" c="dimmed">
                  {t("billing.couponOff", { code: coupon?.coupon?.code, percent: percentOff })}
                </Text>
              </Group>
              <Text size="sm" c="emerald">− {money(subtotal - total)}</Text>
            </Group>
          )}

          <Divider my={4} />

          <Group justify="space-between">
            <Text fw={700}>Total</Text>
            <Text fz={24} fw={800} style={{ letterSpacing: "-0.02em" }}>{money(chargeable)}</Text>
          </Group>

          {chargeable > total && (
            <Text size="xs" c="dimmed">
              {t("billing.minimumCharge", { amount: money(MIN_CHARGE) })}
            </Text>
          )}
        </Stack>

        <Text size="xs" c="dimmed">
          {t("billing.addonOneTime")}
        </Text>

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose} disabled={busy}>{t("common.cancel")}</Button>
          <Button
            color="emerald"
            leftSection={<ShoppingCart size={15} />}
            loading={busy}
            onClick={() => onConfirm(pack, packs)}
          >
            {t("billing.payAmount", { amount: money(chargeable) })}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

/**
 * Billing history: this workspace's completed purchases, with their receipts.
 *
 * Scoped to the workspace being viewed, like everything else on this page —
 * an account with several workspaces was otherwise shown the same combined
 * list under each one, with no way to tell which purchase belonged where.
 *
 * The same PDF was already emailed when the payment landed, so this is the
 * copy for six months later, when that email is buried — which is exactly when
 * someone needs it for an expense claim. Nothing here can be acted on except
 * downloading, so it sits at the bottom, below the things that cost money.
 */
function Receipts({ workspaceId }: { workspaceId: string }) {
  const { t } = useTranslation();
  const { data: invoices = [], isLoading, isFetching, refetch } = useGetInvoicesQuery(
    { workspaceId },
    { skip: !workspaceId },
  );
  const [downloading, setDownloading] = useState<string | null>(null);

  /**
   * Fetched directly rather than through RTK Query: the response is a binary
   * attachment, not JSON to cache, and it still needs the auth header — the
   * same reason the events export bypasses the store.
   */
  const download = async (invoice: Invoice) => {
    setDownloading(invoice.id);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE}/api/billing/invoices/${invoice.kind}/${invoice.id}/pdf`,
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      );
      if (!res.ok) throw new Error(`Download failed (${res.status})`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      notify.error(t("billing.downloadError"));
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <Group justify="space-between" align="center" mb="lg">
        <div>
          <Title order={3} style={{ letterSpacing: "-0.01em" }}>{t("billing.receiptsTitle")}</Title>
          <Text size="sm" c="dimmed" mt={2}>
            {t("billing.receiptsSubtitle")}
          </Text>
        </div>
        {/* A receipt appears only once the webhook has credited the payment,
            which can land a moment after checkout closes — so the first thing
            someone does when a just-bought receipt is missing is look for this. */}
        <Tooltip label={t("billing.refetchReceipts")}>
          <ActionIcon
            variant="light"
            color="gray"
            size="lg"
            radius="md"
            loading={isFetching}
            onClick={() => refetch()}
          >
            <RefreshCw size={15} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Card withBorder radius="lg" padding={0} style={{ overflow: "hidden" }}>
        {isLoading ? (
          <Center py={40}><Loader size="sm" /></Center>
        ) : !invoices.length ? (
          <Stack align="center" gap={6} py={40} px="md">
            <ThemeIcon size={42} radius="xl" variant="light" color="gray">
              <Receipt size={20} />
            </ThemeIcon>
            <Text size="sm" c="dimmed" ta="center" maw={340}>
              {t("billing.noReceipts")}
            </Text>
          </Stack>
        ) : (
          <Table.ScrollContainer minWidth={560}>
            <Table verticalSpacing="sm" horizontalSpacing="lg">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t("billing.colReceipt")}</Table.Th>
                  <Table.Th>{t("billing.colDate")}</Table.Th>
                  <Table.Th>{t("billing.colItem")}</Table.Th>
                  <Table.Th ta="right">{t("billing.colAmount")}</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {invoices.map((inv) => (
                  <Table.Tr key={`${inv.kind}-${inv.id}`}>
                    <Table.Td>
                      <Text size="sm" fw={600} ff="monospace">{inv.number}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {new Date(inv.issuedAt).toLocaleDateString(undefined, {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={8} wrap="nowrap">
                        <Badge size="sm" variant="light" color={inv.kind === "plan" ? "emerald" : "gray"} tt="none">
                          {inv.kind === "plan" ? t("billing.kindPlan") : t("billing.kindAddon")}
                        </Badge>
                        <Text size="sm">{inv.description}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm" fw={650}>{formatMoney(inv.amount, inv.currency)}</Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Tooltip label={t("billing.downloadPdf")}>
                        <ActionIcon
                          variant="light"
                          color="gray"
                          radius="md"
                          loading={downloading === inv.id}
                          onClick={() => download(inv)}
                        >
                          <Download size={15} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      <Text size="xs" c="dimmed" mt="sm">
        {t("billing.notTaxInvoices")}
      </Text>
    </div>
  );
}

/**
 * The hero usage panel: current plan, renewal date, and progress toward each
 * quota. Sits above the pricing grid so "what am I on, and how close to the
 * edge" is answered before "what could I switch to."
 */
function UsageSummary({
  usage,
  expired,
}: {
  usage: NonNullable<QuotaSummary>;
  expired: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Card
      withBorder
      radius="lg"
      padding={0}
      style={{ overflow: "hidden" }}
    >
      <Box
        p="lg"
        style={{
          background: expired
            ? "color-mix(in srgb, var(--mantine-color-red-6) 8%, transparent)"
            : "linear-gradient(135deg, color-mix(in srgb, var(--violet-2) 10%, transparent), transparent)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Group gap="sm" wrap="nowrap">
            <Box
              style={{
                width: 44, height: 44, borderRadius: 10, display: "flex",
                alignItems: "center", justifyContent: "center",
                background: "var(--bg-2)", border: "1px solid var(--border)",
              }}
            >
              <PlanIcon slug={usage.plan.slug} size={26} uid="hero" />
            </Box>
            <div>
              <Group gap={8}>
                <Text fw={700} size="lg">{t("billing.planNamed", { plan: usage.plan.name })}</Text>
                <Badge size="sm" variant="light" color={expired ? "red" : "emerald"} tt="none">
                  {expired ? t("billing.statusExpired") : t("billing.statusActive")}
                </Badge>
              </Group>
              {usage.currentPeriodEnd && (
                <Group gap={5} mt={2}>
                  <Clock size={12} style={{ color: "var(--muted, var(--mantine-color-dimmed))" }} />
                  <Text size="xs" c="dimmed">
                    {t(expired ? "billing.expiredOn" : "billing.renewsOn", {
                      date: new Date(usage.currentPeriodEnd).toLocaleDateString(undefined, {
                        day: "numeric", month: "short", year: "numeric",
                      }),
                    })}
                    {t("billing.billedSuffix", {
                      cycle: t(
                        usage.cycle === "yearly"
                          ? "billing.cycleYearlyWord"
                          : "billing.cycleMonthlyWord",
                      ),
                    })}
                  </Text>
                </Group>
              )}
            </div>
          </Group>
        </Group>
      </Box>

      {expired && (
        <Box p="md" style={{ borderBottom: "1px solid var(--border)" }}>
          <Alert variant="light" color="red" icon={<Info size={16} />} radius="md" p="sm">
            <Text size="sm">
              {t("billing.expiredNotice")}
            </Text>
          </Alert>
        </Box>
      )}

      {/* Workspaces are no longer an allowance to spend — an account may have as
          many as it pays for — so the panel reports this workspace's own audits,
          crawls, sites, and the Orbit questions its plan includes. */}
      <SimpleGrid cols={{ base: 1, sm: usage.orbit ? 4 : 3 }} spacing={0}>
        <UsageCell icon={Search} label={t("billing.usageAudits")} used={usage.audits.used} quota={usage.audits.planQuota} credits={usage.audits.addonCredits} />
        <UsageCell icon={Globe2} label={t("billing.usageCrawls")} used={usage.crawls.used} quota={usage.crawls.planQuota} credits={usage.crawls.addonCredits} />
        <UsageCell icon={Layers} label={t("billing.usageSites")} used={usage.sites.used} quota={usage.sites.quota} />
        {usage.orbit && (
          <UsageCell icon={OrbitMark} label={t("billing.usageOrbit")} used={usage.orbit.used} quota={usage.orbit.planQuota} credits={usage.orbit.addonCredits} />
        )}
      </SimpleGrid>
    </Card>
  );
}

function UsageCell({
  icon: Icon, label, used, quota, credits,
}: {
  /** A lucide icon, or the Orbit mark — so `size` is the only prop relied on. */
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  /** Null when the number is a flat limit rather than a used/quota pair (sites per workspace). */
  used: number | null;
  quota: number;
  credits?: number;
}) {
  const { t } = useTranslation();
  const total = quota + (credits ?? 0);
  const pct = used === null ? null : total > 0 ? Math.min(100, (used / total) * 100) : 100;
  const exhausted = pct !== null && pct >= 100;
  return (
    <Box p="lg" style={{ borderRight: "1px solid var(--border)", borderTop: "1px solid var(--border)" }}>
      <Group gap={6} mb={8}>
        <Box component="span" c="dimmed" display="inline-flex">
          <Icon size={14} />
        </Box>
        <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: "0.02em" }}>{label}</Text>
      </Group>
      {used === null ? (
        <Text fz={22} fw={700} style={{ letterSpacing: "-0.02em" }}>{quota}</Text>
      ) : (
        <>
          <Group gap={6} align="baseline">
            <Text fz={22} fw={700} style={{ letterSpacing: "-0.02em" }}>{used}</Text>
            <Text size="sm" c="dimmed">/ {total}</Text>
          </Group>
          {credits ? (
            <Text size="xs" c="dimmed" mt={2}>{t("billing.planPlusAddon", { quota, credits })}</Text>
          ) : null}
          <Progress value={pct ?? 0} color={exhausted ? (credits ? "yellow" : "red") : "emerald"} size={4} radius="xl" mt={8} />
        </>
      )}
    </Box>
  );
}

function FeatureLine({ text }: { text: string }) {
  return (
    <Group gap={8} wrap="nowrap">
      <ThemeIcon size={17} radius="xl" variant="light" color="emerald">
        <Check size={10} />
      </ThemeIcon>
      <Text size="sm" c="dimmed">{text}</Text>
    </Group>
  );
}

/**
 * A coupon code field that checks itself against the server as the user types
 * (debounced) and reports the result up — the parent modal owns the applied
 * result so it survives the field being edited again without losing the
 * price shown, and so checkout can read the final coupon code from one place.
 */
function CouponField({
  amount,
  result,
  onChange,
}: {
  amount: number;
  result: CouponCheckResult | null;
  onChange: (result: CouponCheckResult | null) => void;
}) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [checkCoupon, { isLoading }] = useCheckCouponMutation();

  useEffect(() => {
    const trimmed = code.trim();
    if (!trimmed) {
      onChange(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await checkCoupon({ amount, code: trimmed }).unwrap();
        onChange(res);
      } catch (e) {
        onChange({ amount, error: errMessage(e, t("billing.invalidCoupon")) });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, amount]);

  const applied = result?.coupon;

  if (applied) {
    return (
      <Group gap={6} wrap="nowrap">
        <Badge size="sm" variant="light" color="emerald" leftSection={<Tag size={11} />}>
          {t("billing.couponOff", { code: applied.code, percent: applied.percentOff })}
        </Badge>
        <Button
          size="compact-xs"
          variant="subtle"
          color="gray"
          onClick={() => { setCode(""); onChange(null); }}
        >
          <X size={12} />
        </Button>
      </Group>
    );
  }

  return (
    <TextInput
      placeholder={t("billing.couponPlaceholder")}
      size="sm"
      value={code}
      onChange={(e) => setCode(e.currentTarget.value.toUpperCase())}
      leftSection={<Tag size={14} />}
      rightSection={isLoading ? <Loader size={12} /> : undefined}
      error={result?.error}
    />
  );
}
