import { SegmentedControl } from "@mantine/core";
import { CURRENCIES } from "@/shared/lib/currency";
import type { Currency } from "@/shared/types";

export function CurrencyControl({
  value,
  onChange,
}: {
  value: Currency;
  onChange: (currency: Currency) => void;
}) {
  return (
    <SegmentedControl
      size="sm"
      radius="md"
      value={value}
      onChange={(v) => onChange(v as Currency)}
      data={CURRENCIES.map((c) => ({ label: c, value: c }))}
    />
  );
}
