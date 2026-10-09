import { useEffect, useState } from "react";
import { Button, Modal } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Lock, ShieldCheck } from "lucide-react";
import { PlanIcon } from "@/features/billing/components/PlanIcons";
import { MIN_CHARGE } from "../lib/constants";
import { PackIcon, creditType } from "../lib/credits";
import { bulkSaving, creditBalance, packDiscount, yearlySaving } from "../lib/checkoutSavings";
import { useGatewayChoice } from "../hooks/useGatewayChoice";
import { CouponField } from "./CouponField";
import { CheckoutTopBar } from "./checkout/CheckoutTopBar";
import { CheckoutBlock } from "./checkout/CheckoutBlock";
import { CycleOptions } from "./checkout/CycleOptions";
import { PlanChanges } from "./checkout/PlanChanges";
import { PlanIncludes } from "./checkout/PlanIncludes";
import { CheckoutAddonRow } from "./checkout/CheckoutAddonRow";
import { OrderItems, type OrderItem } from "./checkout/OrderItems";
import { OrderTotals } from "./checkout/OrderTotals";
import { GatewayPicker } from "./checkout/GatewayPicker";
import { SavingsCard } from "./checkout/SavingsCard";
import { PeriodPreview } from "./checkout/PeriodPreview";
import { TrustList } from "./checkout/TrustList";
import { num } from "@/shared/lib";
import { formatMoney, priceIn } from "@/shared/lib/currency";
import type {
  BillingCycle, Plan, AddonPack, CouponCheckResult, Currency, AddonSelection, PaymentGateway, QuotaSummary,
} from "@/shared/types";
import classes from "./checkout/Checkout.module.css";
import s from "./checkout/CheckoutPage.module.css";

