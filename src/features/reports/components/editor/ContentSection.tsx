import type { Dispatch, Ref, SetStateAction } from "react";
import { BarChart3, FileSpreadsheet, Link2, MessageSquareText, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ShareState } from "@/shared/types";
import type { Draft } from "@/features/reports/pages/types";
import { EditorSection, SettingRow, SettingsGroup, type FormSection } from "./EditorSection";
import classes from "./Editor.module.css";

export function ContentSection({
  draft,
  setDraft,
  share,
  sectionRef,
}: {
  draft: Draft;
  setDraft: Dispatch<SetStateAction<Draft>>;
  share?: ShareState;
  sectionRef: (id: FormSection) => Ref<HTMLElement>;
}) {
  const { t } = useTranslation();
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <EditorSection
      id="content"
      title={t("reports.sectionContents")}
      description={t("reports.sectionContentsDesc")}
      sectionRef={sectionRef}
    >
      <SettingsGroup>
        <SettingRow
          icon={BarChart3}
          label={t("reports.includeAnalyticsLabel")}
          hint={t("reports.includeAnalyticsDesc")}
          checked={draft.analytics}
          onChange={(analytics) => set({ analytics })}
        />
        <SettingRow
          icon={MessageSquareText}
          label={t("reports.includeAiLabel")}
          hint={draft.analytics ? t("reports.includeAiShort") : t("reports.includeAiNeedsAnalytics")}
          checked={draft.aiSummary && draft.analytics}
          disabled={!draft.analytics}
          onChange={(aiSummary) => set({ aiSummary })}
        />
        <SettingRow
          icon={Search}
          label={t("reports.includeSeoLabel")}
          hint={t("reports.includeSeoDesc")}
          checked={draft.seo}
          onChange={(seo) => set({ seo })}
        />
        <SettingRow
          icon={FileSpreadsheet}
          label={t("reports.includeXlsxLabel")}
          hint={t("reports.includeXlsxDesc")}
          checked={draft.attachXlsx}
          onChange={(attachXlsx) => set({ attachXlsx })}
        />
        <SettingRow
          icon={Link2}
          label={t("reports.includeLinkLabel")}
          hint={share?.enabled ? t("reports.includeLinkOnDesc") : t("reports.includeLinkOffDesc")}
          checked={draft.dashboardLink}
          onChange={(dashboardLink) => set({ dashboardLink })}
        />
      </SettingsGroup>
      {draft.dashboardLink && !share?.enabled && <div className={classes.note}>{t("reports.dashboardOffWarning")}</div>}
    </EditorSection>
  );
}
