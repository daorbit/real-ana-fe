import { UnstyledButton } from "@mantine/core";
import { LAYOUT_OPTIONS } from "@/features/popups/lib/popupOptions";
import type { PopupLayout } from "@/features/popups/types";
import { PopupSchematic } from "@/features/popups/components/PopupSchematic";
import { StudioSection } from "@/features/popups/components/studio/StudioSection";
import classes from "@/features/popups/components/studio/PopupStudio.module.css";

export function StyleSection({ layout, onChange }: { layout: PopupLayout; onChange: (layout: PopupLayout) => void }) {
  return (
    <StudioSection step={3} title="Style" description="How it sits on top of your page." done>
      <div className={classes.styleGrid}>
        {LAYOUT_OPTIONS.map((option) => (
          <UnstyledButton
            key={option.value}
            className={classes.option}
            data-active={layout === option.value || undefined}
            onClick={() => onChange(option.value)}
          >
            <PopupSchematic layout={option.value} size="sm" />
            <span className={classes.optionLabel}>{option.label}</span>
            <span className={classes.optionHint}>{option.hint}</span>
          </UnstyledButton>
        ))}
      </div>
    </StudioSection>
  );
}
