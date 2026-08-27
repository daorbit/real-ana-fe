import { Group, NumberInput, UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Plus, Minus } from "lucide-react";
import { MAX_PACKS } from "../lib/constants";

export function PackStepper({
  value,
  onChange,
  disabled,
  min = 0,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  /** Floor. The plan dialog allows zero; the addon dialog needs at least one. */
  min?: number;
}) {
  const { t } = useTranslation();
  const clamp = (n: number) => Math.max(min, Math.min(MAX_PACKS, n));

  // One joined control rather than three spaced ones: a single 30px-tall
  // segmented block reads as one widget and stops the buttons and the field
  // from disagreeing about their heights.
  const H = 30;

  const step = (delta: number, label: string, disabledWhen: boolean) => (
    <UnstyledButton
      aria-label={label}
      disabled={disabled || disabledWhen}
      onClick={() => onChange(clamp(value + delta))}
      style={{
        width: H,
        height: H,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: disabled || disabledWhen
          ? "var(--mantine-color-dimmed)"
          : "var(--mantine-color-text)",
        cursor: disabled || disabledWhen ? "not-allowed" : "pointer",
        opacity: disabled || disabledWhen ? 0.4 : 1,
      }}
    >
      {delta < 0 ? <Minus size={13} /> : <Plus size={13} />}
    </UnstyledButton>
  );

  return (
    <Group
      gap={0}
      wrap="nowrap"
      style={{
        border: "1px solid var(--mantine-color-default-border)",
        borderRadius: 8,
        overflow: "hidden",
        height: H,
      }}
    >
      {step(-1, t("billing.oneFewer"), value <= min)}
      <NumberInput
        value={value}
        onChange={(v) => onChange(clamp(Number(v) || 0))}
        min={min}
        max={MAX_PACKS}
        clampBehavior="strict"
        hideControls
        disabled={disabled}
        size="xs"
        styles={{
          input: {
            width: 34,
            height: H,
            minHeight: H,
            textAlign: "center",
            fontWeight: 650,
            fontSize: 13,
            // The border is on the wrapper; an inner one would double up.
            border: "none",
            borderLeft: "1px solid var(--mantine-color-default-border)",
            borderRight: "1px solid var(--mantine-color-default-border)",
            borderRadius: 0,
            padding: 0,
            background: "transparent",
          },
        }}
      />
      {step(1, t("billing.oneMore"), value >= MAX_PACKS)}
    </Group>
  );
}

