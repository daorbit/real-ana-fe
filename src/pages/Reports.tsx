import { useState } from "react";
import {
  Text, Group, Button, Stack, Badge, Modal, TextInput, Select, Switch,
  ActionIcon, Center, Loader, Alert, Checkbox, Table, Tooltip, MultiSelect, Box, ThemeIcon,
} from "@mantine/core";
import {
  Plus, Pencil, Trash2, Send, Mail, MailWarning, CalendarClock, AlertTriangle,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { PageHeader, PageStack } from "../components/Page";
import {
  useGetReportSchedulesQuery, useSaveReportScheduleMutation,
  useDeleteReportScheduleMutation, useTestReportScheduleMutation,
  useGetSitesQuery, useGetShareQuery,
} from "../store";
import { notify, errMessage, confirmDelete } from "../notify";
import { useWorkspace } from "../workspace";
import { timeAgo } from "../utils";
import { REPORT_FREQUENCIES } from "../types";
import type { ReportSchedule, ReportFrequency } from "../types";

/**
 * Scheduled email reports.
 *
 * The two things this screen has to make obvious, because getting either wrong
 * is what turns a useful report into an embarrassing one:
 *
 *  - who receives it. Recipients are usually people outside the account — a
 *    client, a manager — so the list is shown in full rather than summarised,
 *    and anyone who has unsubscribed stays visible instead of quietly vanishing.
 *  - that the live dashboard link is public. Turning it on publishes the
 *    workspace to anyone holding the link, which the UI says in those words.
 */

const FREQUENCY_HINTS: Record<ReportFrequency, string> = {
  daily: "Every morning, covering the last 24 hours",
  weekly: "Monday mornings, covering the previous week",
  monthly: "The 1st of each month, covering the previous month",
};

type Draft = {
  name: string;
  frequency: ReportFrequency;
  siteIds: string[];
  recipients: string[];
  analytics: boolean;
  seo: boolean;
  dashboardLink: boolean;
  attachXlsx: boolean;
  enabled: boolean;
};

const emptyDraft = (): Draft => ({
  name: "",
  frequency: "weekly",
  siteIds: [],
  recipients: [],
  analytics: true,
  seo: true,
  dashboardLink: false,
  attachXlsx: true,
  enabled: true,
});

const fromSchedule = (s: ReportSchedule): Draft => ({
  name: s.name,
  frequency: s.frequency,
  siteIds: s.siteIds,
  // The owner's address is added server-side on every save, so it is not shown
  // as an editable chip — removing it would be a no-op and look like a bug.
  recipients: s.recipients.slice(1).map((r) => r.email),
  analytics: s.include.analytics,
  seo: s.include.seo,
  dashboardLink: s.include.dashboardLink,
  attachXlsx: s.attachXlsx,
  enabled: s.enabled,
});

export default function Reports() {
  const { active } = useWorkspace();
  const workspaceId = active?._id ?? "";

  const { data, isLoading } = useGetReportSchedulesQuery(workspaceId, { skip: !workspaceId });
  const { data: sites = [] } = useGetSitesQuery(workspaceId, { skip: !workspaceId });
  const { data: share } = useGetShareQuery(workspaceId, { skip: !workspaceId });

  const [save, { isLoading: saving }] = useSaveReportScheduleMutation();
  const [remove] = useDeleteReportScheduleMutation();
  const [sendTest, { isLoading: testing }] = useTestReportScheduleMutation();

  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [emailInput, setEmailInput] = useState("");

  const schedules = data?.schedules ?? [];
  const mailReady = data?.mailConfigured ?? true;

  const openNew = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setEmailInput("");
    setModal(true);
  };

  const openEdit = (s: ReportSchedule) => {
    setEditingId(s.id);
    setDraft(fromSchedule(s));
    setEmailInput("");
    setModal(true);
  };

  const submit = async () => {
    if (!draft.name.trim()) {
      notify.error("Give the report a name so you can tell it apart from the others.");
      return;
    }
    if (!draft.analytics && !draft.seo) {
      notify.error("Include analytics, SEO, or both — a report of neither is empty.");
      return;
    }

    try {
      await save({
        workspaceId,
        id: editingId ?? undefined,
        name: draft.name.trim(),
        siteIds: draft.siteIds,
        frequency: draft.frequency,
        recipients: draft.recipients,
        include: { analytics: draft.analytics, seo: draft.seo, dashboardLink: draft.dashboardLink },
        attachXlsx: draft.attachXlsx,
        enabled: draft.enabled,
      }).unwrap();
      notify.success(editingId ? "Report updated." : "Report scheduled.");
      setModal(false);
    } catch (e) {
      notify.error(errMessage(e, "Could not save the report."));
    }
  };

  const runTest = async (s: ReportSchedule) => {
    try {
      const result = await sendTest({ workspaceId, id: s.id }).unwrap();
      notify.success(`Sent to ${result.sentTo.join(", ")}.`, "Test report sent");
    } catch (e) {
      notify.error(errMessage(e, "Could not send the test report."));
    }
  };

  const destroy = async (s: ReportSchedule) => {
    if (!(await confirmDelete(s.name))) return;
    try {
      await remove({ workspaceId, id: s.id }).unwrap();
      notify.success("Report deleted.");
    } catch (e) {
      notify.error(errMessage(e, "Could not delete the report."));
    }
  };

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      notify.error(`"${email}" is not a valid email address.`);
      return;
    }
    if (draft.recipients.includes(email)) {
      setEmailInput("");
      return;
    }
    setDraft({ ...draft, recipients: [...draft.recipients, email] });
    setEmailInput("");
  };

  return (
    <AppShell>
      {/* Wider than the 860px prose default: the schedule table carries five
          columns, and squeezing it into a settings-form width wraps the
          recipient and timing cells for no benefit. */}
      <PageStack maxWidth={1180}>
        <PageHeader
          title="Email reports"
          description="Send analytics and SEO summaries on a schedule — to yourself, or to anyone you choose."
          actions={
            <Button leftSection={<Plus size={15} />} onClick={openNew} disabled={!workspaceId}>
              New report
            </Button>
          }
        />

        {!mailReady && (
          <Alert color="orange" icon={<MailWarning size={16} />} radius="md">
            Outbound email isn't configured on this deployment, so scheduled reports won't be
            delivered. Existing schedules are saved and will start sending once it is.
          </Alert>
        )}

        {isLoading ? (
          <Center py={64}><Loader size="sm" /></Center>
        ) : !schedules.length ? (
          <Box className="surface-card" py={56} px="xl">
            <Stack align="center" gap={6}>
              <ThemeIcon size={52} radius="xl" variant="light" color="emerald" mb="xs">
                <CalendarClock size={24} />
              </ThemeIcon>
              <Text fw={650} size="lg">No scheduled reports yet</Text>
              <Text size="sm" c="dimmed" ta="center" maw={420} lh={1.6}>
                Email your headline numbers, an SEO summary and a spreadsheet of the detail —
                daily, weekly or monthly. Useful for the people who want the numbers but never
                log in.
              </Text>
              <Button mt="md" leftSection={<Plus size={15} />} onClick={openNew} disabled={!workspaceId}>
                Create your first report
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box className="surface-card" p={0}>
            <Table.ScrollContainer minWidth={720}>
            <Table verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Report</Table.Th>
                  <Table.Th>Frequency</Table.Th>
                  <Table.Th>Recipients</Table.Th>
                  <Table.Th>Next</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {schedules.map((s) => (
                  <Table.Tr key={s.id}>
                    <Table.Td>
                      <Group gap={8} wrap="nowrap">
                        <Text size="sm" fw={600}>{s.name}</Text>
                        {!s.enabled && <Badge size="xs" color="gray" variant="light">Paused</Badge>}
                        {s.lastError && (
                          <Tooltip label={s.lastError} multiline w={280}>
                            <AlertTriangle size={14} color="var(--mantine-color-orange-6)" />
                          </Tooltip>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed">
                        {[s.include.analytics && "Analytics", s.include.seo && "SEO",
                          s.include.dashboardLink && "Live link", s.attachXlsx && "Spreadsheet"]
                          .filter(Boolean).join(" · ")}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" tt="capitalize">{s.frequency}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6}>
                        <Mail size={13} opacity={0.6} />
                        <Text size="sm">{s.recipients.filter((r) => !r.unsubscribed).length}</Text>
                        {s.recipients.some((r) => r.unsubscribed) && (
                          <Tooltip label={`${s.recipients.filter((r) => r.unsubscribed).length} unsubscribed`}>
                            <Badge size="xs" color="gray" variant="light">
                              {s.recipients.filter((r) => r.unsubscribed).length} out
                            </Badge>
                          </Tooltip>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c={s.enabled ? undefined : "dimmed"}>
                        {s.enabled ? timeAgo(s.nextRunAt) : "—"}
                      </Text>
                      {s.lastSentAt && (
                        <Text size="xs" c="dimmed">Last sent {timeAgo(s.lastSentAt)}</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} justify="flex-end" wrap="nowrap">
                        <Tooltip label="Send a copy to yourself now">
                          <ActionIcon variant="subtle" size="sm" loading={testing} onClick={() => runTest(s)}>
                            <Send size={14} />
                          </ActionIcon>
                        </Tooltip>
                        <ActionIcon variant="subtle" size="sm" onClick={() => openEdit(s)}>
                          <Pencil size={14} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" size="sm" color="red" onClick={() => destroy(s)}>
                          <Trash2 size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            </Table.ScrollContainer>
          </Box>
        )}
      </PageStack>

      <Modal
        opened={modal}
        onClose={() => setModal(false)}
        title={editingId ? "Edit report" : "New report"}
        radius="lg"
        size="lg"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="Monthly client report"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.currentTarget.value })}
          />

          <Select
            label="How often"
            description={FREQUENCY_HINTS[draft.frequency]}
            data={REPORT_FREQUENCIES.map((f) => ({
              value: f,
              label: f[0].toUpperCase() + f.slice(1),
            }))}
            value={draft.frequency}
            onChange={(v) => v && setDraft({ ...draft, frequency: v as ReportFrequency })}
            allowDeselect={false}
          />

          <MultiSelect
            label="Sites"
            description="Leave empty to include every site in this workspace, including ones you add later."
            placeholder={draft.siteIds.length ? undefined : "All sites"}
            data={sites.map((s) => ({ value: s.siteId, label: s.name }))}
            value={draft.siteIds}
            onChange={(v) => setDraft({ ...draft, siteIds: v })}
            searchable
            clearable
          />

          <div>
            <Text size="sm" fw={500} mb={4}>Also send to</Text>
            <Text size="xs" c="dimmed" mb={8}>
              You always receive this report. Add anyone else who should — they don't need an
              account, and every email includes an unsubscribe link.
            </Text>
            <Group gap="xs" mb={draft.recipients.length ? "xs" : 0}>
              <TextInput
                style={{ flex: 1 }}
                placeholder="client@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addEmail();
                  }
                }}
              />
              <Button variant="light" onClick={addEmail}>Add</Button>
            </Group>
            <Group gap={6}>
              {draft.recipients.map((email) => (
                <Badge
                  key={email}
                  variant="light"
                  rightSection={
                    <ActionIcon
                      size="xs"
                      variant="transparent"
                      color="gray"
                      onClick={() =>
                        setDraft({ ...draft, recipients: draft.recipients.filter((r) => r !== email) })
                      }
                    >
                      ×
                    </ActionIcon>
                  }
                >
                  {email}
                </Badge>
              ))}
            </Group>
          </div>

          <div>
            <Text size="sm" fw={500} mb={8}>What to include</Text>
            <Stack gap={8}>
              <Checkbox
                label="Analytics summary"
                description="Visitors, pageviews, sessions and bounce rate, with change vs. the previous period"
                checked={draft.analytics}
                onChange={(e) => setDraft({ ...draft, analytics: e.currentTarget.checked })}
              />
              <Checkbox
                label="SEO scores"
                description="Latest score per page, and how it moved since the last report"
                checked={draft.seo}
                onChange={(e) => setDraft({ ...draft, seo: e.currentTarget.checked })}
              />
              <Checkbox
                label="Spreadsheet attachment"
                description="The full breakdown as an .xlsx file"
                checked={draft.attachXlsx}
                onChange={(e) => setDraft({ ...draft, attachXlsx: e.currentTarget.checked })}
              />
              <Checkbox
                label="Link to the live dashboard"
                description={
                  share?.enabled
                    ? "Recipients can open the public dashboard at any time"
                    : "Requires the public dashboard to be turned on — until then, no link is included"
                }
                checked={draft.dashboardLink}
                onChange={(e) => setDraft({ ...draft, dashboardLink: e.currentTarget.checked })}
              />
            </Stack>
            {draft.dashboardLink && !share?.enabled && (
              <Alert color="yellow" mt="xs" radius="md" p="xs">
                <Text size="xs">
                  The public dashboard is currently off, so no link will be included. Turn it on
                  under Public dashboard first — note that it makes this workspace's analytics
                  readable by anyone with the link.
                </Text>
              </Alert>
            )}
          </div>

          <Switch
            label="Active"
            description="Paused reports keep their settings but stop sending"
            checked={draft.enabled}
            onChange={(e) => setDraft({ ...draft, enabled: e.currentTarget.checked })}
          />

          <Group justify="flex-end" mt="xs">
            <Button variant="subtle" onClick={() => setModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={submit}>
              {editingId ? "Save changes" : "Schedule report"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppShell>
  );
}
