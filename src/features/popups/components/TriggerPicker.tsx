import { NumberInput, UnstyledButton } from "@mantine/core";
import { ArrowDownToLine, LogOut, Timer, type LucideIcon } from "lucide-react";
import type { PopupInput, PopupTrigger } from "@/features/popups/types";
import classes from "@/features/popups/components/Popups.module.css";

const TRIGGERS: { value: PopupTrigger; label: string; hint: string; icon: LucideIcon }[] = [
  { value: "delay", label: "After a delay", hint: "A few seconds after the page opens.", icon: Timer },
  { value: "scroll", label: "On scroll", hint: "Once a visitor reads far enough down.", icon: ArrowDownToLine },
  { value: "exit", label: "On exit intent", hint: "When the cursor heads for the close button. Phones get it after 20 seconds.", icon: LogOut },
];

export function TriggerPicker({
  trigger,
  onChange,
}: {
  trigger: PopupInput["trigger"];
  onChange: (patch: Partial<PopupInput["trigger"]>) => void;
}) {
  return (
    <>
      <div className={classes.optionGrid}>
        {TRIGGERS.map((t) => (
          <UnstyledButton
            key={t.value}
            className={classes.option}
            data-active={trigger.type === t.value || undefined}
            onClick={() => onChange({ type: t.value })}
          >
            <span className={classes.optionIcon}>
              <t.icon size={15} />
            </span>
            <span className={classes.optionLabel}>{t.label}</span>
            <span className={classes.optionHint}>{t.hint}</span>
          </UnstyledButton>
        ))}
      </div>
      {trigger.type === "delay" && (
        <NumberInput
          label="Seconds to wait"
          min={0}
          max={120}
          allowDecimal={false}
          clampBehavior="strict"
          value={trigger.delaySeconds}
          onChange={(v) => onChange({ delaySeconds: Number(v) || 0 })}
        />
      )}
      {trigger.type === "scroll" && (
        <NumberInput
          label="How far down the page"
          suffix="%"
          min={10}
          max={100}
          step={10}
          allowDecimal={false}
          clampBehavior="strict"
          value={trigger.scrollPercent}
          onChange={(v) => onChange({ scrollPercent: Number(v) || 50 })}
        />
      )}
    </>
  );
}
