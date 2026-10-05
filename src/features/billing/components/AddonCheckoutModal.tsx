import { useEffect, useState } from "react";
import { Button, CloseButton, Modal } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Lock, ShieldCheck } from "lucide-react";
import { num } from "@/shared/lib";
import { PackIcon, creditType } from "../lib/credits";
import { MIN_CHARGE } from "../lib/constants";
import { useGatewayChoice } from "../hooks/useGatewayChoice";
import { PackStepper } from "./PackStepper";
import { CouponField } from "./CouponField";
import { CheckoutProduct } from "./checkout/CheckoutProduct";
import { OrderTotals } from "./checkout/OrderTotals";
import { GatewayPicker } from "./checkout/GatewayPicker";
import { formatMoney, priceIn } from "@/shared/lib/currency";
import type { AddonPack, CouponCheckResult, Currency, PaymentGateway } from "@/shared/types";
import classes from "./checkout/Checkout.module.css";

export function AddonCheckoutModal({
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
  onConfirm: (
    pack: AddonPack,
    packs: number,
    gateway: PaymentGateway,
    phone?: string,
  ) => void;
}) {
  const { t } = useTranslation();
  const [packs, setPacks] = useState(1);
  const gatewayChoice = useGatewayChoice(currency);

  useEffect(() => {
    if (pack) setPacks(1);
  }, [pack?._id]);

  if (!pack) return <Modal opened={false} onClose={onClose} children={null} />;

  const money = (amountMinor: number) => formatMoney(amountMinor, currency);
  const unit = priceIn(pack.price, currency);
  const subtotal = unit * packs;
  const percentOff = coupon?.coupon?.percentOff ?? 0;
  const total = percentOff ? Math.floor((subtotal * (100 - percentOff)) / 100) : subtotal;
  const chargeable = Math.max(total, MIN_CHARGE);
  const credits = pack.quantity * packs;

  return (
    <Modal
      opened
      onClose={onClose}
      withCloseButton={false}
      centered
      radius={22}
      size={440}
      padding={0}
      classNames={{ content: classes.modal, body: classes.body }}
    >
      <CloseButton className={classes.close} onClick={onClose} disabled={busy} aria-label={t("common.cancel")} />

      <div className={classes.single}>
        <CheckoutProduct
          mark={<PackIcon type={pack.type} size={22} />}
          eyebrow={t("billing.confirmPurchase")}
          name={pack.name}
          meta={t("billing.packUnitPerPack", {
            n: pack.quantity,
            type: creditType(t, pack.type, pack.quantity),
            price: money(unit),
          })}
        />

        <div className={classes.quantityRow}>
          <div className={classes.groupText}>
            <span className={classes.groupLabel}>{t("billing.howManyPacks")}</span>
            <span className={classes.groupValue}>
              {t("billing.packQuantity", { n: num(credits), type: creditType(t, pack.type, credits) })}
            </span>
          </div>
          <PackStepper value={packs} disabled={busy} min={1} onChange={setPacks} />
        </div>

        <OrderTotals
          lines={[]}
          subtotal={subtotal}
          total={total}
          chargeable={chargeable}
          percentOff={percentOff}
          couponCode={coupon?.coupon?.code}
          money={money}
        />

        <CouponField amount={subtotal} result={coupon} onChange={onCoupon} />

        <GatewayPicker choice={gatewayChoice} currency={currency} busy={busy} />

        <Button
          fullWidth
          size="lg"
          color="emerald"
          className={classes.pay}
          leftSection={<Lock size={15} />}
          loading={busy}
          disabled={!gatewayChoice.canPay}
          onClick={() => onConfirm(pack, packs, gatewayChoice.gateway, gatewayChoice.phoneForGateway)}
        >
          {t("billing.payAmount", { amount: money(chargeable) })}
        </Button>

        <p className={classes.footnote}>
          <ShieldCheck size={14} />
          <span>{t("billing.addonOneTime")}</span>
        </p>
      </div>
    </Modal>
  );
}
