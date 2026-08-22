import { Text, Group, Stack, Badge, Divider, Box } from "@mantine/core";
import {
  BarChart3, MessageCircle, Mail, FileSpreadsheet,
  Link as LinkIcon, Search, PenLine,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Site } from "@/shared/types";
import type { Draft } from "@/features/reports/pages/types";
import { frequencyLabel } from "@/features/reports/pages/utils";

/**
 * A mock of the report this draft will produce.
 *
 * The right-hand pane, matching the share composer: the draft describes a
 * document nobody sees until it lands in an inbox, so showing the shape of that
 * document is what makes the checkboxes mean something.
 */
export function ReportPreview({
  draft,
  sites,
  shareEnabled,
}: {
  draft: Draft;
  sites: Site[];
  shareEnabled: boolean;
}) {
  const { t } = useTranslation();

  const scope = draft.siteIds.length
    ? sites.filter((s) => draft.siteIds.includes(s.siteId)).map((s) => s.name)
    : [t("reports.allSitesPlaceholder")];

  // Only sections actually switched on, in the order they appear in the email.
  const sections = [
    draft.analytics && { Icon: BarChart3, label: t("reports.includeAnalyticsLabel") },
    draft.aiSummary && draft.analytics && { Icon: PenLine, label: t("reports.includeAiLabel") },
    draft.seo && { Icon: Search, label: t("reports.includeSeoLabel") },
    draft.attachXlsx && { Icon: FileSpreadsheet, label: t("reports.includeXlsxLabel") },
    draft.dashboardLink && shareEnabled && { Icon: LinkIcon, label: t("reports.includeLinkLabel") },
  ].filter(Boolean) as { Icon: typeof BarChart3; label: string }[];

  return (
    <Box className="report-preview-doc">
      <Box className="report-preview-head">
        <Text className="report-preview-kicker">{frequencyLabel(draft.frequency)}</Text>
        <Text className="report-preview-title">
          {draft.name.trim() || t("reports.namePlaceholder")}
        </Text>
        <Text className="report-preview-scope">{scope.join(", ")}</Text>
      </Box>

      {/* Empty is a real state: every section can be switched off, and an
          invented mock would be lying about what would arrive. */}
      {sections.length === 0 ? (
        <Box className="report-preview-empty">
          <Text size="sm" c="dimmed">{t("reports.previewEmpty")}</Text>
        </Box>
      ) : (
        <Stack gap={10} className="report-preview-sections">
          {sections.map(({ Icon, label }) => (
            <Group key={label} gap={10} wrap="nowrap" className="report-preview-section">
              <span className="report-preview-section-ic"><Icon size={14} /></span>
              <Text size="sm" fw={500}>{label}</Text>
            </Group>
          ))}
        </Stack>
      )}

      <Divider my="md" />

      <Group gap={8} wrap="wrap">
        {draft.emailChannel && (
          <Badge variant="light" leftSection={<Mail size={11} />}>
            {t("reports.channelEmail")}
          </Badge>
        )}
        {draft.whatsappChannel && (
          <Badge variant="light" color="teal" leftSection={<MessageCircle size={11} />}>
            {t("reports.channelWhatsApp")}
          </Badge>
        )}
        {/* A schedule with no channel never sends, which is worth saying on the
            preview rather than only failing validation on save. */}
        {!draft.emailChannel && !draft.whatsappChannel && (
          <Badge variant="light" color="red">{t("reports.previewNoChannel")}</Badge>
        )}
        {!draft.enabled && (
          <Badge variant="light" color="gray">{t("reports.previewPaused")}</Badge>
        )}
      </Group>
    </Box>
  );
}
