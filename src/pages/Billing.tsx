import { useEffect, useState } from "react";
import {
  Title, Text, Group, Button, Card, Badge, SimpleGrid, Stack, Center, Loader,
  SegmentedControl, Progress, ThemeIcon, Alert, Modal, TextInput, Box, Divider,
  ActionIcon, Tooltip, Table,
} from "@mantine/core";
import confetti from "canvas-confetti";
import {
  Check, Search, Globe2, Info, CreditCard, ShoppingCart, Tag, X,
  FolderKanban, Layers, Star, Clock, PartyPopper, RefreshCw, Download, Receipt,
} from "lucide-react";
import { PlanIcon } from "../components/PlanIcons";
import { AppShell } from "../components/AppShell";
import { PageHeader } from "../components/Page";
import {
  useGetPlansQuery, useGetAddonPacksQuery,
  useStartSubscriptionMutation, useVerifySubscriptionMutation,
  useStartAddonPurchaseMutation, useVerifyAddonPurchaseMutation,
  useCheckCouponMutation, useGetInvoicesQuery,
} from "../store";
import { notify, errMessage } from "../notify";
import { getToken } from "../api";
import { useAuth } from "../auth";
import { loadRazorpayCheckout, openRazorpayCheckout } from "../utils/razorpay";
import {
  CURRENCIES, detectCurrency, formatMoney, priceIn, getStoredCurrency, setStoredCurrency,
} from "../utils/currency";
import type { BillingCycle, Plan, AddonPack, CouponCheckResult, QuotaSummary, Currency, Invoice } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

