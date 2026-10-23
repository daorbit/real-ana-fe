import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCheckCouponMutation } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import type { CouponCheckResult } from "@/shared/types";

const CHECK_DELAY_MS = 400;

export function useCouponCode(
  amount: number,
  onChange: (result: CouponCheckResult | null) => void,
  initialCode?: string,
) {
  const { t } = useTranslation();
  const [code, setCode] = useState(initialCode ?? "");
  const [open, setOpen] = useState(Boolean(initialCode));
  const [checkCoupon, { isLoading }] = useCheckCouponMutation();

  useEffect(() => {
    const trimmed = code.trim();
    if (!trimmed) {
      onChange(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        onChange(await checkCoupon({ amount, code: trimmed }).unwrap());
      } catch (e) {
        onChange({ amount, error: errMessage(e, t("billing.invalidCoupon")) });
      }
    }, CHECK_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, amount]);

  return {
    code,
    open,
    checking: isLoading,
    openField: () => setOpen(true),
    type: (value: string) => setCode(value.toUpperCase()),
    blur: () => {
      if (!code.trim()) setOpen(false);
    },
    clear: () => {
      setCode("");
      setOpen(false);
      onChange(null);
    },
  };
}
