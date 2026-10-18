import { SegmentedControl, TagsInput } from "@mantine/core";
import { DEVICE_OPTIONS, PAGE_MODE_OPTIONS } from "@/features/popups/lib/popupOptions";
import type { PopupInput } from "@/features/popups/types";
import { StudioSection } from "@/features/popups/components/studio/StudioSection";
import classes from "@/features/popups/components/studio/PopupStudio.module.css";

export function AudienceSection({
  draft,
  onDevices,
  onPages,
}: {
  draft: PopupInput;
  onDevices: (devices: PopupInput["devices"]) => void;
  onPages: (patch: Partial<PopupInput["pages"]>) => void;
}) {
  const needsPages = draft.pages.mode !== "all";
  const done = !needsPages || draft.pages.patterns.length > 0;

  return (
    <StudioSection step={4} title="Who sees it" description="Narrow it to the pages and devices where it makes sense." done={done}>
      <div>
        <div className={classes.fieldLabel}>Pages</div>
        <SegmentedControl
          fullWidth
          data={PAGE_MODE_OPTIONS}
          value={draft.pages.mode}
          onChange={(v) => onPages({ mode: v as PopupInput["pages"]["mode"] })}
        />
      </div>
      {needsPages && (
        <TagsInput
          placeholder="/pricing, /blog/*"
          description="Paths on your site. Use * as a wildcard and press Enter after each one."
          maxTags={10}
          value={draft.pages.patterns}
          onChange={(patterns) => onPages({ patterns })}
          error={draft.pages.patterns.length === 0 ? "Add at least one page" : undefined}
        />
      )}
      <div>
        <div className={classes.fieldLabel}>Devices</div>
        <SegmentedControl
          fullWidth
          data={DEVICE_OPTIONS}
          value={draft.devices}
          onChange={(v) => onDevices(v as PopupInput["devices"])}
        />
      </div>
    </StudioSection>
  );
}
