import {
  Text, Group, Button, Stack, Badge, Modal, TextInput, Select, Switch,
  ActionIcon, Alert, Checkbox, MultiSelect, Divider, Tabs,
} from "@mantine/core";
import { CalendarClock, Send, BarChart3, MessageCircle, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { REPORT_FREQUENCIES } from "@/shared/types";
import type { ReportFrequency, Site, ShareState, WhatsAppStatus } from "@/shared/types";
import type { Draft } from "@/features/reports/pages/types";
import { frequencyHint, frequencyLabel, TAB_ORDER } from "@/features/reports/pages/utils";

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
  const { t } = useTranslation();
  return (
      <Modal
        opened={opened}
        onClose={onClose}
        title={editingId ? t("reports.dialogEditTitle") : t("reports.dialogNewTitle")}
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
              {t("reports.tabSchedule")}
            </Tabs.Tab>
            <Tabs.Tab value="delivery" leftSection={<Send size={14} />}>
              {t("reports.tabDelivery")}
            </Tabs.Tab>
            <Tabs.Tab value="content" leftSection={<BarChart3 size={14} />}>
              {t("reports.tabContent")}
            </Tabs.Tab>
          </Tabs.List>

        <Tabs.Panel value="schedule">
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
        </Tabs.Panel>

        <Tabs.Panel value="delivery">
        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} mb={4}>{t("reports.deliverBy")}</Text>
            <Text size="xs" c="dimmed" mb={8}>
              {t("reports.deliverByDesc")}
            </Text>
            <Stack gap={8}>
              <Checkbox
                label={t("reports.channelEmail")}
                checked={draft.emailChannel}
                onChange={(e) => setDraft({ ...draft, emailChannel: e.currentTarget.checked })}
              />
              <Checkbox
                label={t("reports.channelWhatsApp")}
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
                    ? t("reports.waNotEntitled")
                    : !wa?.configured
                      ? t("reports.waNotConfigured")
                      : wa.status === "connected"
                        ? t("reports.waConnected")
                        : t("reports.waUnavailable")
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
                  ? t("reports.waNoticeWithNumber", { phone: ownerMobile })
                  : t("reports.waNoticeNoNumber")}
              </Text>
            </Alert>
          )}

          <div>
            <Text size="sm" fw={500} mb={4}>{t("reports.alsoSendTo")}</Text>
            <Text size="xs" c="dimmed" mb={8}>
              {t("reports.alsoSendToDesc")}
            </Text>
            <Group gap="xs" mb={draft.recipients.length ? "xs" : 0}>
              <TextInput
                style={{ flex: 1 }}
                placeholder={t("reports.emailPlaceholder")}
                value={emailInput}
                onChange={(e) => setEmailInput(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addEmail();
                  }
                }}
              />
              <Button variant="light" onClick={addEmail}>{t("reports.add")}</Button>
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
                <Text size="xs">
                  {t("reports.dashboardOffWarning")}
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
          <Button variant="subtle" onClick={onClose}>{t("common.cancel")}</Button>
          {isLastTab || editingId ? (
            <Button loading={saving} onClick={submit}>
              {editingId ? t("common.save") : t("reports.scheduleReport")}
            </Button>
          ) : (
            <Button onClick={() => setTab(TAB_ORDER[tabIndex + 1])} rightSection={<ChevronRight size={15} />}>
              {t("common.next")}
            </Button>
          )}
        </Group>
      </Modal>
  );
}
