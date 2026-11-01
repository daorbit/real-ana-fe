import { SegmentedControl, TagsInput } from "@mantine/core";
import { StudioSection } from "@/features/popups/components/studio/StudioSection";
import { DEVICE_OPTIONS, PAGE_MODE_OPTIONS } from "@/features/popups/lib/popupOptions";
import type { ExperimentDevices, ExperimentInput, ExperimentPageMode } from "@/features/experiments/types";
import classes from "@/features/popups/components/studio/PopupStudio.module.css";

interface Props {
  draft: ExperimentInput;
  onChange: (patch: Partial<ExperimentInput>) => void;
}

export function TargetingSection({ draft, onChange }: Props) {
  const needsPages = draft.pages.mode !== "all";
  const description =
    draft.type === "split" ? "The page visitors land on before some are sent to the variant." : "Where the test runs.";

  return (
    <StudioSection step={2} title="Where it runs" description={description} done={!needsPages || draft.pages.patterns.length > 0}>
      <div>
        <div className={classes.fieldLabel}>Pages</div>
        <SegmentedControl
          fullWidth
          data={PAGE_MODE_OPTIONS}
          value={draft.pages.mode}
          onChange={(mode) => onChange({ pages: { ...draft.pages, mode: mode as ExperimentPageMode } })}
        />
      </div>
      {needsPages && (
        <TagsInput
          placeholder="/pricing, /blog/*"
          description="Paths on your site. Use * as a wildcard and press Enter after each one."
          maxTags={20}
          value={draft.pages.patterns}
          onChange={(patterns) => onChange({ pages: { ...draft.pages, patterns } })}
          error={draft.pages.patterns.length === 0 ? "Add at least one page" : undefined}
        />
      )}
      <div>
        <div className={classes.fieldLabel}>Devices</div>
        <SegmentedControl
          fullWidth
          data={DEVICE_OPTIONS}
          value={draft.devices}
          onChange={(devices) => onChange({ devices: devices as ExperimentDevices })}
        />
      </div>
    </StudioSection>
  );
}
