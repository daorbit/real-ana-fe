import { useEffect, useState } from "react";
import { Button, CloseButton, Modal } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { CreditCard, ShieldCheck } from "lucide-react";
import { PlanIcon, PLAN_ACCENTS } from "@/features/billing/components/PlanIcons";
import { MIN_CHARGE, RIBBON_FALLBACK } from "../lib/constants";
import { useGatewayChoice } from "../hooks/useGatewayChoice";
import { CouponField } from "./CouponField";
import { CheckoutProduct } from "./checkout/CheckoutProduct";
import { CheckoutAddonRow } from "./checkout/CheckoutAddonRow";
import { OrderTotals } from "./checkout/OrderTotals";
import { CreditsIncluded } from "./checkout/CreditsIncluded";
import { GatewayPicker } from "./checkout/GatewayPicker";
import { formatMoney, priceIn } from "@/shared/lib/currency";
import type {
  BillingCycle, Plan, AddonPack, CouponCheckResult, Currency, AddonSelection, PaymentGateway,
} from "@/shared/types";
import classes from "./checkout/Checkout.module.css";

export function PlanCheckoutModal({
  plan,
  cycle,
  currency,
  addons,
  coupon,
  onCoupon,
  busy,
  renewal,
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
  renewal: { newPeriodEnd: string } | null;
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

  const creditTotals = chosen.reduce<Record<string, number>>((acc, { pack, packs }) => {
    acc[pack.type] = (acc[pack.type] ?? 0) + pack.quantity * packs;
    return acc;
  }, {});

  const planLabel = t("billing.planNamed", { plan: plan.name });
  const lines = [
    { key: "plan", label: planLabel, value: planPrice },
    ...chosen.map(({ pack, packs }) => ({
      key: pack._id,
      label: t("billing.packTimes", { name: pack.name, packs }),
      value: priceIn(pack.price, currency) * packs,
    })),
  ];

  const renewalDate = renewal
    ? new Date(renewal.newPeriodEnd).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : null;

  return (
    <Modal
      opened
      onClose={onClose}
      withCloseButton={false}
      centered
      radius="lg"
      size={1000}
      padding={0}
      classNames={{ content: classes.modal, body: classes.body }}
    >
      <CloseButton className={classes.close} onClick={onClose} disabled={busy} aria-label={t("common.cancel")} />

      <div className={classes.layout}>
        <div className={classes.main}>
          <div className={classes.top}>
            <span className={classes.eyebrow}>
              {renewal ? t("billing.confirmRenewal", "Confirm renewal") : t("billing.confirmSubscription")}
            </span>
          </div>

          <CheckoutProduct
            mark={<PlanIcon slug={plan.slug} size={30} uid={`checkout-${plan.slug}`} />}
            accent={PLAN_ACCENTS[plan.slug] ?? RIBBON_FALLBACK}
            name={planLabel}
            meta={t(cycle === "yearly" ? "billing.billedCycleYearly" : "billing.billedCycleMonthly", {
              audits: plan.monthlyAuditQuota,
              crawls: plan.monthlyCrawlQuota,
            })}
            price={money(planPrice)}
            per={isFreePlan ? undefined : `/ ${cycle === "yearly" ? t("billing.perYear") : t("billing.perMonth")}`}
          />

          {addons.length > 0 && (
            <>
              <div className={classes.sectionHead}>
                <h4 className={classes.sectionTitle}>{t("billing.addExtraCredits")}</h4>
                <span className={classes.optional}>{t("billing.optional")}</span>
              </div>
              <p className={classes.sectionDesc}>{t("billing.addCreditsDesc")}</p>

              <ul className={classes.packList}>
                {addons.map((pack) => (
                  <CheckoutAddonRow
                    key={pack._id}
                    pack={pack}
                    unit={priceIn(pack.price, currency)}
                    packs={selection[pack.slug] ?? 0}
                    busy={busy}
                    money={money}
                    onChange={(v) => setSelection((prev) => ({ ...prev, [pack.slug]: v }))}
                  />
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className={classes.aside}>
          <h4 className={classes.asideTitle}>{t("billing.orderSummary")}</h4>

          <OrderTotals
            lines={lines}
            subtotal={subtotal}
            total={total}
            chargeable={chargeable}
            percentOff={percentOff}
            couponCode={coupon?.coupon?.code}
            money={money}
          />

          {!isFreePlan && <CouponField amount={subtotal} result={coupon} onChange={onCoupon} />}

          <CreditsIncluded totals={creditTotals} />

          {!noCharge && <GatewayPicker choice={gatewayChoice} currency={currency} busy={busy} />}

          <div className={classes.actions}>
            <Button
              fullWidth
              size="lg"
              radius="md"
              color="emerald"
              leftSection={<CreditCard size={17} />}
              loading={busy}
              disabled={!gatewayChoice.canPay}
              onClick={() => onConfirm(plan, selection, gatewayChoice.gateway, gatewayChoice.phoneForGateway)}
            >
              {noCharge ? t("billing.confirm") : t("billing.payAmount", { amount: money(chargeable) })}
            </Button>
            <Button fullWidth variant="subtle" color="gray" radius="md" onClick={onClose} disabled={busy}>
              {t("common.cancel")}
            </Button>
          </div>

          <p className={classes.footnote}>
            <ShieldCheck size={14} />
            <span>
              {noCharge
                ? t("billing.planIsFree")
                : t(cycle === "yearly" ? "billing.oneTimeChargeYear" : "billing.oneTimeChargeMonth")}
              {renewalDate && ` ${t("billing.renewalExtendsTo", { date: renewalDate })}`}
            </span>
          </p>
        </aside>
      </div>
    </Modal>
  );
}
