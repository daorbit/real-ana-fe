import { useState } from "react";
import {
  Text, Group, Button, Stack, Badge, Modal, TextInput, Select, Switch,
  ActionIcon, Center, Loader, Alert, Checkbox, Tooltip, MultiSelect, Box,
  ThemeIcon, SimpleGrid, Divider, Menu, Tabs,
} from "@mantine/core";
import {
  Plus, Pencil, Trash2, Send, Mail, MailWarning, CalendarClock, AlertTriangle,
  BarChart3, Search, FileSpreadsheet, Link2, MoreVertical, Pause, Play, Clock,
  Users, CheckCircle2, MessageCircle,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { PageHeader, PageStack } from "../components/Page";
import {
  useGetReportSchedulesQuery, useSaveReportScheduleMutation,
  useDeleteReportScheduleMutation, useTestReportScheduleMutation,
  useGetSitesQuery, useGetShareQuery,
  useGetWhatsAppStatusQuery, useTestReportWhatsAppMutation,
} from "../store";
import { notify, errMessage, confirmDelete } from "../notify";
import { useWorkspace } from "../workspace";
import { useAuth } from "../auth";
import { timeAgo } from "../utils";
import { REPORT_FREQUENCIES } from "../types";
import type { ReportSchedule, ReportFrequency } from "../types";

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
 */

const FREQUENCY_HINTS: Record<ReportFrequency, string> = {
  daily: "Every morning, covering the last 24 hours",
  weekly: "Monday mornings, covering the previous week",
  monthly: "The 1st of each month, covering the previous month",
};

const FREQUENCY_LABEL: Record<ReportFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

type Draft = {
  name: string;
  frequency: ReportFrequency;
  siteIds: string[];
  recipients: string[];
  emailChannel: boolean;
  whatsappChannel: boolean;
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
  emailChannel: true,
  whatsappChannel: false,
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
  // The owner's address is added server-side on every save, so it isn't shown
  // as a removable chip — removing it would be a no-op and look like a bug.
  recipients: s.recipients.slice(1).map((r) => r.email),
  emailChannel: s.channels.email,
  whatsappChannel: s.channels.whatsapp,
  analytics: s.include.analytics,
  seo: s.include.seo,
  dashboardLink: s.include.dashboardLink,
  attachXlsx: s.attachXlsx,
  enabled: s.enabled,
});

