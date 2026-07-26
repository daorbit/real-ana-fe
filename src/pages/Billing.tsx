import { useState } from "react";
import {
  Title, Text, Group, Button, Card, Badge, SimpleGrid, Stack, Center, Loader,
  SegmentedControl, Progress, Divider, ThemeIcon, Alert, Modal,
} from "@mantine/core";
import { Check, Search, Globe2, Info, CreditCard, ShoppingCart } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { PageHeader } from "../components/Page";
import {
  useGetPlansQuery, useGetAddonPacksQuery, useGetMySubscriptionQuery,
  useStartSubscriptionMutation, useVerifySubscriptionMutation,
  useCancelSubscriptionMutation, useStartAddonPurchaseMutation,
  useVerifyAddonPurchaseMutation,
} from "../store";
import { notify, errMessage, confirmDelete } from "../notify";
import { useAuth } from "../auth";
import { loadRazorpayCheckout, openRazorpayCheckout } from "../utils/razorpay";
import type { BillingCycle, Plan, AddonPack } from "../types";

/** Paise to a display INR string — Razorpay's amounts are always the smallest unit. */
function money(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

/**
 * Subscription plans, addon credit packs, and the current usage against them.
 *
 * Checkout is Razorpay's own modal: this page only ever creates the
 * subscription/order server-side and hands the id to Checkout, then posts the
 * signed callback back for verification. Nothing about a card ever touches
 * this code.
 */
export default function Billing() {
  const { user } = useAuth();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  const { data: plans = [], isLoading: plansLoading } = useGetPlansQuery();
  const { data: addons = [], isLoading: addonsLoading } = useGetAddonPacksQuery();
  const { data: usage, isLoading: usageLoading } = useGetMySubscriptionQuery();

  const [startSubscription] = useStartSubscriptionMutation();
  const [verifySubscription] = useVerifySubscriptionMutation();
  const [cancelSubscription, { isLoading: cancelling }] = useCancelSubscriptionMutation();
  const [startAddonPurchase] = useStartAddonPurchaseMutation();
  const [verifyAddonPurchase] = useVerifyAddonPurchaseMutation();

  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [buying, setBuying] = useState<string | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);
  const [confirmAddon, setConfirmAddon] = useState<AddonPack | null>(null);

  const doSubscribe = async (plan: Plan) => {
    setConfirmPlan(null);
    setSubscribing(plan._id);
    try {
      const { subscriptionId, razorpayKeyId } = await startSubscription({
        planId: plan._id,
        cycle,
      }).unwrap();

      await loadRazorpayCheckout();
      openRazorpayCheckout({
        key: razorpayKeyId,
        subscription_id: subscriptionId,
        name: "Quantalog",
        description: `${plan.name} — ${cycle}`,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#059669" },
        handler: async (response) => {
          try {
            await verifySubscription({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
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
      const { orderId, amount, currency, razorpayKeyId } = await startAddonPurchase(pack.slug).unwrap();

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

  const cancel = () => {
    confirmDelete({
      title: "Cancel subscription?",
      body: "You'll keep access until the end of the current billing period, then the plan won't renew.",
      confirmLabel: "Cancel plan",
      onConfirm: async () => {
        try {
          await cancelSubscription().unwrap();
          notify.success("Your plan will not renew after the current period.", "Cancelled");
        } catch (e) {
          notify.error(errMessage(e, "Could not cancel."));
        }
      },
    });
  };

  const loading = plansLoading || addonsLoading || usageLoading;

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
                    <Badge
                      size="sm"
                      variant="light"
                      color={usage.status === "active" ? "emerald" : usage.status === "past_due" ? "yellow" : "gray"}
                    >
                      {usage.status.replace("_", " ")}
                    </Badge>
                    <Badge size="sm" variant="light" color="gray">{usage.cycle}</Badge>
                  </Group>
                  {usage.currentPeriodEnd && (
                    <Text size="xs" c="dimmed" mt={4}>
                      Renews {new Date(usage.currentPeriodEnd).toLocaleDateString()}
                    </Text>
                  )}
                </div>
                {usage.status === "active" && (
                  <Button size="xs" variant="light" color="red" loading={cancelling} onClick={cancel}>
                    Cancel plan
                  </Button>
                )}
              </Group>

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
                const current = usage?.plan.id === plan._id && usage.status === "active";
                // Free (or any zero-price plan) never goes through Razorpay
                // checkout — it's assigned directly, not bought.
                const buyable = price > 0;
                const rzpPlanId = cycle === "yearly" ? plan.razorpayPlanIdYearly : plan.razorpayPlanIdMonthly;
                // A paid plan with no Razorpay plan id wired up yet can't take
                // checkout — surface that as a disabled state with an explanation
                // instead of letting the click reach the server and bounce.
                const notConfigured = buyable && !rzpPlanId;
                return (
                  <Card key={plan._id} withBorder radius="md" padding="lg">
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
                      disabled={current || !buyable || notConfigured}
                      loading={subscribing === plan._id}
                      leftSection={<CreditCard size={15} />}
                      onClick={() => setConfirmPlan(plan)}
                    >
                      {current ? "Current plan" : !buyable ? "Included free" : notConfigured ? "Not available yet" : "Subscribe"}
                    </Button>
                    {notConfigured && (
                      <Text size="xs" c="dimmed" mt={6}>
                        This plan isn't set up for checkout yet — ask an admin to add its Razorpay {cycle} price.
                      </Text>
                    )}
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
                    <Button size="xs" color="emerald" loading={buying === pack._id} onClick={() => setConfirmAddon(pack)}>
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
        {confirmPlan && (
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text fw={650}>{confirmPlan.name}</Text>
                <Text size="xs" c="dimmed">Billed {cycle}</Text>
              </div>
              <Text fz={22} fw={700}>
                {money(cycle === "yearly" ? confirmPlan.priceYearly : confirmPlan.priceMonthly)}
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              You'll be taken to Razorpay to complete payment. The plan renews automatically
              {cycle === "yearly" ? " every year" : " every month"} until you cancel.
            </Text>
            <Group justify="flex-end">
              <Button variant="subtle" onClick={() => setConfirmPlan(null)}>Cancel</Button>
              <Button
                color="emerald"
                leftSection={<CreditCard size={15} />}
                loading={subscribing === confirmPlan._id}
                onClick={() => doSubscribe(confirmPlan)}
              >
                Continue to payment
              </Button>
            </Group>
          </Stack>
        )}
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
              <Text fz={22} fw={700}>{money(confirmAddon.price)}</Text>
            </Group>
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