/**
 * Subscription plans, addon credit packs, and the current usage against them.
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

export default function Billing() {
  const { user, refreshUser, isDemo } = useAuth();
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
  // Plan/quota state travels on the user's own profile rather than a separate
  // endpoint — every authenticated page already has it via `useAuth()`.
  const usage = user?.billing ?? null;

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
    { kind: "plan"; planName: string } | { kind: "addon"; pack: AddonPack } | null
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

  const doSubscribe = async (plan: Plan) => {
    setConfirmPlan(null);
    setSubscribing(plan.slug);
    try {
      const started = await startSubscription({
        planSlug: plan.slug,
        cycle,
        couponCode: planCoupon?.coupon?.code,
        currency,
      }).unwrap();

      // A ₹0 plan (Free) is assigned directly server-side — no order, no
      // Razorpay modal to open.
      if ("free" in started && started.free) {
        await refreshUser();
        setCelebration({ kind: "plan", planName: plan.name });
        fireConfetti();
        return;
      }

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
            setCelebration({ kind: "plan", planName: plan.name });
            fireConfetti();
          } catch (e) {
            notify.error(errMessage(e, "Payment succeeded but verification failed — contact support."));
          }
        },
        modal: {
          ondismiss: () => {
            if (!paid) setCancelled(`${plan.name} — ${cycle}`);
          },
        },
      });
    } catch (e) {
      notify.error(errMessage(e, "Could not start checkout."));
    } finally {
      setSubscribing(null);
    }
  };

  const doBuyAddon = async (pack: AddonPack) => {
    setConfirmAddon(null);
    setBuying(pack._id);
    try {
      const { orderId, amount, currency: orderCurrency, razorpayKeyId } = await startAddonPurchase({
        slug: pack.slug,
        couponCode: addonCoupon?.coupon?.code,
        currency,
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
        description: pack.name,
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
            setCelebration({ kind: "addon", pack });
            fireConfetti();
          } catch (e) {
            notify.error(errMessage(e, "Payment succeeded but verification failed — contact support."));
          }
        },
        modal: {
          ondismiss: () => {
            if (!paid) setCancelled(pack.name);
          },
        },
      });
    } catch (e) {
      notify.error(errMessage(e, "Could not start checkout."));
    } finally {
      setBuying(null);
    }
  };

  const loading = plansLoading || addonsLoading;
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
      <PageHeader title="Billing" description="Your plan, usage this cycle, and addon packs." />

      {loading ? (
        <Center py={64}><Loader size="sm" /></Center>
      ) : (
        <Stack gap={40}>
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
          ) : !usage && (
            <Alert variant="light" color="gray" icon={<Info size={16} />} radius="md">
              <Text size="sm">You don't have a plan yet — pick one below to unlock SEO audits and crawls.</Text>
            </Alert>
          )}

          <div>
            <Group justify="space-between" align="center" mb="lg" wrap="wrap">
              <div>
                <Title order={3} style={{ letterSpacing: "-0.01em" }}>Plans</Title>
                <Text size="sm" c="dimmed" mt={2}>Every plan includes SEO audits, crawls, and the full dashboard.</Text>
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
                    { label: "Monthly", value: "monthly" },
                    { label: "Yearly · save 2 months", value: "yearly" },
                  ]}
                />
                <Tooltip label="Refetch prices">
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
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      ...(featured
                        ? {
                            borderColor: "var(--violet-2)",
                            boxShadow: "0 0 0 1px var(--violet-2)",
                          }
                        : {}),
                    }}
                  >
                    {featured && (
                      <Badge
                        size="sm"
                        radius="xl"
                        variant="filled"
                        color="emerald"
                        mb="sm"
                        leftSection={<Star size={11} fill="currentColor" />}
                        style={{ alignSelf: "flex-start" }}
                      >
                        Recommended
                      </Badge>
                    )}

                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Group gap={10} wrap="nowrap">
                        <PlanIcon slug={plan.slug} size={30} uid={`card-${plan.slug}`} />
                        <Text fw={700} size="lg">{plan.name}</Text>
                      </Group>
                      {current && (
                        <Badge size="sm" variant="light" color="emerald">Current</Badge>
                      )}
                    </Group>
                    {plan.description && (
                      <Text size="sm" c="dimmed" mt={4} lh={1.4}>{plan.description}</Text>
                    )}

                    <Group gap={4} align="baseline" mt="lg">
                      <Text fz={32} fw={800} style={{ letterSpacing: "-0.03em" }}>{money(price)}</Text>
                      {buyable && (
                        <Text size="sm" c="dimmed">/ {cycle === "yearly" ? "year" : "month"}</Text>
                      )}
                    </Group>

                    <Divider my="md" />

                    <Stack gap={7} mb="lg" style={{ flex: 1 }}>
                      <FeatureLine text={`${plan.maxWorkspaces} workspace${plan.maxWorkspaces === 1 ? "" : "s"}`} />
                      <FeatureLine text={`${plan.maxSitesPerWorkspace} site${plan.maxSitesPerWorkspace === 1 ? "" : "s"} per workspace`} />
                      <FeatureLine text={`${plan.monthlyAuditQuota} SEO audit${plan.monthlyAuditQuota === 1 ? "" : "s"} / month`} />
                      <FeatureLine text={`${plan.monthlyCrawlQuota} crawl${plan.monthlyCrawlQuota === 1 ? "" : "s"} / month`} />
                      {plan.features.map((f) => <FeatureLine key={f} text={f} />)}
                    </Stack>

                    <Button
                      fullWidth
                      size="md"
                      radius="md"
                      color="emerald"
                      variant={current ? "light" : featured ? "filled" : "outline"}
                      disabled={current || !buyable || isDemo}
                      loading={subscribing === plan.slug}
                      leftSection={<CreditCard size={15} />}
                      onClick={() => { setPlanCoupon(null); setConfirmPlan(plan); }}
                    >
                      {isDemo ? "Sign up to subscribe"
                        : current ? "Current plan"
                        : !buyable ? "Included free"
                        : usage?.plan.slug === plan.slug ? "Renew"
                        : "Subscribe"}
                    </Button>
                  </Card>
                );
              })}
            </SimpleGrid>
          </div>

          <div>
            <Group justify="space-between" align="center" mb="lg">
              <div>
                <Title order={3} style={{ letterSpacing: "-0.01em" }}>Addon packs</Title>
                <Text size="sm" c="dimmed" mt={2}>
                  Used past your plan's monthly quota? Buy extra audits or crawls — credits never expire.
                </Text>
              </div>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {addons.map((pack) => (
                <Card key={pack._id} withBorder radius="lg" padding="lg">
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <div>
                      <Text fw={650} size="md">{pack.name}</Text>
                      <Text size="sm" c="dimmed" mt={2}>+{pack.quantity} {pack.type}s</Text>
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
                      disabled={isDemo}
                      loading={buying === pack._id}
                      onClick={() => { setAddonCoupon(null); setConfirmAddon(pack); }}
                    >
                      {isDemo ? "Sign up to buy" : "Buy"}
                    </Button>
                  </Group>
                </Card>
              ))}
              {!addons.length && (
                <Text size="sm" c="dimmed">No addon packs available right now.</Text>
              )}
            </SimpleGrid>
          </div>

          {/* A demo session has no purchases behind it, so there is no history
              to show — and an empty table would imply one that failed to load. */}
          {!isDemo && <Receipts />}
        </Stack>
      )}

      <Modal
        opened={!!confirmPlan}
        onClose={() => setConfirmPlan(null)}
        title="Confirm subscription"
        centered
        radius="lg"
      >
        {confirmPlan && (() => {
          const listPrice = priceIn(cycle === "yearly" ? confirmPlan.priceYearly : confirmPlan.priceMonthly, currency);
          const finalPrice = planCoupon?.coupon ? planCoupon.amount : listPrice;
          const free = priceIn(confirmPlan.priceMonthly, currency) === 0 && priceIn(confirmPlan.priceYearly, currency) === 0;
          return (
            <Stack gap="md">
              <Group justify="space-between">
                <div>
                  <Text fw={650}>{confirmPlan.name}</Text>
                  <Text size="xs" c="dimmed">Billed {cycle}</Text>
                </div>
                <div style={{ textAlign: "right" }}>
                  {planCoupon?.coupon && (
                    <Text size="xs" c="dimmed" td="line-through">{money(listPrice)}</Text>
                  )}
                  <Text fz={22} fw={700}>{money(finalPrice)}</Text>
                </div>
              </Group>

              {!free && (
                <CouponField
                  amount={listPrice}
                  result={planCoupon}
                  onChange={setPlanCoupon}
                />
              )}

              <Text size="sm" c="dimmed">
                {free
                  ? "This plan is free — no payment needed."
                  : `A one-time charge via Razorpay for one ${cycle === "yearly" ? "year" : "month"}. It does not auto-renew — come back and buy again when the period ends.`}
              </Text>
              <Group justify="flex-end">
                <Button variant="subtle" onClick={() => setConfirmPlan(null)}>Cancel</Button>
                <Button
                  color="emerald"
                  leftSection={<CreditCard size={15} />}
                  loading={subscribing === confirmPlan.slug}
                  onClick={() => doSubscribe(confirmPlan)}
                >
                  {free || finalPrice === 0 ? "Confirm" : "Continue to payment"}
                </Button>
              </Group>
            </Stack>
          );
        })()}
      </Modal>

      <Modal
        opened={!!confirmAddon}
        onClose={() => setConfirmAddon(null)}
        title="Confirm purchase"
        centered
        radius="lg"
      >
        {confirmAddon && (
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text fw={650}>{confirmAddon.name}</Text>
                <Text size="xs" c="dimmed">+{confirmAddon.quantity} {confirmAddon.type}s, one-time</Text>
              </div>
              <div style={{ textAlign: "right" }}>
                {addonCoupon?.coupon && (
                  <Text size="xs" c="dimmed" td="line-through">{money(priceIn(confirmAddon.price, currency))}</Text>
                )}
                <Text fz={22} fw={700}>
                  {money(addonCoupon?.coupon ? addonCoupon.amount : priceIn(confirmAddon.price, currency))}
                </Text>
              </div>
            </Group>

            <CouponField
              amount={priceIn(confirmAddon.price, currency)}
              result={addonCoupon}
              onChange={setAddonCoupon}
            />

            <Text size="sm" c="dimmed">
              A one-time charge via Razorpay. Credits are added to your account as soon as payment
              is confirmed and never expire.
            </Text>
            <Group justify="flex-end">
              <Button variant="subtle" onClick={() => setConfirmAddon(null)}>Cancel</Button>
              <Button
                color="emerald"
                leftSection={<ShoppingCart size={15} />}
                loading={buying === confirmAddon._id}
                onClick={() => doBuyAddon(confirmAddon)}
              >
                Continue to payment
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

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
            Payment cancelled
          </Title>
          <Text size="sm" c="dimmed" ta="center" maw={280}>
            {cancelled
              ? `You closed the payment window before ${cancelled} was paid for. Nothing was charged.`
              : "Nothing was charged."}
          </Text>
          <Button variant="light" color="gray" radius="md" mt="sm" onClick={() => setCancelled(null)}>
            Close
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
              {celebration.kind === "plan" ? "You're all set!" : "Credits added!"}
            </Title>
            <Text size="sm" c="dimmed" ta="center" maw={280}>
              {celebration.kind === "plan"
                ? `You're now on the ${celebration.planName} plan. Your new quota is ready to use.`
                : `+${celebration.pack.quantity} ${celebration.pack.type}s added to your account — ready whenever you need them.`}
            </Text>
            <Button color="emerald" radius="md" mt="sm" onClick={() => setCelebration(null)}>
              Let's go
            </Button>
          </Stack>
        )}
      </Modal>
    </AppShell>
  );
}