/** A short, absolute-ish description of when the next send lands. */
function nextSendLabel(s: ReportSchedule): string {
  if (!s.enabled) return "Paused";
  const when = new Date(s.nextRunAt);
  const days = Math.round((when.getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return when.toLocaleDateString(undefined, { weekday: "long" });
  return when.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** One number in the strip above the list. */
function StatTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Box className="surface-card" p="md">
      <Group gap={8} mb={6}>
        <Icon size={14} style={{ opacity: 0.6 }} />
        <Text size="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: "0.04em" }}>
          {label}
        </Text>
      </Group>
      <Text fw={700} size="24px" lh={1.1}>{value}</Text>
      {hint && <Text size="xs" c="dimmed" mt={4}>{hint}</Text>}
    </Box>
  );
}

/** How a report goes out. Shown first, because it changes who sees it at all. */
function ChannelChips({ s }: { s: ReportSchedule }) {
  return (
    <Group gap={6}>
      {s.channels.email && (
        <Badge size="sm" variant="light" color="blue" leftSection={<Mail size={11} />}
          styles={{ label: { fontWeight: 500 } }}>
          Email
        </Badge>
      )}
      {s.channels.whatsapp && (
        <Badge size="sm" variant="light" color="teal" leftSection={<MessageCircle size={11} />}
          styles={{ label: { fontWeight: 500 } }}>
          WhatsApp
        </Badge>
      )}
    </Group>
  );
}

/** The contents of a report, as labelled chips — faster to scan than a sentence. */
function IncludeChips({ s }: { s: ReportSchedule }) {
  const items = [
    { on: s.include.analytics, icon: BarChart3, label: "Analytics" },
    { on: s.include.seo, icon: Search, label: "SEO" },
    { on: s.attachXlsx, icon: FileSpreadsheet, label: "Spreadsheet" },
    { on: s.include.dashboardLink, icon: Link2, label: "Live link" },
  ].filter((i) => i.on);

  return (
    <Group gap={6}>
      {items.map((i) => (
        <Badge
          key={i.label}
          size="sm"
          variant="light"
          color="gray"
          leftSection={<i.icon size={11} />}
          styles={{ label: { fontWeight: 500 } }}
        >
          {i.label}
        </Badge>
      ))}
    </Group>
  );
}

/** "3 emails · 1 WhatsApp · 1 unsubscribed", counting only channels that are on. */
function recipientSummary(s: ReportSchedule): string {
  const parts: string[] = [];
  if (s.channels.email) {
    const active = s.recipients.filter((r) => !r.unsubscribed).length;
    parts.push(`${active} email${active === 1 ? "" : "s"}`);
  }
  if (s.channels.whatsapp) {
    const active = s.phoneRecipients.filter((p) => !p.optedOut).length;
    parts.push(`${active} WhatsApp`);
  }
  const out =
    s.recipients.filter((r) => r.unsubscribed).length +
    s.phoneRecipients.filter((p) => p.optedOut).length;
  if (out) parts.push(`${out} opted out`);
  return parts.join(" · ");
}

/** The actual destinations, so an owner can confirm a report goes where they think. */
function destinations(s: ReportSchedule): string {
  return [
    ...(s.channels.email ? s.recipients.filter((r) => !r.unsubscribed).map((r) => r.email) : []),
    ...(s.channels.whatsapp
      ? s.phoneRecipients.filter((p) => !p.optedOut).map((p) => p.label || `+${p.phone}`)
      : []),
  ].join(", ");
}

function ReportCard({
  s,
  siteNames,
  onEdit,
  onTest,
  onTestWhatsApp,
  onDelete,
  onToggle,
  testing,
}: {
  s: ReportSchedule;
  siteNames: string;
  onEdit: () => void;
  onTest: () => void;
  onTestWhatsApp: () => void;
  onDelete: () => void;
  onToggle: () => void;
  testing: boolean;
}) {
  return (
    <Box className="surface-card" p="lg" style={{ opacity: s.enabled ? 1 : 0.72 }}>
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="sm">
        <div style={{ minWidth: 0 }}>
          <Group gap={8} wrap="nowrap">
            <Text fw={650} size="md" truncate>{s.name}</Text>
            {s.enabled ? (
              <Badge size="sm" variant="light" color="emerald">{FREQUENCY_LABEL[s.frequency]}</Badge>
            ) : (
              <Badge size="sm" variant="light" color="gray">Paused</Badge>
            )}
            {s.lastError && (
              <Tooltip label={s.lastError} multiline w={280} withArrow>
                <AlertTriangle size={15} color="var(--mantine-color-orange-6)" />
              </Tooltip>
            )}
          </Group>
          <Text size="xs" c="dimmed" mt={3} truncate>{siteNames}</Text>
        </div>

        <Group gap={4} wrap="nowrap">
          {s.channels.email && (
            <Tooltip label="Email a copy to yourself now" withArrow>
              <ActionIcon variant="light" size="lg" radius="md" loading={testing} onClick={onTest}>
                <Send size={15} />
              </ActionIcon>
            </Tooltip>
          )}
          <Menu position="bottom-end" withArrow>
            <Menu.Target>
              <ActionIcon variant="subtle" size="lg" radius="md" color="gray">
                <MoreVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<Pencil size={14} />} onClick={onEdit}>Edit</Menu.Item>
              {s.channels.whatsapp && (
                <Menu.Item leftSection={<MessageCircle size={14} />} onClick={onTestWhatsApp}>
                  Send WhatsApp test
                </Menu.Item>
              )}
              <Menu.Item
                leftSection={s.enabled ? <Pause size={14} /> : <Play size={14} />}
                onClick={onToggle}
              >
                {s.enabled ? "Pause" : "Resume"}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={onDelete}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      <Group gap={6} wrap="wrap">
        <ChannelChips s={s} />
        <Divider orientation="vertical" />
        <IncludeChips s={s} />
      </Group>

      <Divider my="md" />

      <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
        <div>
          <Group gap={6} mb={4}>
            <Users size={13} style={{ opacity: 0.6 }} />
            <Text size="xs" c="dimmed" fw={500}>
              {recipientSummary(s)}
            </Text>
          </Group>
          {/* Addresses, not just a count: the owner needs to see at a glance
              that a report is going to the right client. */}
          <Text size="xs" c="dimmed" lineClamp={1} maw={340}>
            {destinations(s) || "No active recipients"}
          </Text>
        </div>

        <Group gap="lg">
          <div>
            <Group gap={5}>
              <Clock size={12} style={{ opacity: 0.6 }} />
              <Text size="xs" c="dimmed">Next</Text>
            </Group>
            <Text size="sm" fw={600} mt={2}>{nextSendLabel(s)}</Text>
          </div>
          <div>
            <Group gap={5}>
              <CheckCircle2 size={12} style={{ opacity: 0.6 }} />
              <Text size="xs" c="dimmed">Last sent</Text>
            </Group>
            <Text size="sm" fw={600} mt={2} c={s.lastSentAt ? undefined : "dimmed"}>
              {s.lastSentAt ? timeAgo(s.lastSentAt) : "Never"}
            </Text>
          </div>
        </Group>
      </Group>
    </Box>
  );
}

