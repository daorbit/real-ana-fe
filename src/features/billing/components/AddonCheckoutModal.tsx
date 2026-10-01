import { useEffect, useState } from "react";
import { Button, CloseButton, Modal } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { ShieldCheck, ShoppingCart } from "lucide-react";
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
      radius="lg"
      size={480}
      padding={0}
      classNames={{ content: classes.modal, body: classes.body }}
    >
      <CloseButton className={classes.close} onClick={onClose} disabled={busy} aria-label={t("common.cancel")} />

      <div className={classes.single}>
        <div className={classes.top}>
          <span className={classes.eyebrow}>{t("billing.confirmPurchase")}</span>
        </div>

        <CheckoutProduct
          mark={<PackIcon type={pack.type} size={22} />}
          name={pack.name}
          meta={t("billing.packUnitPerPack", {
            n: pack.quantity,
            type: creditType(t, pack.type, pack.quantity),
            price: money(unit),
          })}
        />

        <div className={classes.quantity}>
          <div>
            <p className={classes.quantityLabel}>{t("billing.howManyPacks")}</p>
            <p className={classes.quantityHint}>
              {t("billing.packTotal", { n: credits, type: creditType(t, pack.type, credits) })}
            </p>
          </div>
          <PackStepper value={packs} disabled={busy} min={1} onChange={setPacks} />
        </div>

        <OrderTotals
          lines={[{ key: pack._id, label: t("billing.packTimes", { name: pack.name, packs }), value: subtotal }]}
          subtotal={subtotal}
          total={total}
          chargeable={chargeable}
          percentOff={percentOff}
          couponCode={coupon?.coupon?.code}
          money={money}
        />

        <CouponField amount={subtotal} result={coupon} onChange={onCoupon} />

        <GatewayPicker choice={gatewayChoice} currency={currency} busy={busy} />

        <div className={classes.actions}>
          <Button
            fullWidth
            size="lg"
            radius="md"
            color="emerald"
            leftSection={<ShoppingCart size={17} />}
            loading={busy}
            disabled={!gatewayChoice.canPay}
            onClick={() => onConfirm(pack, packs, gatewayChoice.gateway, gatewayChoice.phoneForGateway)}
          >
            {t("billing.payAmount", { amount: money(chargeable) })}
          </Button>
          <Button fullWidth variant="subtle" color="gray" radius="md" onClick={onClose} disabled={busy}>
            {t("common.cancel")}
          </Button>
        </div>

        <p className={classes.footnote}>
          <ShieldCheck size={14} />
          <span>{t("billing.addonOneTime")}</span>
        </p>
      </div>
    </Modal>
  );
}