/**
 * Billing history: every completed purchase, with its receipt.
 *
 * The same PDF was already emailed when the payment landed, so this is the
 * copy for six months later, when that email is buried — which is exactly when
 * someone needs it for an expense claim. Nothing here can be acted on except
 * downloading, so it sits at the bottom, below the things that cost money.
 */
function Receipts() {
  const { data: invoices = [], isLoading } = useGetInvoicesQuery();
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
      notify.error("Could not download that receipt. Try again in a moment.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <Group justify="space-between" align="center" mb="lg">
        <div>
          <Title order={3} style={{ letterSpacing: "-0.01em" }}>Billing history</Title>
          <Text size="sm" c="dimmed" mt={2}>
            Every payment you've made, with its receipt. A copy is emailed to you each time.
          </Text>
        </div>
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
              No payments yet. Once you buy a plan or an addon pack, the receipt
              shows up here and lands in your inbox.
            </Text>
          </Stack>
        ) : (
          <Table.ScrollContainer minWidth={560}>
            <Table verticalSpacing="sm" horizontalSpacing="lg">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Receipt</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Item</Table.Th>
                  <Table.Th ta="right">Amount</Table.Th>
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
                          {inv.kind === "plan" ? "Plan" : "Addon"}
                        </Badge>
                        <Text size="sm">{inv.description}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm" fw={650}>{formatMoney(inv.amount, inv.currency)}</Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Tooltip label="Download PDF">
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
        These are payment receipts, not tax invoices — no GST is charged or collected.
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
                <Text fw={700} size="lg">{usage.plan.name} plan</Text>
                <Badge size="sm" variant="light" color={expired ? "red" : "emerald"} tt="none">
                  {expired ? "Expired" : "Active"}
                </Badge>
              </Group>
              {usage.currentPeriodEnd && (
                <Group gap={5} mt={2}>
                  <Clock size={12} style={{ color: "var(--muted, var(--mantine-color-dimmed))" }} />
                  <Text size="xs" c="dimmed">
                    {expired ? "Expired" : "Renews"} {new Date(usage.currentPeriodEnd).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                    {" · billed "}{usage.cycle}
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
              Your plan period has ended — audits and crawls are paused until you renew.
              Any unused addon credits are untouched.
            </Text>
          </Alert>
        </Box>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={0}>
        <UsageCell icon={Search} label="SEO audits" used={usage.audits.used} quota={usage.audits.planQuota} credits={usage.audits.addonCredits} />
        <UsageCell icon={Globe2} label="Crawls" used={usage.crawls.used} quota={usage.crawls.planQuota} credits={usage.crawls.addonCredits} />
        <UsageCell icon={FolderKanban} label="Workspaces" used={usage.workspaces.used} quota={usage.workspaces.quota} />
        <UsageCell icon={Layers} label="Sites / workspace" used={null} quota={usage.maxSitesPerWorkspace} />
      </SimpleGrid>
    </Card>
  );
}

function UsageCell({
  icon: Icon, label, used, quota, credits,
}: {
  icon: typeof Search;
  label: string;
  /** Null when the number is a flat limit rather than a used/quota pair (sites per workspace). */
  used: number | null;
  quota: number;
  credits?: number;
}) {
  const total = quota + (credits ?? 0);
  const pct = used === null ? null : total > 0 ? Math.min(100, (used / total) * 100) : 100;
  const exhausted = pct !== null && pct >= 100;
  return (
    <Box p="lg" style={{ borderRight: "1px solid var(--border)", borderTop: "1px solid var(--border)" }}>
      <Group gap={6} mb={8}>
        <Icon size={14} style={{ color: "var(--muted, var(--mantine-color-dimmed))" }} />
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
            <Text size="xs" c="dimmed" mt={2}>{quota} plan + {credits} addon</Text>
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
  const [code, setCode] = useState("");
  const [checkCoupon, { isLoading }] = useCheckCouponMutation();

  useEffect(() => {
    const trimmed = code.trim();
    if (!trimmed) {
      onChange(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await checkCoupon({ amount, code: trimmed }).unwrap();
        onChange(res);
      } catch (e) {
        onChange({ amount, error: errMessage(e, "invalid coupon") });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, amount]);

  const applied = result?.coupon;

  if (applied) {
    return (
      <Group gap={6} wrap="nowrap">
        <Badge size="sm" variant="light" color="emerald" leftSection={<Tag size={11} />}>
          {applied.code} — {applied.percentOff}% off
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
      placeholder="Coupon code"
      size="sm"
      value={code}
      onChange={(e) => setCode(e.currentTarget.value.toUpperCase())}
      leftSection={<Tag size={14} />}
      rightSection={isLoading ? <Loader size={12} /> : undefined}
      error={result?.error}
    />
  );
}
