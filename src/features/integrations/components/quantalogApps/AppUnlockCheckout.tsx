import { useState } from "react";
import { Button, CloseButton, Modal } from "@mantine/core";
import { Lock, LockOpen, ShieldCheck } from "lucide-react";
import { CheckoutProduct } from "@/features/billing/components/checkout/CheckoutProduct";
import { OrderTotals } from "@/features/billing/components/checkout/OrderTotals";
import { GatewayPicker } from "@/features/billing/components/checkout/GatewayPicker";
import { CouponField } from "@/features/billing/components/CouponField";
import { useGatewayChoice } from "@/features/billing/hooks/useGatewayChoice";
import type { CouponValidationState } from "@/features/billing/hooks/useCouponCode";
import { MIN_CHARGE } from "@/features/billing/lib/constants";
import { formatMoney } from "@/shared/lib/currency";
import type { CouponCheckResult, Currency } from "@/shared/types";
import { BrandMark } from "../logos/BrandMarks";
import type { WorkspaceAppInfo } from "../../lib/quantalogApps";
import type { UnlockRequest } from "../../hooks/useAppUnlock";
import classes from "@/features/billing/components/checkout/Checkout.module.css";

export function AppUnlockCheckout({
  info,
  opened,
  price,
  currency,
  busy,
  canManage,
  onClose,
  onConfirm,
}: {
  info: WorkspaceAppInfo;
  opened: boolean;
  price: number;
  currency: Currency;
  busy: boolean;
  canManage: boolean;
  onClose: () => void;
  onConfirm: (request: UnlockRequest) => void;
}) {
  const [coupon, setCoupon] = useState<CouponCheckResult | null>(null);
  const [couponState, setCouponState] = useState<CouponValidationState>("empty");
  const gatewayChoice = useGatewayChoice(currency);

  const money = (amountMinor: number) => formatMoney(amountMinor, currency);
  const percentOff = coupon?.coupon?.percentOff ?? 0;
  const total = percentOff ? Math.floor((price * (100 - percentOff)) / 100) : price;
  const free = total === 0;
  const chargeable = free ? 0 : Math.max(total, MIN_CHARGE);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      zIndex={400}
      radius={22}
      size={440}
      padding={0}
      classNames={{ content: classes.modal, body: classes.body }}
    >
      <CloseButton className={classes.close} onClick={onClose} disabled={busy} aria-label="Close" />

      <div className={classes.single}>
        <CheckoutProduct
          mark={<BrandMark id={info.tileId} size={26} />}
          eyebrow="Unlock app"
          name={info.name}
          meta="One-time payment for this workspace"
          price={money(price)}
          per="once"
        />

        <OrderTotals
          lines={[]}
          subtotal={price}
          total={total}
          chargeable={chargeable}
          percentOff={percentOff}
          couponCode={coupon?.coupon?.code}
          money={money}
        />

        <CouponField amount={price} result={coupon} onChange={setCoupon} onValidationChange={setCouponState} />

        {!free && <GatewayPicker choice={gatewayChoice} currency={currency} busy={busy} />}

        <Button
          fullWidth
          size="lg"
          color="emerald"
          className={classes.pay}
          leftSection={free ? <LockOpen size={15} /> : <Lock size={15} />}
          loading={busy}
          disabled={
            !canManage ||
            couponState === "checking" ||
            couponState === "invalid" ||
            (!free && !gatewayChoice.canPay)
          }
          onClick={() =>
            onConfirm({
              couponCode: coupon?.coupon?.code,
              gateway: gatewayChoice.gateway,
              phone: free ? undefined : gatewayChoice.phoneForGateway,
            })
          }
        >
          {!canManage ? "Ask an admin to unlock" : free ? "Unlock for free" : `Pay ${money(chargeable)}`}
        </Button>

        <p className={classes.footnote}>
          <ShieldCheck size={14} />
          <span>
            {!canManage
              ? `Only a workspace admin can unlock ${info.name}. Ask an admin to complete the one-time purchase.`
              : free
              ? `Your coupon covers the full price, so nothing is charged. ${info.name} unlocks for this workspace for good and turns on right away.`
              : `Pay once and ${info.name} stays unlocked for this workspace for good. It turns on as soon as payment is confirmed, and you get a receipt by email.`}
          </span>
        </p>
      </div>
    </Modal>
  );
}
