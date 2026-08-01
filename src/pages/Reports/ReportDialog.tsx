import {
  Text, Group, Button, Stack, Badge, Modal, TextInput, Select, Switch,
  ActionIcon, Alert, Checkbox, MultiSelect, Divider, Tabs,
} from "@mantine/core";
import { CalendarClock, Send, BarChart3, MessageCircle, ChevronRight } from "lucide-react";
import { REPORT_FREQUENCIES } from "../../types";
import type { ReportFrequency, Site, ShareState, WhatsAppStatus } from "../../types";
import type { Draft } from "./types";
import { FREQUENCY_HINTS, FREQUENCY_LABEL, TAB_ORDER } from "./utils";

/**
 * The create/edit dialog.
 *
 * Presentational: every piece of state and each action is passed in, so the
 * page owns the draft and this file only decides how it looks. That keeps the
 * validation (which needs to move tabs) in one place rather than split across
 * the boundary.
 */
export function ReportDialog({
  opened,
  onClose,
  editingId,
  draft,
  setDraft,
  emailInput,
  setEmailInput,
  addEmail,
  removeEmail,
  tab,
  setTab,
  tabIndex,
  isLastTab,
  submit,
  saving,
  sites,
  share,
  wa,
  waReady,
  waEntitled,
  ownerMobile,
}: {
  opened: boolean;
  onClose: () => void;
  editingId: string | null;
  draft: Draft;
  setDraft: (d: Draft) => void;
  emailInput: string;
  setEmailInput: (v: string) => void;
  addEmail: () => void;
  removeEmail: (email: string) => void;
  tab: string;
  setTab: (t: string) => void;
  tabIndex: number;
  isLastTab: boolean;
  submit: () => void;
  saving: boolean;
  sites: Site[];
  share?: ShareState;
  wa?: WhatsAppStatus;
  waReady: boolean;
  waEntitled: boolean;
  ownerMobile: string;
}) {
  return (
      <Modal
        opened={opened}
        onClose={onClose}
        title={editingId ? "Edit report" : "New report"}
        radius="lg"
        size="lg"
        centered
      >
        {/* Three tabs rather than one column: the form is long enough that the
            save button used to sit below the fold, and the groups are read at
            different times — schedule once, delivery when a client changes,
            content when the report looks wrong. */}
        <Tabs value={tab} onChange={(v) => setTab(v ?? TAB_ORDER[0])} keepMounted={false}>
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
                disabled={!waReady || !waEntitled}
                // The platform's own paired number is an implementation
                // detail, not something a customer needs on screen — what
                // matters is where the message lands, which the notice below
                // states.
                //
                // The plan check comes first: to someone on Free, "temporarily
                // unavailable" would promise a channel that upgrading is the
                // only way to get.
                description={
                  !waEntitled
                    ? "Available on Pro — upgrade to get your reports on WhatsApp"
                    : !wa?.configured
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
                      onClick={() => removeEmail(email)}
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
            button that moves with the tab reads as saving only that tab.

            Next rather than Save on the first two tabs, so a new report walks
            through all three — the tabs alone don't say there is more to see,
            and a Save offered on tab one invites submitting a half-filled form.
            Editing skips the walkthrough: the reason for opening is usually one
            known field, so Save is available from wherever that field is. */}
        <Divider my="md" />
        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          {isLastTab || editingId ? (
            <Button loading={saving} onClick={submit}>
              {editingId ? "Save changes" : "Schedule report"}
            </Button>
          ) : (
            <Button onClick={() => setTab(TAB_ORDER[tabIndex + 1])} rightSection={<ChevronRight size={15} />}>
              Next
            </Button>
          )}
        </Group>
      </Modal>
  );
}
