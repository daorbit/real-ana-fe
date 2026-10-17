import { useState } from "react";
import { Button, Group, Modal, Select, Stack, Text } from "@mantine/core";
import { useCheckCouponMutation } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { priceIn } from "@/shared/lib/currency";
import { CURRENCIES } from "@/shared/types";
import type { Coupon, Currency, Plan } from "@/shared/types";
import { money } from "./billingFormat";
import classes from "@/features/admin/components/Admin.module.css";

export function CouponPreview({ coupon, plans, onClose }: { coupon: Coupon | null; plans: Plan[]; onClose: () => void }) {
  const [planSlug, setPlanSlug] = useState<string | null>(null);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [checkCoupon, { isLoading }] = useCheckCouponMutation();
  const [result, setResult] = useState<{ amount: number; error?: string } | null>(null);

  const plan = plans.find((p) => p.slug === planSlug) ?? plans[0] ?? null;
  const listPrice = plan ? priceIn(cycle === "yearly" ? plan.priceYearly : plan.priceMonthly, currency) : 0;

  const run = async () => {
    if (!coupon || !plan) return;
    setResult(null);
    try {
      setResult(await checkCoupon({ amount: listPrice, code: coupon.code }).unwrap());
    } catch (e) {
      setResult({ amount: listPrice, error: errMessage(e, "Invalid coupon") });
    }
  };

  return (
    <Modal opened={!!coupon} onClose={onClose} title={coupon ? `Try ${coupon.code}` : ""} radius="lg" centered>
      {coupon && (
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            Runs the same check checkout uses, so this is exactly what a customer would pay.
          </Text>
          <Select
            label="Plan"
            value={plan?.slug ?? null}
            onChange={(v) => { setPlanSlug(v); setResult(null); }}
            data={plans.map((p) => ({ value: p.slug, label: p.name }))}
          />
          <div className={classes.formRow}>
            <Select
              label="Billing"
              value={cycle}
              onChange={(v) => { setCycle((v as "monthly" | "yearly") ?? "monthly"); setResult(null); }}
              data={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]}
            />
            <Select
              label="Currency"
              value={currency}
              onChange={(v) => { setCurrency((v as Currency) ?? "INR"); setResult(null); }}
              data={CURRENCIES.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <Group justify="space-between" mt="xs">
            <Text size="sm" c="dimmed">List price</Text>
            <Text size="sm">{money(listPrice, currency)}</Text>
          </Group>

          {result &&
            (result.error ? (
              <Text size="sm" c="red">{result.error}</Text>
            ) : (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">After {coupon.percentOff}% off</Text>
                <Text size="sm" fw={700}>{money(result.amount, currency)}</Text>
              </Group>
            ))}

          <Button color="emerald" loading={isLoading} onClick={run} disabled={!plan}>
            Check price
          </Button>
        </Stack>
      )}
    </Modal>
  );
}
