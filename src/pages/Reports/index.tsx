import {
  Text, Button, Stack, Center, Loader, Alert, Box, ThemeIcon, SimpleGrid,
} from "@mantine/core";
import {
  Plus, Mail, MailWarning, CalendarClock, BarChart3, FileSpreadsheet, Clock, Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppShell } from "../../components/AppShell";
import { PageHeader, PageStack } from "../../components/Page";
import { PageHelpButton } from "../../components/PageHelpButton";
import { StatTile, ReportCard } from "./ReportCard";
import { ReportDialog } from "./ReportDialog";
import { useReportsPage, useReportDialog } from "./hooks";
import { nextSendLabel } from "./utils";

/**
 * Reports.
 *
 * The two things this screen has to make obvious, because getting either wrong
 * is what turns a useful report into an embarrassing one:
 *
 *  - who receives it. Recipients are usually people outside the account — a
 *    client, a manager — so addresses are listed rather than counted, and
 *    anyone who unsubscribed stays visible instead of quietly vanishing.
 *  - that the live dashboard link is public. Including it publishes the
 *    workspace to anyone holding the link, which the UI says in those words.
 *
 * Laid out as cards rather than table rows: a report is a configuration with
 * five or six facets, and a row forces each of them into a column too narrow to
 * say anything useful.
 *
 * The page itself is a shell — data and actions live in `hooks.tsx`, the card
 * and the dialog in their own files.
 */
export default function Reports() {
  const { t } = useTranslation();
  const page = useReportsPage();
  const dialog = useReportDialog({
    waEntitled: page.waEntitled,
    ownerMobile: page.ownerMobile,
    persist: page.persist,
  });

  return (
    <AppShell>
      {/* Full width rather than the usual capped column: a report card is a row
          of facets — channels, recipients, next send — and a narrow page pushes
          them onto stacked lines that read as unrelated. */}
      <PageStack maxWidth="100%">
        <PageHeader
          title={t("reports.title")}
          description={t("reports.description")}
          actions={
            <>
              <Button leftSection={<Plus size={15} />} onClick={dialog.openNew} disabled={!page.workspaceId}>
                {t("reports.newReport")}
              </Button>
              <PageHelpButton />
            </>
          }
        />

        {!page.mailReady && (
          <Alert color="orange" icon={<MailWarning size={16} />} radius="md">
            {t("reports.mailNotConfigured")}
          </Alert>
        )}

        {page.isLoading ? (
          <Center py={64}><Loader size="sm" /></Center>
        ) : !page.schedules.length ? (
          <Box className="surface-card" py={64} px="xl">
            <Stack align="center" gap={6}>
              <ThemeIcon size={56} radius="xl" variant="light" color="emerald" mb="xs">
                <CalendarClock size={26} />
              </ThemeIcon>
              <Text fw={650} size="lg">{t("reports.emptyTitle")}</Text>
              <Text size="sm" c="dimmed" ta="center" maw={460} lh={1.6}>
                {t("reports.emptyBody")}
              </Text>

              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mt="xl" w="100%" maw={620}>
                {[
                  { id: "traffic", icon: BarChart3, title: t("reports.emptyFeatureTrafficTitle"), body: t("reports.emptyFeatureTrafficBody") },
                  { id: "sheet", icon: FileSpreadsheet, title: t("reports.emptyFeatureSheetTitle"), body: t("reports.emptyFeatureSheetBody") },
                  { id: "anyone", icon: Users, title: t("reports.emptyFeatureAnyoneTitle"), body: t("reports.emptyFeatureAnyoneBody") },
                ].map((f) => (
                  <Stack key={f.id} gap={4} align="center">
                    <ThemeIcon size={34} radius="md" variant="default">
                      <f.icon size={16} />
                    </ThemeIcon>
                    <Text size="sm" fw={600} mt={2}>{f.title}</Text>
                    <Text size="xs" c="dimmed" ta="center" lh={1.5}>{f.body}</Text>
                  </Stack>
                ))}
              </SimpleGrid>

              <Button mt="xl" leftSection={<Plus size={15} />} onClick={dialog.openNew} disabled={!page.workspaceId}>
                {t("reports.emptyCta")}
              </Button>
            </Stack>
          </Box>
        ) : (
          <Stack gap="lg">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <StatTile
                icon={CalendarClock}
                label={t("reports.statActive")}
                value={String(page.enabled.length)}
                hint={
                  page.schedules.length > page.enabled.length
                    ? t("reports.statActivePaused", { count: page.schedules.length - page.enabled.length })
                    : t("reports.statActiveAllRunning")
                }
              />
              <StatTile
                icon={Clock}
                label={t("reports.statNext")}
                value={page.nextUp ? nextSendLabel(page.nextUp) : "—"}
                hint={page.nextUp ? page.nextUp.name : t("reports.statNextNone")}
              />
              <StatTile
                icon={Mail}
                label={t("reports.statReach")}
                value={String(page.reach)}
                hint={t("reports.statReachHint")}
              />
            </SimpleGrid>

            <Stack gap="md">
              {page.schedules.map((s) => (
                <ReportCard
                  key={s.id}
                  s={s}
                  siteNames={page.siteNameFor(s)}
                  testing={page.testing && page.testingId === s.id}
                  waEntitled={page.waEntitled}
                  onEdit={() => dialog.openEdit(s)}
                  onTest={() => page.runTest(s)}
                  onTestWhatsApp={() => page.runWhatsAppTest(s)}
                  onDelete={() => page.destroy(s)}
                  onToggle={() => page.toggleEnabled(s)}
                />
              ))}
            </Stack>
          </Stack>
        )}
      </PageStack>

      <ReportDialog
        opened={dialog.opened}
        onClose={dialog.close}
        editingId={dialog.editingId}
        draft={dialog.draft}
        setDraft={dialog.setDraft}
        emailInput={dialog.emailInput}
        setEmailInput={dialog.setEmailInput}
        addEmail={dialog.addEmail}
        removeEmail={dialog.removeEmail}
        tab={dialog.tab}
        setTab={dialog.setTab}
        tabIndex={dialog.tabIndex}
        isLastTab={dialog.isLastTab}
        submit={dialog.submit}
        saving={page.saving}
        sites={page.sites}
        share={page.share}
        wa={page.wa}
        waReady={page.waReady}
        waEntitled={page.waEntitled}
        ownerMobile={page.ownerMobile}
      />
    </AppShell>
  );
}
