import { useEffect, useState } from "react";
import { CloseButton, TextInput, Loader } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Tag } from "lucide-react";
import { useCheckCouponMutation } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import type { CouponCheckResult } from "@/shared/types";
import classes from "./checkout/Checkout.module.css";

export function CouponField({
  amount,
  result,
  onChange,
}: {
  amount: number;
  result: CouponCheckResult | null;
  onChange: (result: CouponCheckResult | null) => void;
}) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [checkCoupon, { isLoading }] = useCheckCouponMutation();

  useEffect(() => {
    const trimmed = code.trim();
    if (!trimmed) {
      onChange(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await checkCoupon({ amount, code: trimmed }).unwrap();
        onChange(res);
      } catch (e) {
        onChange({ amount, error: errMessage(e, t("billing.invalidCoupon")) });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, amount]);

  const applied = result?.coupon;

  if (applied) {
    return (
      <div className={classes.coupon}>
        <span className={classes.couponCode}>
          <Tag size={13} />
          {t("billing.couponOff", { code: applied.code, percent: applied.percentOff })}
        </span>
        <CloseButton
          size="sm"
          aria-label={t("billing.removeCoupon", "Remove coupon")}
          onClick={() => { setCode(""); onChange(null); }}
        />
      </div>
    );
  }

  return (
    <TextInput
      placeholder={t("billing.couponPlaceholder")}
      size="sm"
      radius="md"
      value={code}
      onChange={(e) => setCode(e.currentTarget.value.toUpperCase())}
      leftSection={<Tag size={14} />}
      rightSection={isLoading ? <Loader size={12} /> : undefined}
      error={result?.error}
    />
  );
}