export default function Reports() {
  const { active } = useWorkspace();
  const { user } = useAuth();
  const workspaceId = active?._id ?? "";
  // WhatsApp is delivered to the account owner's own number only, so the
  // profile mobile is both the destination and the precondition.
  const ownerMobile = (user?.mobile ?? "").replace(/[^\d]/g, "");

  const { data, isLoading } = useGetReportSchedulesQuery(workspaceId, { skip: !workspaceId });
  const { data: sites = [] } = useGetSitesQuery(workspaceId, { skip: !workspaceId });
  const { data: share } = useGetShareQuery(workspaceId, { skip: !workspaceId });
  const { data: wa } = useGetWhatsAppStatusQuery(workspaceId, { skip: !workspaceId });
  // Offered only when the gateway is both configured and actually paired —
  // enabling a channel that cannot send is a promise the product can't keep.
  const waReady = Boolean(wa?.configured && wa.status === "connected");

  const [save, { isLoading: saving }] = useSaveReportScheduleMutation();
  const [remove] = useDeleteReportScheduleMutation();
  const [sendTest, { isLoading: testing }] = useTestReportScheduleMutation();
  const [sendWaTest] = useTestReportWhatsAppMutation();

  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [emailInput, setEmailInput] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);
  /** Reset per open, so editing a second report doesn't land on the last tab used. */
  const [tab, setTab] = useState("schedule");

  const schedules = data?.schedules ?? [];
  const mailReady = data?.mailConfigured ?? true;

  const enabled = schedules.filter((s) => s.enabled);
  const nextUp = enabled
    .slice()
    .sort((a, b) => +new Date(a.nextRunAt) - +new Date(b.nextRunAt))[0];
  // Counted across reports, deduped: the same client on two reports is one
  // person receiving mail from you, which is the number that matters.
  const reach = new Set(
    enabled.flatMap((s) => s.recipients.filter((r) => !r.unsubscribed).map((r) => r.email))
  ).size;

  const siteNameFor = (s: ReportSchedule): string => {
    if (!s.siteIds.length) return `All sites in ${active?.name ?? "this workspace"}`;
    const names = s.siteIds
      .map((id) => sites.find((site) => site.siteId === id)?.name)
      .filter(Boolean);
    return names.length ? names.join(", ") : `${s.siteIds.length} site(s)`;
  };

  const openNew = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setEmailInput("");
    setTab("schedule");
    setModal(true);
  };

  const openEdit = (s: ReportSchedule) => {
    setEditingId(s.id);
    setDraft(fromSchedule(s));
    setEmailInput("");
    setTab("schedule");
    setModal(true);
  };

  const persist = async (d: Draft, id: string | null) => {
    await save({
      workspaceId,
      id: id ?? undefined,
      name: d.name.trim(),
      siteIds: d.siteIds,
      frequency: d.frequency,
      recipients: d.recipients,
      channels: { email: d.emailChannel, whatsapp: d.whatsappChannel },
      include: { analytics: d.analytics, seo: d.seo, dashboardLink: d.dashboardLink },
      attachXlsx: d.attachXlsx,
      enabled: d.enabled,
    }).unwrap();
  };

  const submit = async () => {
    // Each check names its tab: with the fields split across three panels, a
    // message about a control the user cannot currently see reads as the save
    // silently failing. Switch to the tab, then say what is wrong on it.
    const fail = (tabName: string, message: string) => {
      setTab(tabName);
      notify.error(message);
    };

    if (!draft.name.trim()) {
      fail("schedule", "Give the report a name so you can tell it apart from the others.");
      return;
    }
    if (!draft.analytics && !draft.seo) {
      fail("content", "Include analytics, SEO, or both — a report of neither is empty.");
      return;
    }
    if (!draft.emailChannel && !draft.whatsappChannel) {
      fail("delivery", "Pick at least one delivery channel.");
      return;
    }
    if (draft.whatsappChannel && !ownerMobile) {
      fail("delivery", "Add your mobile number in Settings before turning on WhatsApp delivery.");
      return;
    }

    try {
      await persist(draft, editingId);
      notify.success(editingId ? "Report updated." : "Report scheduled.");
      setModal(false);
    } catch (e) {
      notify.error(errMessage(e, "Could not save the report."));
    }
  };

  const toggleEnabled = async (s: ReportSchedule) => {
    try {
      await persist({ ...fromSchedule(s), enabled: !s.enabled }, s.id);
      notify.success(s.enabled ? "Report paused." : "Report resumed.");
    } catch (e) {
      notify.error(errMessage(e, "Could not update the report."));
    }
  };

  const runTest = async (s: ReportSchedule) => {
    setTestingId(s.id);
    try {
      const result = await sendTest({ workspaceId, id: s.id }).unwrap();
      notify.success(`Sent to ${result.sentTo.join(", ")}.`, "Test report sent");
    } catch (e) {
      notify.error(errMessage(e, "Could not send the test report."));
    } finally {
      setTestingId(null);
    }
  };

  const destroy = (s: ReportSchedule) => {
    confirmDelete({
      title: "Delete report",
      body: (
        <>
          "{s.name}" will be deleted and no longer sent to its recipients. This
          cannot be undone.
        </>
      ),
      onConfirm: async () => {
        try {
          await remove({ workspaceId, id: s.id }).unwrap();
          notify.success("Report deleted.");
        } catch (e) {
          notify.error(errMessage(e, "Could not delete the report."));
        }
      },
    });
  };

  const runWhatsAppTest = async (s: ReportSchedule) => {
    const first = s.phoneRecipients.find((p) => !p.optedOut);
    if (!first) {
      notify.error("This report has no active WhatsApp numbers.");
      return;
    }
    setTestingId(s.id);
    try {
      await sendWaTest({ workspaceId, id: s.id, phone: first.phone }).unwrap();
      notify.success(`Sent to +${first.phone}.`, "Test WhatsApp sent");
    } catch (e) {
      notify.error(errMessage(e, "Could not send the WhatsApp test."));
    } finally {
      setTestingId(null);
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
      <PageStack maxWidth={1180}>
        <PageHeader
          title="Reports"
          description="Scheduled summaries of your traffic and SEO — delivered by email, with the detail attached."
          actions={
            <Button leftSection={<Plus size={15} />} onClick={openNew} disabled={!workspaceId}>
              New report
            </Button>
          }
        />

        {!mailReady && (
          <Alert color="orange" icon={<MailWarning size={16} />} radius="md">
            Outbound email isn&apos;t configured on this deployment, so reports won&apos;t be
            delivered. Schedules are saved and start sending once it is.
          </Alert>
        )}

        {isLoading ? (
          <Center py={64}><Loader size="sm" /></Center>
        ) : !schedules.length ? (
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

              <Button mt="xl" leftSection={<Plus size={15} />} onClick={openNew} disabled={!workspaceId}>
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
                value={String(enabled.length)}
                hint={
                  schedules.length > enabled.length
                    ? `${schedules.length - enabled.length} paused`
                    : "All running"
                }
              />
              <StatTile
                icon={Clock}
                label="Next delivery"
                value={nextUp ? nextSendLabel(nextUp) : "—"}
                hint={nextUp ? nextUp.name : "Nothing scheduled"}
              />
              <StatTile
                icon={Mail}
                label="People reached"
                value={String(reach)}
                hint="Unique addresses across active reports"
              />
            </SimpleGrid>

            <Stack gap="md">
              {schedules.map((s) => (
                <ReportCard
                  key={s.id}
                  s={s}
                  siteNames={siteNameFor(s)}
                  testing={testing && testingId === s.id}
                  onEdit={() => openEdit(s)}
                  onTest={() => runTest(s)}
                  onTestWhatsApp={() => runWhatsAppTest(s)}
                  onDelete={() => destroy(s)}
                  onToggle={() => toggleEnabled(s)}
                />
              ))}
            </Stack>
          </Stack>
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
        {/* Three tabs rather than one column: the form is long enough that the
            save button used to sit below the fold, and the groups are read at
            different times — schedule once, delivery when a client changes,
            content when the report looks wrong. */}
        <Tabs value={tab} onChange={(v) => setTab(v ?? "schedule")} keepMounted={false}>
          <Tabs.List mb="md">
            <Tabs.Tab value="schedule" leftSection={<CalendarClock size={14} />}>
              Schedule
            </Tabs.Tab>
            <Tabs.Tab value="delivery" leftSection={<Send size={14} />}>
              Delivery
            </Tabs.Tab>
            <Tabs.Tab value="content" leftSection={<BarChart3 size={14} />}>
              Content
            </Tabs.Tab>
          </Tabs.List>

        <Tabs.Panel value="schedule">
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
            data={REPORT_FREQUENCIES.map((f) => ({ value: f, label: FREQUENCY_LABEL[f] }))}
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

          <Switch
            label="Active"
            description="Paused reports keep their settings but stop sending"
            checked={draft.enabled}
            onChange={(e) => setDraft({ ...draft, enabled: e.currentTarget.checked })}
          />
        </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="delivery">
        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} mb={4}>Deliver by</Text>
            <Text size="xs" c="dimmed" mb={8}>
              Email carries the spreadsheet. WhatsApp gets a short summary and the dashboard link.
            </Text>
            <Stack gap={8}>
              <Checkbox
                label="Email"
                checked={draft.emailChannel}
                onChange={(e) => setDraft({ ...draft, emailChannel: e.currentTarget.checked })}
              />
              <Checkbox
                label="WhatsApp"
                disabled={!waReady}
                // The platform's own paired number is an implementation
                // detail, not something a customer needs on screen — what
                // matters is where the message lands, which the notice below
                // states.
                description={
                  !wa?.configured
                    ? "Not available on this deployment"
                    : wa.status === "connected"
                      ? "A copy on your own WhatsApp"
                      : "Temporarily unavailable — try again shortly"
                }
                checked={draft.whatsappChannel}
                onChange={(e) => setDraft({ ...draft, whatsappChannel: e.currentTarget.checked })}
              />
            </Stack>
          </div>

          {draft.whatsappChannel && (
            <Alert color="teal" radius="md" p="xs" icon={<MessageCircle size={15} />}>
              <Text size="xs">
                {ownerMobile
                  ? `This report will be sent to your own number, +${ownerMobile}. WhatsApp delivery goes to you only — to share with a client, add their email address below.`
                  : "Add your mobile number in Settings first — WhatsApp reports are delivered to your own number."}
              </Text>
            </Alert>
          )}

          <div>
            <Text size="sm" fw={500} mb={4}>Also send to</Text>
            <Text size="xs" c="dimmed" mb={8}>
              You always receive this report. Add anyone else who should — they don&apos;t need an
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
        </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="content">
        <Stack gap="md">
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
                  under Public dashboard first — note that it makes this workspace&apos;s analytics
                  readable by anyone with the link.
                </Text>
              </Alert>
            )}
          </div>
        </Stack>
        </Tabs.Panel>
        </Tabs>

        {/* Outside the panels: saving is not a step of any one tab, and a
            button that moves with the tab reads as saving only that tab. */}
        <Divider my="md" />
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setModal(false)}>Cancel</Button>
          <Button loading={saving} onClick={submit}>
            {editingId ? "Save changes" : "Schedule report"}
          </Button>
        </Group>
      </Modal>
    </AppShell>
  );
}
