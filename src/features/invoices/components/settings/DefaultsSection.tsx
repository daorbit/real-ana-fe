import { Textarea } from "@mantine/core";
import { StudioSection } from "@/features/integrations/components/studio/StudioParts";
import { SettingsList, SettingsRow } from "./SettingsList";
import type { ProfileSectionProps } from "./sectionProps";

export function DefaultsSection({ draft, setField }: ProfileSectionProps) {
  return (
    <StudioSection title="Defaults" description="Filled into every new document. You can change them on each one.">
      <SettingsList>
        <SettingsRow label="Notes" alignTop>
          <Textarea
            aria-label="Default notes"
            placeholder="Thank you for your business."
            autosize
            minRows={2}
            value={draft.defaultNotes}
            onChange={(e) => setField("defaultNotes", e.currentTarget.value)}
          />
        </SettingsRow>
        <SettingsRow label="Terms" alignTop>
          <Textarea
            aria-label="Default terms"
            placeholder="Payment due within 30 days of the invoice date."
            autosize
            minRows={2}
            value={draft.defaultTerms}
            onChange={(e) => setField("defaultTerms", e.currentTarget.value)}
          />
        </SettingsRow>
      </SettingsList>
    </StudioSection>
  );
}
