import { useState } from "react";
import {
  Modal, Text, Group, Button, Stack, Divider, Badge, ThemeIcon, Card,
  SimpleGrid, Grid,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { CreditCard, Tag } from "lucide-react";
import { PlanIcon } from "@/features/billing/components/PlanIcons";
import { PackIcon, creditType } from "../lib/credits";
import { MIN_CHARGE } from "../lib/constants";
import { PackStepper } from "./PackStepper";
import { CouponField } from "./CouponField";
import { formatMoney, priceIn } from "@/shared/lib/currency";
import type {
  BillingCycle, Plan, AddonPack, CouponCheckResult, Currency, AddonSelection,
} from "@/shared/types";

export function PlanCheckoutModal({
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
                          borderColor: picked ? "var(--mantine-color-emerald-6)" : undefined,
                          transition: "border-color 120ms ease",
                        }}
                      >
                        <Stack gap="sm">
                          <Group gap={10} wrap="nowrap">
                            <ThemeIcon size={34} radius="md" variant="light" color="emerald">
                              <PackIcon type={pack.type} size={16} />
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
