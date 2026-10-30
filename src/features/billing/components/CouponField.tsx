import { CloseButton, TextInput, Loader, UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Tag } from "lucide-react";
import type { CouponCheckResult } from "@/shared/types";
import { useCouponCode, type CouponValidationState } from "../hooks/useCouponCode";
import classes from "./checkout/Checkout.module.css";

export function CouponField({
  amount,
  result,
  onChange,
  initialCode,
  onValidationChange,
}: {
  amount: number;
  result: CouponCheckResult | null;
  onChange: (result: CouponCheckResult | null) => void;
  initialCode?: string;
  onValidationChange?: (state: CouponValidationState) => void;
}) {
  const { t } = useTranslation();
  const coupon = useCouponCode(amount, onChange, initialCode, onValidationChange);
  const applied = result?.coupon;

  if (!applied && !coupon.open && !coupon.code) {
    return (
      <UnstyledButton className={classes.couponToggle} onClick={coupon.openField}>
        <Tag size={14} />
        {t("billing.addCoupon", "Add a coupon code")}
      </UnstyledButton>
    );
  }

  if (applied) {
    return (
      <div className={classes.coupon}>
        <span className={classes.couponCode}>
          <Tag size={13} />
          {t("billing.couponOff", { code: applied.code, percent: applied.percentOff })}
        </span>
        <CloseButton size="sm" aria-label={t("billing.removeCoupon", "Remove coupon")} onClick={coupon.clear} />
      </div>
    );
  }

  return (
    <TextInput
      placeholder={t("billing.couponPlaceholder")}
      size="sm"
      radius="md"
      autoFocus
      onBlur={coupon.blur}
      value={coupon.code}
      onChange={(e) => coupon.type(e.currentTarget.value)}
      leftSection={<Tag size={14} />}
      rightSection={coupon.checking ? <Loader size={12} /> : undefined}
      error={result?.error}
    />
  );
}
