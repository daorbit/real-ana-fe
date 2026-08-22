import { Stack, TextInput, Select, Switch, MultiSelect } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { REPORT_FREQUENCIES } from "@/shared/types";
import type { ReportFrequency, Site } from "@/shared/types";
import type { Draft } from "@/features/reports/pages/types";
import { frequencyHint, frequencyLabel } from "@/features/reports/pages/utils";

/** Step one: what the report is called, how often it runs, and over which sites. */
export function ScheduleStep({
  draft,
  setDraft,
  sites,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  sites: Site[];
}) {
  const { t } = useTranslation();

  return (
    <Stack gap="md">
      <TextInput
        label={t("reports.nameLabel")}
        placeholder={t("reports.namePlaceholder")}
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.currentTarget.value })}
      />

      <Select
        label={t("reports.howOften")}
        description={frequencyHint(draft.frequency)}
        data={REPORT_FREQUENCIES.map((f) => ({ value: f, label: frequencyLabel(f) }))}
        value={draft.frequency}
        onChange={(v) => v && setDraft({ ...draft, frequency: v as ReportFrequency })}
        allowDeselect={false}
      />

      <MultiSelect
        label={t("reports.sitesLabel")}
        description={t("reports.sitesDesc")}
        placeholder={draft.siteIds.length ? undefined : t("reports.allSitesPlaceholder")}
        data={sites.map((s) => ({ value: s.siteId, label: s.name }))}
        value={draft.siteIds}
        onChange={(v) => setDraft({ ...draft, siteIds: v })}
        searchable
        clearable
      />

      <Switch
        label={t("reports.activeLabel")}
        description={t("reports.activeDesc")}
        checked={draft.enabled}
        onChange={(e) => setDraft({ ...draft, enabled: e.currentTarget.checked })}
      />
    </Stack>
  );
}
