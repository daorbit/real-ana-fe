import { NumberInput, UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Plus, Minus } from "lucide-react";
import { MAX_PACKS } from "../lib/constants";
import classes from "./checkout/Checkout.module.css";

export function PackStepper({
  value,
  onChange,
  disabled,
  min = 0,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  min?: number;
}) {
  const { t } = useTranslation();
  const clamp = (n: number) => Math.max(min, Math.min(MAX_PACKS, n));

  return (
    <div className={classes.stepper}>
      <UnstyledButton
        className={classes.stepButton}
        aria-label={t("billing.oneFewer")}
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
      >
        <Minus size={13} />
      </UnstyledButton>
      <NumberInput
        value={value}
        onChange={(v) => onChange(clamp(Number(v) || 0))}
        min={min}
        max={MAX_PACKS}
        clampBehavior="strict"
        hideControls
        disabled={disabled}
        size="xs"
        classNames={{ input: classes.stepInput }}
      />
      <UnstyledButton
        className={classes.stepButton}
        aria-label={t("billing.oneMore")}
        disabled={disabled || value >= MAX_PACKS}
        onClick={() => onChange(clamp(value + 1))}
      >
        <Plus size={13} />
      </UnstyledButton>
    </div>
  );
}
