import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCheckCouponMutation } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import type { CouponCheckResult } from "@/shared/types";

const CHECK_DELAY_MS = 400;

export type CouponValidationState = "empty" | "checking" | "valid" | "invalid";

export function useCouponCode(
  amount: number,
  onChange: (result: CouponCheckResult | null) => void,
  initialCode?: string,
  onValidationChange?: (state: CouponValidationState) => void,
) {
  const { t } = useTranslation();
  const [code, setCode] = useState(initialCode ?? "");
  const [open, setOpen] = useState(Boolean(initialCode));
  const [validating, setValidating] = useState(false);
  const [checkCoupon] = useCheckCouponMutation();
  const validationChange = useRef(onValidationChange);
  validationChange.current = onValidationChange;

  useEffect(() => {
    const trimmed = code.trim();
    if (!trimmed) {
      setValidating(false);
      onChange(null);
      validationChange.current?.("empty");
      return;
    }
    let active = true;
    setValidating(true);
    validationChange.current?.("checking");
    const timer = setTimeout(async () => {
      try {
        const result = await checkCoupon({ amount, code: trimmed }).unwrap();
        if (!active) return;
        onChange(result);
        validationChange.current?.(result.coupon ? "valid" : "invalid");
      } catch (e) {
        if (!active) return;
        onChange({ amount, error: errMessage(e, t("billing.invalidCoupon")) });
        validationChange.current?.("invalid");
      } finally {
        if (active) setValidating(false);
      }
    }, CHECK_DELAY_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, amount]);

  return {
    code,
    open,
    checking: validating,
    openField: () => setOpen(true),
    type: (value: string) => {
      const next = value.toUpperCase();
      setCode(next);
      validationChange.current?.(next.trim() ? "checking" : "empty");
    },
    blur: () => {
      if (!code.trim()) setOpen(false);
    },
    clear: () => {
      setCode("");
      setOpen(false);
      onChange(null);
      validationChange.current?.("empty");
    },
  };
}
