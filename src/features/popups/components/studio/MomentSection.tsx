import { Slider, UnstyledButton } from "@mantine/core";
import { ArrowDownToLine, LogOut, Timer, type LucideIcon } from "lucide-react";
import type { PopupInput, PopupTrigger } from "@/features/popups/types";
import { StudioSection } from "@/features/popups/components/studio/StudioSection";
import classes from "@/features/popups/components/studio/PopupStudio.module.css";

const TRIGGERS: { value: PopupTrigger; label: string; hint: string; icon: LucideIcon }[] = [
  { value: "delay", label: "After a delay", hint: "A few seconds after the page opens.", icon: Timer },
  { value: "scroll", label: "On scroll", hint: "Once a visitor has read far enough.", icon: ArrowDownToLine },
  { value: "exit", label: "On exit intent", hint: "As they head to leave. Phones get it after 20s.", icon: LogOut },
];

const DELAY_MARKS = [0, 15, 30, 45, 60].map((value) => ({ value, label: `${value}s` }));
const SCROLL_MARKS = [25, 50, 75, 100].map((value) => ({ value, label: `${value}%` }));

export function MomentSection({
  trigger,
  onChange,
}: {
  trigger: PopupInput["trigger"];
  onChange: (patch: Partial<PopupInput["trigger"]>) => void;
}) {
  return (
    <StudioSection step={2} title="When it opens" description="Timing decides whether a popup helps or annoys." done>
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
        <div>
          <div className={classes.sliderHead}>
            <span className={classes.sliderLabel}>Wait before opening</span>
            <span className={classes.sliderValue}>{trigger.delaySeconds ? `${trigger.delaySeconds} seconds` : "Right away"}</span>
          </div>
          <Slider
            min={0}
            max={60}
            step={1}
            marks={DELAY_MARKS}
            label={null}
            value={Math.min(trigger.delaySeconds, 60)}
            onChange={(v) => onChange({ delaySeconds: v })}
            mb="lg"
          />
        </div>
      )}

      {trigger.type === "scroll" && (
        <div>
          <div className={classes.sliderHead}>
            <span className={classes.sliderLabel}>How far down the page</span>
            <span className={classes.sliderValue}>{trigger.scrollPercent}%</span>
          </div>
          <Slider
            min={10}
            max={100}
            step={5}
            marks={SCROLL_MARKS}
            label={null}
            value={trigger.scrollPercent}
            onChange={(v) => onChange({ scrollPercent: v })}
            mb="lg"
          />
        </div>
      )}
    </StudioSection>
  );
}
