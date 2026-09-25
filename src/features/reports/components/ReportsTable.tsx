import { ActionIcon, Loader, Menu, Switch, Table, Tooltip } from "@mantine/core";
import {
  AlertTriangle, Mail, MessageCircle, MoreHorizontal, Pencil, Send, Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { dateTime, timeAgo } from "@/shared/lib";
import type { ReportSchedule } from "@/shared/types";
import {
  destinations, frequencyLabel, nextSendLabel, recipientSummary,
} from "@/features/reports/pages/utils";
import classes from "./Reports.module.css";

interface Props {
  schedules: ReportSchedule[];
  siteNameFor: (s: ReportSchedule) => string;
  canEdit: boolean;
  waEntitled: boolean;
  testingId: string | null;
  onEdit: (s: ReportSchedule) => void;
  onTest: (s: ReportSchedule) => void;
  onTestWhatsApp: (s: ReportSchedule) => void;
  onToggle: (s: ReportSchedule) => void;
  onDelete: (s: ReportSchedule) => void;
}

/**
 * Every report as one row. Recipients are listed (in the tooltip) rather than
 * only counted, so an owner can confirm at a glance that a report goes to the
 * right client — and anyone who unsubscribed stays visible in the count.
 */
export function ReportsTable({
  schedules, siteNameFor, canEdit, waEntitled, testingId,
  onEdit, onTest, onTestWhatsApp, onToggle, onDelete,
}: Props) {
  const { t } = useTranslation();

  return (
    <Table.ScrollContainer minWidth={0} type="native">
      <Table className={classes.table} verticalSpacing={12} horizontalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t("reports.colReport")}</Table.Th>
            <Table.Th className={classes.optionalCol}>{t("reports.colSchedule")}</Table.Th>
            <Table.Th className={classes.optionalCol}>{t("reports.colRecipients")}</Table.Th>
            <Table.Th>{t("reports.next")}</Table.Th>
            <Table.Th className={classes.optionalCol}>{t("reports.lastSent")}</Table.Th>
            <Table.Th>{t("reports.colActive")}</Table.Th>
            <Table.Th className={classes.actionCol} aria-label={t("reports.colActions")} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {schedules.map((s) => (
            <Table.Tr
              key={s.id}
              className={classes.row}
              data-paused={!s.enabled || undefined}
              data-clickable={canEdit || undefined}
              onClick={canEdit ? () => onEdit(s) : undefined}
            >
              <Table.Td>
                <div className={classes.name}>
                  {s.name}
                  {s.lastError && (
                    <Tooltip label={s.lastError} multiline w={280} withArrow>
                      <AlertTriangle size={14} color="var(--mantine-color-orange-6)" aria-label={s.lastError} />
                    </Tooltip>
                  )}
                </div>
                <div className={classes.sub} title={siteNameFor(s)}>{siteNameFor(s)}</div>
              </Table.Td>
              <Table.Td className={classes.optionalCol}>
                <span className={classes.cell}>{frequencyLabel(s.frequency)}</span>
                <div className={classes.sub}>
                  <span className={classes.channels}>
                    {s.channels.email && <Mail size={12} aria-label={t("reports.channelEmail")} />}
                    {s.channels.whatsapp && <MessageCircle size={12} aria-label={t("reports.channelWhatsApp")} />}
                    {[s.channels.email && t("reports.channelEmail"), s.channels.whatsapp && t("reports.channelWhatsApp")]
                      .filter(Boolean)
                      .join(" + ")}
                  </span>
                </div>
              </Table.Td>
              <Table.Td className={classes.optionalCol}>
                <Tooltip
                  label={destinations(s) || t("reports.noActiveRecipients")}
                  multiline
                  w={300}
                  withArrow
                >
                  <span className={classes.muted}>{recipientSummary(s) || t("reports.noActiveRecipients")}</span>
                </Tooltip>
              </Table.Td>
              <Table.Td>
                {s.enabled ? (
                  <Tooltip label={dateTime(s.nextRunAt)} withArrow>
                    <span className={classes.cell}>{nextSendLabel(s)}</span>
                  </Tooltip>
                ) : (
                  <span className={classes.muted}>{t("reports.paused")}</span>
                )}
              </Table.Td>
              <Table.Td className={classes.optionalCol}>
                {s.lastSentAt ? (
                  <Tooltip label={dateTime(s.lastSentAt)} withArrow>
                    <span className={classes.muted}>{timeAgo(s.lastSentAt)}</span>
                  </Tooltip>
                ) : (
                  <span className={classes.muted}>{t("reports.never")}</span>
                )}
              </Table.Td>
              <Table.Td onClick={(e) => e.stopPropagation()}>
                <Switch
                  size="sm"
                  checked={s.enabled}
                  disabled={!canEdit}
                  onChange={() => onToggle(s)}
                  aria-label={s.enabled ? t("reports.pause") : t("reports.resume")}
                />
              </Table.Td>
              <Table.Td className={classes.actionCol} onClick={(e) => e.stopPropagation()}>
                {canEdit && (
                  <span className={classes.actions}>
                    {s.channels.email && (
                      <Tooltip label={t("reports.testEmailTooltip")} withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          onClick={() => onTest(s)}
                          disabled={testingId === s.id}
                          aria-label={t("reports.testEmailTooltip")}
                        >
                          {testingId === s.id ? <Loader size={14} /> : <Send size={15} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                    <Menu position="bottom-end" withinPortal shadow="md" width={200}>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray" aria-label={t("reports.colActions")}>
                          <MoreHorizontal size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<Pencil size={14} />} onClick={() => onEdit(s)}>
                          {t("reports.edit")}
                        </Menu.Item>
                        {s.channels.email && (
                          <Menu.Item leftSection={<Send size={14} />} onClick={() => onTest(s)}>
                            {t("reports.sendTestEmail")}
                          </Menu.Item>
                        )}
                        {/* The plan is checked here, not inferred from the
                            schedule: a downgrade keeps the channel on, and the
                            test would only fail at the server. */}
                        {s.channels.whatsapp && waEntitled && (
                          <Menu.Item leftSection={<MessageCircle size={14} />} onClick={() => onTestWhatsApp(s)}>
                            {t("reports.sendWhatsAppTest")}
                          </Menu.Item>
                        )}
                        <Menu.Divider />
                        <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={() => onDelete(s)}>
                          {t("common.delete")}
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </span>
                )}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
