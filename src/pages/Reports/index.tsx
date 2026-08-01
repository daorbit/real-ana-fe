import {
  Text, Group, Button, Stack, Center, Loader, Alert, Box, ThemeIcon, SimpleGrid,
} from "@mantine/core";
import {
  Plus, Mail, MailWarning, CalendarClock, BarChart3, FileSpreadsheet, Clock, Users,
} from "lucide-react";
import { AppShell } from "../../components/AppShell";
import { PageHeader, PageStack } from "../../components/Page";
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
  const page = useReportsPage();
  const dialog = useReportDialog({
    waEntitled: page.waEntitled,
    ownerMobile: page.ownerMobile,
    persist: page.persist,
  });

  return (
    <AppShell>
      <PageStack maxWidth={1180}>
        <PageHeader
          title="Reports"
          description="Scheduled summaries of your traffic and SEO — delivered by email, with the detail attached."
          actions={
            <Button leftSection={<Plus size={15} />} onClick={dialog.openNew} disabled={!page.workspaceId}>
              New report
            </Button>
          }
        />

        {!page.mailReady && (
          <Alert color="orange" icon={<MailWarning size={16} />} radius="md">
            Outbound email isn&apos;t configured on this deployment, so reports won&apos;t be
            delivered. Schedules are saved and start sending once it is.
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
              <Text fw={650} size="lg">No reports yet</Text>
              <Text size="sm" c="dimmed" ta="center" maw={460} lh={1.6}>
                A report emails your headline numbers and SEO scores on a schedule, with the full
                breakdown attached as a spreadsheet. Built for the people who want the numbers but
                never log in — a client, a manager, whoever asked.
              </Text>

              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mt="xl" w="100%" maw={620}>
                {[
                  { icon: BarChart3, title: "Traffic & SEO", body: "Headline metrics with change vs. the previous period" },
                  { icon: FileSpreadsheet, title: "Spreadsheet", body: "Every breakdown on its own sheet, attached" },
                  { icon: Users, title: "Anyone", body: "No account needed, unsubscribe in every email" },
                ].map((f) => (
                  <Stack key={f.title} gap={4} align="center">
                    <ThemeIcon size={34} radius="md" variant="default">
                      <f.icon size={16} />
                    </ThemeIcon>
                    <Text size="sm" fw={600} mt={2}>{f.title}</Text>
                    <Text size="xs" c="dimmed" ta="center" lh={1.5}>{f.body}</Text>
                  </Stack>
                ))}
              </SimpleGrid>

              <Button mt="xl" leftSection={<Plus size={15} />} onClick={dialog.openNew} disabled={!page.workspaceId}>
                Create your first report
              </Button>
            </Stack>
          </Box>
        ) : (
          <Stack gap="lg">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <StatTile
                icon={CalendarClock}
                label="Active reports"
                value={String(page.enabled.length)}
                hint={
                  page.schedules.length > page.enabled.length
                    ? `${page.schedules.length - page.enabled.length} paused`
                    : "All running"
                }
              />
              <StatTile
                icon={Clock}
                label="Next delivery"
                value={page.nextUp ? nextSendLabel(page.nextUp) : "—"}
                hint={page.nextUp ? page.nextUp.name : "Nothing scheduled"}
              />
              <StatTile
                icon={Mail}
                label="People reached"
                value={String(page.reach)}
                hint="Unique addresses across active reports"
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
