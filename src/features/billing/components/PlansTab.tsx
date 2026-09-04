import {
  Title, Text, Group, Button, Card, SimpleGrid, Stack, SegmentedControl,
  Divider, ActionIcon, Tooltip,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { CreditCard, RefreshCw } from "lucide-react";
import { PlanIcon, PLAN_ACCENTS, PLAN_GRADIENTS, PLAN_ON_ACCENT } from "@/features/billing/components/PlanIcons";
import { CornerRibbon } from "./CornerRibbon";
import { FeatureLine } from "./FeatureLine";
import { RIBBON_FALLBACK } from "../lib/constants";
import { CURRENCIES, priceIn } from "@/shared/lib/currency";
import { MAX_SITES_PER_WORKSPACE } from "@/shared/types";
import type { BillingCycle, Plan, QuotaSummary, Currency } from "@/shared/types";

 
const RENEW_WITHIN_DAYS = 7;

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

interface Props {
  plans: Plan[];
  usage: QuotaSummary;
  expired: boolean;
  /** The plan one tier up, called out on the grid. */
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

/** The pricing grid: every plan, at the chosen cycle and currency. */
export function PlansTab({
  plans, usage, expired, featuredSlug, cycle, setCycle, currency, changeCurrency,
  money, refetching, refetchPrices, isDemo, selectedWorkspaceId, subscribing, onPick,
}: Props) {
  const { t } = useTranslation();

  return (
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
            onClick={refetchPrices}
          >
            <RefreshCw size={15} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>

    <SimpleGrid cols={{ base: 1, sm: 2, lg: Math.min(plans.length, 4) || 1 }} spacing="lg">
      {plans.map((plan, index) => {
        const price = priceIn(cycle === "yearly" ? plan.priceYearly : plan.priceMonthly, currency);
        // Free (or any zero-price plan) is assigned directly, not
        // bought — it stays "current" once assigned and never expires,
        // so there's nothing to re-buy.
        const buyable = price > 0;
        const current = usage?.plan.slug === plan.slug && !expired;
        const featured = plan.slug === featuredSlug && !current;
        const currentIndex = plans.findIndex((p) => p.slug === usage?.plan.slug);
        const lower = !expired && currentIndex > -1 && index < currentIndex;

        // The current plan, on its own cycle, close enough to expiry to renew.
        // Renewing on a *different* cycle is a plan change, not a renewal, and
        // goes through the normal subscribe path — so it is gated on the cycle
        // matching what the workspace is actually on.
        const daysLeft = usage?.currentPeriodEnd ? daysUntil(usage.currentPeriodEnd) : null;
        const renewable =
          current &&
          buyable &&
          usage?.cycle === cycle &&
          daysLeft !== null &&
          daysLeft > 0 &&
          daysLeft <= RENEW_WITHIN_DAYS;
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
 
              position: "relative",
              overflow: "visible",
 
              borderColor: featured
                ? PLAN_ACCENTS[plan.slug] ?? RIBBON_FALLBACK
                : undefined,
            }}
          >
 
            {(featured || current) && (
              <CornerRibbon
                label={
                  renewable
                    ? t("billing.ribbonRenewSoon", "Renew soon")
                    : current
                      ? t("billing.ribbonCurrent")
                      : t("billing.ribbonRecommended")
                }
                color={PLAN_ACCENTS[plan.slug] ?? RIBBON_FALLBACK}
                background={PLAN_GRADIENTS[plan.slug]}
                fg={PLAN_ON_ACCENT[plan.slug] ?? "#fff"}
              />
            )}

            {/* The mark leads the card on its own line rather than sitting
                beside the name — it reads as the tier's badge that way, and
                the name and description get the full card width. */}
            <PlanIcon slug={plan.slug} size={34} uid={`card-${plan.slug}`} />

            <Text fw={700} fz={17} mt={12} style={{ letterSpacing: "-0.01em" }}>
              {plan.name}
            </Text>
            {plan.description && (
              <Text size="xs" c="dimmed" lh={1.4} lineClamp={2} mt={2}>
                {plan.description}
              </Text>
            )}

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
              variant={renewable ? "filled" : current ? "light" : featured ? "filled" : "outline"}
              disabled={(current && !renewable) || lower || !buyable || isDemo || !selectedWorkspaceId}
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
              onClick={() => onPick(plan)}
            >
              {isDemo ? t("billing.ctaSignUpSubscribe")
                : renewable ? t("billing.ctaRenew")
                : current ? t("billing.ctaCurrentPlan")
                : lower ? t("billing.ctaIncludedInPlan")
                : !buyable ? t("billing.ctaIncludedFree")
                : usage?.plan.slug === plan.slug ? t("billing.ctaRenew")
                : t("billing.ctaSubscribe")}
            </Button>
          </Card>
        );
      })}
    </SimpleGrid>
    </div>
  );
}
