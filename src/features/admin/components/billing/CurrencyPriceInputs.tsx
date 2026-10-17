import { NumberInput, Stack, Text } from "@mantine/core";
import { CURRENCIES, CURRENCY_SYMBOLS } from "@/shared/types";
import type { CurrencyPrices } from "@/shared/types";
import classes from "@/features/admin/components/Admin.module.css";

export function CurrencyPriceInputs({
  label,
  values,
  onChange,
}: {
  label: string;
  values: CurrencyPrices;
  onChange: (values: CurrencyPrices) => void;
}) {
  return (
    <Stack gap={4}>
      <Text size="sm" fw={500}>{label}</Text>
      <div className={classes.priceGrid}>
        {CURRENCIES.map((c) => (
          <NumberInput
            key={c}
            label={c}
            leftSection={<Text size="sm" c="dimmed">{CURRENCY_SYMBOLS[c]}</Text>}
            value={values[c] || undefined}
            onChange={(v) => onChange({ ...values, [c]: Number(v) || 0 })}
            min={0}
          />
        ))}
      </div>
    </Stack>
  );
}
