import { useState } from "react";
import { NumberInput, SegmentedControl } from "@mantine/core";
import { FREQUENCY_PRESETS } from "@/features/popups/lib/popupOptions";
import { StudioSection } from "@/features/popups/components/studio/StudioSection";
import classes from "@/features/popups/components/studio/PopupStudio.module.css";

const CUSTOM = "custom";

export function FrequencySection({ days, onChange }: { days: number; onChange: (days: number) => void }) {
  const preset = FREQUENCY_PRESETS.some((p) => p.value === days);
  const [custom, setCustom] = useState(!preset);
  const value = custom || !preset ? CUSTOM : String(days);

  return (
    <StudioSection step={5} title="How often" description="How long to wait before showing it to the same visitor again." done>
      <SegmentedControl
        fullWidth
        data={[...FREQUENCY_PRESETS.map((p) => ({ value: String(p.value), label: p.label })), { value: CUSTOM, label: "Custom" }]}
        value={value}
        onChange={(v) => {
          if (v === CUSTOM) return setCustom(true);
          setCustom(false);
          onChange(Number(v));
        }}
      />
      {value === CUSTOM && (
        <NumberInput
          label="Show again after"
          suffix=" days"
          min={0}
          max={365}
          allowDecimal={false}
          clampBehavior="strict"
          value={days}
          onChange={(v) => onChange(Number(v) || 0)}
        />
      )}
      <div className={classes.hint}>Anyone who submits the form never sees this popup again.</div>
    </StudioSection>
  );
}
