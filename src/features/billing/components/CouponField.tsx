import { useEffect, useState } from "react";
import { Group, Badge, Button, TextInput, Loader } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Tag, X } from "lucide-react";
import { useCheckCouponMutation } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import type { CouponCheckResult } from "@/shared/types";

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
      <Group gap={6} wrap="nowrap">
        <Badge size="sm" variant="light" color="emerald" leftSection={<Tag size={11} />}>
          {t("billing.couponOff", { code: applied.code, percent: applied.percentOff })}
        </Badge>
        <Button
          size="compact-xs"
          variant="subtle"
          color="gray"
          onClick={() => { setCode(""); onChange(null); }}
        >
          <X size={12} />
        </Button>
      </Group>
    );
  }

  return (
    <TextInput
      placeholder={t("billing.couponPlaceholder")}
      size="sm"
      value={code}
      onChange={(e) => setCode(e.currentTarget.value.toUpperCase())}
      leftSection={<Tag size={14} />}
      rightSection={isLoading ? <Loader size={12} /> : undefined}
      error={result?.error}
    />
  );
}
