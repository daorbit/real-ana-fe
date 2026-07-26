import { useEffect, useState } from "react";
import {
  Title, Text, Group, Button, Card, Badge, SimpleGrid, Stack, Center, Loader,
  SegmentedControl, Progress, Divider, ThemeIcon, Alert, Modal, TextInput,
} from "@mantine/core";
import { Check, Search, Globe2, Info, CreditCard, ShoppingCart, Tag, X } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { PageHeader } from "../components/Page";
import {
  useGetPlansQuery, useGetAddonPacksQuery, useGetMySubscriptionQuery,
  useStartSubscriptionMutation, useVerifySubscriptionMutation,
  useStartAddonPurchaseMutation, useVerifyAddonPurchaseMutation,
  useCheckCouponMutation,
} from "../store";
import { notify, errMessage } from "../notify";
import { useAuth } from "../auth";
import { loadRazorpayCheckout, openRazorpayCheckout } from "../utils/razorpay";
import type { BillingCycle, Plan, AddonPack, CouponCheckResult } from "../types";

/** Paise to a display INR string — Razorpay's amounts are always the smallest unit. */
function money(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

/**
 * Subscription plans, addon credit packs, and the current usage against them.
 *
 * Every purchase — a plan period or an addon pack — is a one-time Razorpay
 * Order, not an auto-recurring subscription: nothing here ever charges a
 * card again on its own. A plan period simply ends at `currentPeriodEnd`, and
 * "renewing" is just buying the same plan again, same as switching to a
 * different one.
 */
export default function Billing() {
  const { user } = useAuth();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  const { data: plans = [], isLoading: plansLoading } = useGetPlansQuery();
  const { data: addons = [], isLoading: addonsLoading } = useGetAddonPacksQuery();
  const { data: usage, isLoading: usageLoading } = useGetMySubscriptionQuery();

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

  const doSubscribe = async (plan: Plan) => {
    setConfirmPlan(null);
    setSubscribing(plan.slug);
    try {
      const started = await startSubscription({
        planSlug: plan.slug,
        cycle,
        couponCode: planCoupon?.coupon?.code,
      }).unwrap();

      // A ₹0 plan (Free) is assigned directly server-side — no order, no
      // Razorpay modal to open.
      if ("free" in started && started.free) {
        notify.success(`You're on the ${plan.name} plan.`, "Updated");
        return;
      }

      await loadRazorpayCheckout();
      openRazorpayCheckout({
        key: started.razorpayKeyId,
        amount: started.amount,
        currency: started.currency,
        order_id: started.orderId,
        name: "Quantalog",
        description: `${plan.name} — ${cycle}`,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#059669" },
        handler: async (response) => {
          try {
            await verifySubscription({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();
            notify.success(`You're on the ${plan.name} plan.`, "Subscribed");
          } catch (e) {
            notify.error(errMessage(e, "Payment succeeded but verification failed — contact support."));
          }
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
      const { orderId, amount, currency, razorpayKeyId } = await startAddonPurchase({
        slug: pack.slug,
        couponCode: addonCoupon?.coupon?.code,
      }).unwrap();

      await loadRazorpayCheckout();
      openRazorpayCheckout({
        key: razorpayKeyId,
        amount,
        currency,
        order_id: orderId,
        name: "Quantalog",
        description: pack.name,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#059669" },
        handler: async (response) => {
          try {
            await verifyAddonPurchase({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();
            notify.success(`+${pack.quantity} ${pack.type}s added.`, "Purchase complete");
          } catch (e) {
            notify.error(errMessage(e, "Payment succeeded but verification failed — contact support."));
          }
        },
      });
    } catch (e) {
      notify.error(errMessage(e, "Could not start checkout."));
    } finally {
      setBuying(null);
    }
  };

  const loading = plansLoading || addonsLoading || usageLoading;
  const expired = usage?.status === "expired";

  return (
    <AppShell>
      <PageHeader title="Billing" description="Your plan, usage this cycle, and addon packs." />

      {loading ? (
        <Center py={64}><Loader size="sm" /></Center>
      ) : (
        <Stack gap="xl">
          {usage && (
            <Card withBorder radius="md" padding="lg">
              <Group justify="space-between" align="flex-start" wrap="wrap">
                <div>
                  <Group gap="xs">
                    <Text fw={650}>{usage.plan.name}</Text>
                    <Badge size="sm" variant="light" color={expired ? "red" : "emerald"}>
                      {expired ? "expired" : "active"}
                    </Badge>
                    <Badge size="sm" variant="light" color="gray">{usage.cycle}</Badge>
                  </Group>
                  {usage.currentPeriodEnd && (
                    <Text size="xs" c="dimmed" mt={4}>
                      {expired ? "Expired" : "Renews"} {new Date(usage.currentPeriodEnd).toLocaleDateString()}
                    </Text>
                  )}
                </div>
              </Group>

              {expired && (
                <Alert variant="light" color="red" icon={<Info size={16} />} radius="md" mt="md">
                  <Text size="sm">
                    Your plan period has ended — audits and crawls are paused until you renew below.
                    Any unused addon credits are untouched.
                  </Text>
                </Alert>
              )}

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="lg">
                <UsageBar icon={Search} label="SEO audits" used={usage.audits.used} quota={usage.audits.planQuota} credits={usage.audits.addonCredits} />
                <UsageBar icon={Globe2} label="Site crawls" used={usage.crawls.used} quota={usage.crawls.planQuota} credits={usage.crawls.addonCredits} />
              </SimpleGrid>
              <Text size="xs" c="dimmed" mt="md">
                {usage.workspaces.used} / {usage.workspaces.quota} workspaces · up to {usage.maxSitesPerWorkspace} site{usage.maxSitesPerWorkspace === 1 ? "" : "s"} each
              </Text>
            </Card>
          )}

          {!usage && (
            <Alert variant="light" color="gray" icon={<Info size={16} />} radius="md">
              <Text size="sm">You don't have a plan yet — pick one below to unlock SEO audits and crawls.</Text>
            </Alert>
          )}

          <div>
            <Group justify="space-between" align="center" mb="md">
              <Title order={4}>Plans</Title>
              <SegmentedControl
                size="xs"
                value={cycle}
                onChange={(v) => setCycle(v as BillingCycle)}
                data={[
                  { label: "Monthly", value: "monthly" },
                  { label: "Yearly", value: "yearly" },
                ]}
              />
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: Math.min(plans.length, 4) || 1 }} spacing="md">
              {plans.map((plan) => {
                const price = cycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
                // Free (or any zero-price plan) is assigned directly, not
                // bought — it stays "current" once assigned and never expires,
                // so there's nothing to re-buy.
                const buyable = price > 0;
                const current = usage?.plan.slug === plan.slug && !expired;
                return (
                  <Card key={plan.slug} withBorder radius="md" padding="lg">
                    <Text fw={650}>{plan.name}</Text>
                    {plan.description && <Text size="xs" c="dimmed" mt={2}>{plan.description}</Text>}
                    <Group gap={4} align="baseline" mt="md">
                      <Text fz={28} fw={700} style={{ letterSpacing: "-0.02em" }}>{money(price)}</Text>
                      <Text size="xs" c="dimmed">/ {cycle === "yearly" ? "year" : "month"}</Text>
                    </Group>

                    <Stack gap={4} mt="md">
                      <FeatureLine text={`${plan.maxWorkspaces} workspace${plan.maxWorkspaces === 1 ? "" : "s"}`} />
                      <FeatureLine text={`${plan.maxSitesPerWorkspace} site${plan.maxSitesPerWorkspace === 1 ? "" : "s"} per workspace`} />
                      <FeatureLine text={`${plan.monthlyAuditQuota} SEO audits / month`} />
                      <FeatureLine text={`${plan.monthlyCrawlQuota} crawls / month`} />
                      {plan.features.map((f) => <FeatureLine key={f} text={f} />)}
                    </Stack>

                    <Button
                      fullWidth
                      mt="lg"
                      color="emerald"
                      variant={current ? "light" : "filled"}
                      disabled={current || !buyable}
                      loading={subscribing === plan.slug}
                      leftSection={<CreditCard size={15} />}
                      onClick={() => { setPlanCoupon(null); setConfirmPlan(plan); }}
                    >
                      {current ? "Current plan" : !buyable ? "Included free" : usage?.plan.slug === plan.slug ? "Renew" : "Subscribe"}
                    </Button>
                  </Card>
                );
              })}
            </SimpleGrid>
          </div>

          <div>
            <Title order={4} mb="md">Addon packs</Title>
            <Text size="sm" c="dimmed" mb="md">
              Used past your plan's monthly quota? Buy extra audits or crawls — a one-time purchase, credits never expire.
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {addons.map((pack) => (
                <Card key={pack._id} withBorder radius="md" padding="lg">
                  <Group justify="space-between" align="flex-start">
                    <div>
                      <Text fw={600} size="sm">{pack.name}</Text>
                      <Text size="xs" c="dimmed" mt={2}>+{pack.quantity} {pack.type}s</Text>
                    </div>
                    <ThemeIcon size={30} radius="md" variant="light" color="emerald">
                      {pack.type === "audit" ? <Search size={15} /> : <Globe2 size={15} />}
                    </ThemeIcon>
                  </Group>
                  <Divider my="sm" />
                  <Group justify="space-between" align="center">
                    <Text fw={650}>{money(pack.price)}</Text>
                    <Button size="xs" color="emerald" loading={buying === pack._id} onClick={() => { setAddonCoupon(null); setConfirmAddon(pack); }}>
                      Buy
                    </Button>
                  </Group>
                </Card>
              ))}
              {!addons.length && (
                <Text size="sm" c="dimmed">No addon packs available right now.</Text>
              )}
            </SimpleGrid>
          </div>
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
          const listPrice = cycle === "yearly" ? confirmPlan.priceYearly : confirmPlan.priceMonthly;
          const finalPrice = planCoupon?.coupon ? planCoupon.amount : listPrice;
          const free = confirmPlan.priceMonthly === 0 && confirmPlan.priceYearly === 0;
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
                  <Text size="xs" c="dimmed" td="line-through">{money(confirmAddon.price)}</Text>
                )}
                <Text fz={22} fw={700}>
                  {money(addonCoupon?.coupon ? addonCoupon.amount : confirmAddon.price)}
                </Text>
              </div>
            </Group>

            <CouponField
              amount={confirmAddon.price}
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
    </AppShell>
  );
}

function FeatureLine({ text }: { text: string }) {
  return (
    <Group gap={6} wrap="nowrap">
      <ThemeIcon size={16} radius="xl" variant="light" color="emerald">
        <Check size={10} />
      </ThemeIcon>
      <Text size="xs" c="dimmed">{text}</Text>
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

function UsageBar({
  icon: Icon, label, used, quota, credits,
}: {
  icon: typeof Search;
  label: string;
  used: number;
  quota: number;
  credits: number;
}) {
  const pct = quota > 0 ? Math.min(100, (used / quota) * 100) : 100;
  const exhausted = quota > 0 && used >= quota;
  return (
    <div>
      <Group justify="space-between" mb={4}>
        <Group gap={6}>
          <Icon size={14} />
          <Text size="sm" fw={600}>{label}</Text>
        </Group>
        <Text size="xs" c="dimmed">{used} / {quota}{credits > 0 ? ` +${credits} addon` : ""}</Text>
      </Group>
      <Progress value={pct} color={exhausted ? (credits > 0 ? "yellow" : "red") : "emerald"} size="sm" radius="xl" />
    </div>
  );
}
