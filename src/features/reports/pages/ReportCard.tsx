import {
  Text, Group, Badge, ActionIcon, Tooltip, Box, Divider, Menu,
} from "@mantine/core";
import {
  Pencil, Trash2, Send, Mail, AlertTriangle, BarChart3, Search,
  FileSpreadsheet, Link2, MoreVertical, Pause, Play, Clock,
  Users, CheckCircle2, MessageCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { timeAgo } from "@/shared/lib";
import type { ReportSchedule } from "@/shared/types";
import { frequencyLabel, nextSendLabel, recipientSummary, destinations } from "@/features/reports/pages/utils";

export function StatTile({
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
  const { t } = useTranslation();
  return (
    <Group gap={6}>
      {s.channels.email && (
        <Badge size="sm" variant="light" color="blue" leftSection={<Mail size={11} />}
          styles={{ label: { fontWeight: 500 } }}>
          {t("reports.channelEmail")}
        </Badge>
      )}
      {s.channels.whatsapp && (
        <Badge size="sm" variant="light" color="teal" leftSection={<MessageCircle size={11} />}
          styles={{ label: { fontWeight: 500 } }}>
          {t("reports.channelWhatsApp")}
        </Badge>
      )}
    </Group>
  );
}

/** The contents of a report, as labelled chips — faster to scan than a sentence. */
function IncludeChips({ s }: { s: ReportSchedule }) {
  const { t } = useTranslation();
  // `id` keys the list; the label is translated and so can't be a React key.
  const items = [
    { id: "analytics", on: s.include.analytics, icon: BarChart3, label: t("reports.includeAnalytics") },
    { id: "seo", on: s.include.seo, icon: Search, label: t("reports.includeSeo") },
    { id: "xlsx", on: s.attachXlsx, icon: FileSpreadsheet, label: t("reports.includeSpreadsheet") },
    { id: "link", on: s.include.dashboardLink, icon: Link2, label: t("reports.includeLiveLink") },
  ].filter((i) => i.on);

  return (
    <Group gap={6}>
      {items.map((i) => (
        <Badge
          key={i.id}
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
export function ReportCard({
  s,
  siteNames,
  onEdit,
  onTest,
  onTestWhatsApp,
  onDelete,
  onToggle,
  testing,
  waEntitled,
  canEdit,
}: {
  s: ReportSchedule;
  siteNames: string;
  onEdit: () => void;
  onTest: () => void;
  onTestWhatsApp: () => void;
  onDelete: () => void;
  onToggle: () => void;
  testing: boolean;
  waEntitled: boolean;
  /** False for a viewer: the card stays, every action on it goes. */
  canEdit: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Box className="surface-card" p="lg" style={{ opacity: s.enabled ? 1 : 0.72 }}>
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="sm">
        <div style={{ minWidth: 0 }}>
          <Group gap={8} wrap="nowrap">
            <Text fw={650} size="md" truncate>{s.name}</Text>
            {s.enabled ? (
              <Badge size="sm" variant="light" color="emerald">{frequencyLabel(s.frequency)}</Badge>
            ) : (
              <Badge size="sm" variant="light" color="gray">{t("reports.paused")}</Badge>
            )}
            {s.lastError && (
              <Tooltip label={s.lastError} multiline w={280} withArrow>
                <AlertTriangle size={15} color="var(--mantine-color-orange-6)" />
              </Tooltip>
            )}
          </Group>
          <Text size="xs" c="dimmed" mt={3} truncate>{siteNames}</Text>
        </div>

        {canEdit && (
          <Group gap={4} wrap="nowrap">
            {s.channels.email && (
              <Tooltip label={t("reports.testEmailTooltip")} withArrow>
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
                <Menu.Item leftSection={<Pencil size={14} />} onClick={onEdit}>{t("reports.edit")}</Menu.Item>
                {/* A schedule keeps its WhatsApp channel through a downgrade, so
                    the entitlement is checked here rather than inferred from the
                    schedule — otherwise the test button stays live on a plan that
                    no longer includes it and only fails at the server. */}
                {s.channels.whatsapp && waEntitled && (
                  <Menu.Item leftSection={<MessageCircle size={14} />} onClick={onTestWhatsApp}>
                    {t("reports.sendWhatsAppTest")}
                  </Menu.Item>
                )}
                <Menu.Item
                  leftSection={s.enabled ? <Pause size={14} /> : <Play size={14} />}
                  onClick={onToggle}
                >
                  {s.enabled ? t("reports.pause") : t("reports.resume")}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={onDelete}>
                  {t("common.delete")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        )}
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
            {destinations(s) || t("reports.noActiveRecipients")}
          </Text>
        </div>

        <Group gap="lg">
          <div>
            <Group gap={5}>
              <Clock size={12} style={{ opacity: 0.6 }} />
              <Text size="xs" c="dimmed">{t("reports.next")}</Text>
            </Group>
            <Text size="sm" fw={600} mt={2}>{nextSendLabel(s)}</Text>
          </div>
          <div>
            <Group gap={5}>
              <CheckCircle2 size={12} style={{ opacity: 0.6 }} />
              <Text size="xs" c="dimmed">{t("reports.lastSent")}</Text>
            </Group>
            <Text size="sm" fw={600} mt={2} c={s.lastSentAt ? undefined : "dimmed"}>
              {s.lastSentAt ? timeAgo(s.lastSentAt) : t("reports.never")}
            </Text>
          </div>
        </Group>
      </Group>
    </Box>
  );
}
