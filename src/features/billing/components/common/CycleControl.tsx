import { SegmentedControl } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { BillingCycle } from "@/shared/types";

export function CycleControl({
  value,
  onChange,
}: {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}) {
  const { t } = useTranslation();
  return (
    <SegmentedControl
      size="sm"
      radius="md"
      value={value}
      onChange={(v) => onChange(v as BillingCycle)}
      data={[
        { label: t("billing.cycleMonthly"), value: "monthly" },
        { label: t("billing.cycleYearly"), value: "yearly" },
      ]}
    />
  );
}
