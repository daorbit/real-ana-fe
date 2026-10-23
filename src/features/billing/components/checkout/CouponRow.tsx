import { Loader, TextInput, UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Plus, Tag } from "lucide-react";
import type { CouponCheckResult } from "@/shared/types";
import { useCouponCode } from "../../hooks/useCouponCode";
import classes from "./Checkout.module.css";

export function CouponRow({
  amount,
  result,
  onChange,
  initialCode,
  firstPaymentOnly,
}: {
  amount: number;
  result: CouponCheckResult | null;
  onChange: (result: CouponCheckResult | null) => void;
  initialCode?: string;
  firstPaymentOnly: boolean;
}) {
  const { t } = useTranslation();
  const coupon = useCouponCode(amount, onChange, initialCode);
  const applied = result?.coupon;
  const editing = !applied && (coupon.open || !!coupon.code);

  const icon = (
    <span className={classes.optionIcon}>
      <Tag size={14} />
    </span>
  );

  if (applied) {
    return (
      <div className={classes.optionRow}>
        {icon}
        <span className={classes.optionText}>
          <span className={classes.optionTitle}>{applied.code}</span>
          <span className={classes.optionDesc} data-tone="saving">
            {firstPaymentOnly
              ? t("billing.couponFirstPayment", "{{percent}}% off your first payment", { percent: applied.percentOff })
              : t("billing.couponPercentOff", "{{percent}}% off", { percent: applied.percentOff })}
          </span>
        </span>
        <UnstyledButton className={classes.optionPill} data-tone="neutral" onClick={coupon.clear}>
          {t("billing.couponRemove", "Remove")}
        </UnstyledButton>
      </div>
    );
  }

  if (editing) {
    return (
      <div className={classes.optionRow}>
        {icon}
        <TextInput
          className={classes.optionInput}
          placeholder={t("billing.couponPlaceholder")}
          size="sm"
          radius="md"
          autoFocus
          onBlur={coupon.blur}
          value={coupon.code}
          onChange={(e) => coupon.type(e.currentTarget.value)}
          rightSection={coupon.checking ? <Loader size={12} /> : undefined}
          error={result?.error}
        />
      </div>
    );
  }

  return (
    <UnstyledButton className={`${classes.optionRow} ${classes.optionRowButton}`} onClick={coupon.openField}>
      {icon}
      <span className={classes.optionText}>
        <span className={classes.optionTitle}>{t("billing.couponTitle", "Coupon")}</span>
        <span className={classes.optionDesc}>{t("billing.couponHint", "Have a code? Add it here")}</span>
      </span>
      <span className={classes.optionPill}>
        <Plus size={13} strokeWidth={2.4} />
        {t("billing.couponAddCode", "Add code")}
      </span>
    </UnstyledButton>
  );
}