export function PlanCheckoutModal({
  plan,
  plans,
  usage,
  cycle,
  onCycleChange,
  currency,
  addons,
  coupon,
  onCoupon,
  busy,
  renewing,
  workspaceId,
  onClose,
  onConfirm,
}: {
  plan: Plan | null;
  plans: Plan[];
  usage: QuotaSummary;
  cycle: BillingCycle;
  onCycleChange: (cycle: BillingCycle) => void;
  currency: Currency;
  addons: AddonPack[];
  coupon: CouponCheckResult | null;
  onCoupon: (result: CouponCheckResult | null) => void;
  busy: boolean;
  renewing: boolean;
  workspaceId: string | null;
  onClose: () => void;
  onConfirm: (
    plan: Plan,
    selection: AddonSelection,
    gateway: PaymentGateway,
    phone?: string,
  ) => void;
}) {
  const { t } = useTranslation();
  const [selection, setSelection] = useState<AddonSelection>({});
  const gatewayChoice = useGatewayChoice(currency);

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
  const percentOff = coupon?.coupon?.percentOff ?? 0;
  const total = percentOff ? Math.floor((subtotal * (100 - percentOff)) / 100) : subtotal;
  const noCharge = total === 0 && !chosen.length;
  const chargeable = noCharge ? 0 : Math.max(total, MIN_CHARGE);

  const planLabel = t("billing.planNamed", { plan: plan.name });

  const items: OrderItem[] = [
    {
      key: "plan",
      mark: <PlanIcon slug={plan.slug} size={22} uid={`summary-${plan.slug}`} />,
      name: planLabel,
      sub: cycle === "yearly"
        ? t("billing.billedEveryYear", "Billed once a year")
        : t("billing.billedEveryMonth", "Billed every month"),
      value: money(planPrice),
    },
    ...chosen.map(({ pack, packs }) => {
      const credits = pack.quantity * packs;
      return {
        key: pack._id,
        mark: <PackIcon type={pack.type} size={17} />,
        name: packs > 1 ? t("billing.packTimes", { name: pack.name, packs }) : pack.name,
        sub: t("billing.packQuantity", { n: num(credits), type: creditType(t, pack.type, credits) }),
        value: money(priceIn(pack.price, currency) * packs),
      };
    }),
  ];

  const savings = [
    {
      key: "yearly",
      label: t("billing.saveYearly", "Yearly billing"),
      amount: cycle === "yearly" && !isFreePlan ? yearlySaving(plan, currency).amount : 0,
    },
    { key: "bulk", label: t("billing.saveBulk", "Bulk packs"), amount: bulkSaving(addons, selection, currency) },
    { key: "coupon", label: t("billing.saveCoupon", "Coupon"), amount: subtotal - total },
  ];

  const currentPlan = usage ? plans.find((p) => p.slug === usage.plan.slug) ?? null : null;
  const showChanges = !!currentPlan && currentPlan.slug !== plan.slug;

  return (
    <Modal
      opened
      onClose={onClose}
      fullScreen
      withCloseButton={false}
      padding={0}
      transitionProps={{ transition: "fade", duration: 180 }}
      classNames={{ content: s.page, body: s.body }}
    >
      <CheckoutTopBar onBack={onClose} disabled={busy} />

      <div className={s.split}>
        <div className={s.left}>
          <div className={s.content}>
            <header className={s.hero}>
              <span className={s.heroMark}>
                <PlanIcon slug={plan.slug} size={36} uid={`checkout-${plan.slug}`} />
              </span>
              <div className={s.heroText}>
                <span className={s.eyebrow}>
                  {renewing ? t("billing.confirmRenewal", "Confirm renewal") : t("billing.confirmSubscription")}
                </span>
                <h1 className={s.heroTitle}>{planLabel}</h1>
                {plan.description && <p className={s.heroDesc}>{plan.description}</p>}
              </div>
            </header>

            {!isFreePlan && (
              <CheckoutBlock title={t("billing.billingPeriod", "Billing period")}>
                <CycleOptions
                  plan={plan}
                  cycle={cycle}
                  currency={currency}
                  money={money}
                  busy={busy}
                  onChange={onCycleChange}
                />
              </CheckoutBlock>
            )}

            {showChanges && currentPlan && (
              <CheckoutBlock
                title={t("billing.whatChanges", "What changes")}
                description={t("billing.whatChangesDesc", "Your new allowance next to what {{plan}} gives you today.", {
                  plan: currentPlan.name,
                })}
              >
                <PlanChanges from={currentPlan} to={plan} />
              </CheckoutBlock>
            )}

            <CheckoutBlock title={t("billing.includedTitle", "Everything in {{plan}}", { plan: plan.name })}>
              <PlanIncludes plan={plan} />
            </CheckoutBlock>

            {addons.length > 0 && (
              <CheckoutBlock
                title={t("billing.addExtraCredits")}
                hint={t("billing.optional")}
                description={t("billing.addCreditsDesc")}
              >
                <ul className={s.packGrid}>
                  {addons.map((pack) => (
                    <CheckoutAddonRow
                      key={pack._id}
                      pack={pack}
                      unit={priceIn(pack.price, currency)}
                      packs={selection[pack.slug] ?? 0}
                      busy={busy}
                      money={money}
                      savePercent={packDiscount(pack, addons, currency).percent}
                      balance={creditBalance(usage, pack.type)}
                      onChange={(v) => setSelection((prev) => ({ ...prev, [pack.slug]: v }))}
                    />
                  ))}
                </ul>
              </CheckoutBlock>
            )}
          </div>
        </div>

        <aside className={s.right}>
          <div className={s.rightInner}>
            <h4 className={s.summaryTitle}>{t("billing.orderSummary")}</h4>
            <p className={s.summaryTotal}>{money(chargeable)}</p>

            <OrderItems items={items} />

            <div className={s.divider} />

            <OrderTotals
              lines={[]}
              subtotal={subtotal}
              total={total}
              chargeable={chargeable}
              percentOff={percentOff}
              couponCode={coupon?.coupon?.code}
              money={money}
            />

            <SavingsCard lines={savings} money={money} />

            {!isFreePlan && <CouponField amount={subtotal} result={coupon} onChange={onCoupon} />}

            {!isFreePlan && <PeriodPreview workspaceId={workspaceId} plan={plan} cycle={cycle} />}

            {!noCharge && <GatewayPicker choice={gatewayChoice} currency={currency} busy={busy} />}

            <Button
              fullWidth
              size="lg"
              color="emerald"
              className={classes.pay}
              leftSection={<Lock size={15} />}
              loading={busy}
              disabled={!gatewayChoice.canPay}
              onClick={() => onConfirm(plan, selection, gatewayChoice.gateway, gatewayChoice.phoneForGateway)}
            >
              {noCharge
                ? isFreePlan
                  ? t("billing.confirm")
                  : t("billing.activateCycle", "Activate {{plan}} {{cycle}} — no charge", {
                      plan: plan.name,
                      cycle: cycle === "yearly" ? t("billing.cycleYearlyWord") : t("billing.cycleMonthlyWord"),
                    })
                : t("billing.payAmount", { amount: money(chargeable) })}
            </Button>

            <p className={classes.footnote}>
              <ShieldCheck size={14} />
              <span>
                {isFreePlan
                  ? t("billing.planIsFree")
                  : noCharge
                    ? t("billing.couponCovers", "Your coupon covers the full {{cycle}} price. You'll get a {{zero}} receipt for your records.", {
                        cycle: cycle === "yearly" ? t("billing.cycleYearlyWord") : t("billing.cycleMonthlyWord"),
                        zero: money(0),
                      })
                    : t(cycle === "yearly" ? "billing.oneTimeChargeYear" : "billing.oneTimeChargeMonth")}
              </span>
            </p>

            <TrustList />
          </div>
        </aside>
      </div>
    </Modal>
  );
}
