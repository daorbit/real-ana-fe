import { Select } from "@mantine/core";
import { StudioSection } from "@/features/integrations/components/studio/StudioParts";
import { INVOICE_TEMPLATES } from "../../lib/invoicingOptions";
import type { InvoiceTemplate } from "../../types";
import { SettingsList, SettingsRow } from "./SettingsList";
import { LogoField } from "./LogoField";
import { AccentPicker } from "./AccentPicker";
import type { ProfileSectionProps } from "./sectionProps";
import classes from "./fields.module.css";

export function StyleSection({ draft, setField }: ProfileSectionProps) {
  return (
    <StudioSection
      title="Logo and style"
      description="How new documents look. Each one can still pick its own template and colour."
    >
      <SettingsList>
        <SettingsRow label="Logo" hint="PNG, JPG or SVG, up to 300 KB.">
          <LogoField value={draft.logo} onChange={(value) => setField("logo", value)} />
        </SettingsRow>
        <SettingsRow label="Template" hint="See them all in any document's preview.">
          <Select
            aria-label="Template"
            data={INVOICE_TEMPLATES}
            allowDeselect={false}
            className={classes.short}
            value={draft.defaultTemplate}
            onChange={(value) => value && setField("defaultTemplate", value as InvoiceTemplate)}
          />
        </SettingsRow>
        <SettingsRow label="Colour" hint="Used for headings, lines and the total.">
          <AccentPicker value={draft.accentColor} onChange={(value) => setField("accentColor", value)} />
        </SettingsRow>
      </SettingsList>
    </StudioSection>
  );
}
