import type { Dispatch, Ref, SetStateAction } from "react";
import { MultiSelect, SegmentedControl, TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { REPORT_FREQUENCIES, type ReportFrequency, type Site } from "@/shared/types";
import type { Draft } from "@/features/reports/pages/types";
import { frequencyHint, frequencyLabel } from "@/features/reports/pages/utils";
import { EditorSection, SettingsField, SettingsGroup, type FormSection } from "./EditorSection";

export function BasicsSection({
  draft,
  setDraft,
  sites,
  sectionRef,
}: {
  draft: Draft;
  setDraft: Dispatch<SetStateAction<Draft>>;
  sites: Site[];
  sectionRef: (id: FormSection) => Ref<HTMLElement>;
}) {
  const { t } = useTranslation();

  return (
    <EditorSection
      id="schedule"
      title={t("reports.sectionBasics")}
      description={t("reports.sectionBasicsDesc")}
      sectionRef={sectionRef}
    >
      <SettingsGroup>
        <SettingsField label={t("reports.nameLabel")}>
          <TextInput
            placeholder={t("reports.namePlaceholder")}
            aria-label={t("reports.nameLabel")}
            value={draft.name}
            onChange={(e) => {
              const name = e.currentTarget.value;
              setDraft((d) => ({ ...d, name }));
            }}
            data-autofocus
          />
        </SettingsField>

        <SettingsField label={t("reports.howOften")} hint={frequencyHint(draft.frequency)}>
          <SegmentedControl
            fullWidth
            radius="md"
            value={draft.frequency}
            onChange={(v) => setDraft((d) => ({ ...d, frequency: v as ReportFrequency }))}
            data={REPORT_FREQUENCIES.map((f) => ({ value: f, label: frequencyLabel(f) }))}
            aria-label={t("reports.howOften")}
          />
        </SettingsField>

        <SettingsField label={t("reports.sitesLabel")} hint={t("reports.sitesDesc")}>
          <MultiSelect
            aria-label={t("reports.sitesLabel")}
            placeholder={draft.siteIds.length ? undefined : t("reports.allSitesPlaceholder")}
            data={sites.map((s) => ({ value: s.siteId, label: s.name }))}
            value={draft.siteIds}
            onChange={(siteIds) => setDraft((d) => ({ ...d, siteIds }))}
            searchable
            clearable
            comboboxProps={{ withinPortal: true }}
          />
        </SettingsField>
      </SettingsGroup>
    </EditorSection>
  );
}
