import { Stack, Text, Checkbox, Alert } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { ShareState } from "@/shared/types";
import type { Draft } from "@/features/reports/pages/types";

/** Step three: which sections the report carries. */
export function ContentStep({
  draft,
  setDraft,
  share,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  share?: ShareState;
}) {
  const { t } = useTranslation();

  return (
    <Stack gap="md">
      <div>
        <Text size="sm" fw={500} mb={8}>{t("reports.whatToInclude")}</Text>
        <Stack gap={8}>
          <Checkbox
            label={t("reports.includeAnalyticsLabel")}
            description={t("reports.includeAnalyticsDesc")}
            checked={draft.analytics}
            onChange={(e) => setDraft({ ...draft, analytics: e.currentTarget.checked })}
          />
          <Checkbox
            label={t("reports.includeSeoLabel")}
            description={t("reports.includeSeoDesc")}
            checked={draft.seo}
            onChange={(e) => setDraft({ ...draft, seo: e.currentTarget.checked })}
          />
          {/* Directly under analytics, because it is written from those figures
              and cannot appear without them — which is also why it disables
              rather than hides when analytics is off: a control that vanishes
              reads as a bug, one that greys out explains itself. */}
          <Checkbox
            label={t("reports.includeAiLabel")}
            description={
              draft.analytics
                ? t("reports.includeAiDesc")
                : t("reports.includeAiNeedsAnalytics")
            }
            disabled={!draft.analytics}
            checked={draft.aiSummary && draft.analytics}
            onChange={(e) => setDraft({ ...draft, aiSummary: e.currentTarget.checked })}
          />
          <Checkbox
            label={t("reports.includeXlsxLabel")}
            description={t("reports.includeXlsxDesc")}
            checked={draft.attachXlsx}
            onChange={(e) => setDraft({ ...draft, attachXlsx: e.currentTarget.checked })}
          />
          <Checkbox
            label={t("reports.includeLinkLabel")}
            description={
              share?.enabled
                ? t("reports.includeLinkOnDesc")
                : t("reports.includeLinkOffDesc")
            }
            checked={draft.dashboardLink}
            onChange={(e) => setDraft({ ...draft, dashboardLink: e.currentTarget.checked })}
          />
        </Stack>
        {draft.dashboardLink && !share?.enabled && (
          <Alert color="yellow" mt="xs" radius="md" p="xs">
            <Text size="xs">{t("reports.dashboardOffWarning")}</Text>
          </Alert>
        )}
      </div>
    </Stack>
  );
}
