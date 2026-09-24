import { Avatar, Table, Text, Tooltip } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { dateTime, shortDate, timeAgo } from "@/shared/lib/format";
import type { ApiKey } from "@/shared/types";
import { keyStatus, maskedKey } from "../../developers";
import { KeyActionsMenu } from "./KeyActionsMenu";
import { KeyStatusBadge } from "./KeyStatusBadge";
import classes from "./Developers.module.css";

interface Props {
  keys: ApiKey[];
  onRename: (key: ApiKey) => void;
  onRevoke: (key: ApiKey) => void;
}

export function ApiKeysTable({ keys, onRename, onRevoke }: Props) {
  const { t } = useTranslation();

  return (
    <Table.ScrollContainer minWidth={900} type="native">
      <Table className={classes.table} verticalSpacing="sm" horizontalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th className={classes.firstCol}>{t("developers.colName")}</Table.Th>
            <Table.Th>{t("developers.colStatus")}</Table.Th>
            <Table.Th>{t("developers.colSecret")}</Table.Th>
            <Table.Th>{t("developers.colCreated")}</Table.Th>
            <Table.Th>{t("developers.colExpires")}</Table.Th>
            <Table.Th>{t("developers.colLastUsed")}</Table.Th>
            <Table.Th>{t("developers.colCreatedBy")}</Table.Th>
            <Table.Th className={classes.lastCol} aria-label={t("developers.keyActions")} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {keys.map((k) => {
            const creator = k.createdBy?.name || k.createdBy?.email;
            const status = keyStatus(k);
            return (
              <Table.Tr key={k.id} data-expired={status === "expired" || undefined} className={classes.row}>
                <Table.Td className={classes.firstCol}>
                  <span className={classes.keyName}>{k.name}</span>
                </Table.Td>
                <Table.Td>
                  <KeyStatusBadge status={status} />
                </Table.Td>
                <Table.Td>
                  <span className={classes.secret}>{maskedKey(k.prefix)}</span>
                </Table.Td>
                <Table.Td>
                  <Tooltip label={dateTime(k.createdAt)} withArrow>
                    <span className={classes.muted}>{shortDate(k.createdAt)}</span>
                  </Tooltip>
                </Table.Td>
                <Table.Td>
                  {k.expiresAt ? (
                    <Tooltip label={dateTime(k.expiresAt)} withArrow>
                      <span className={classes.muted} data-status={status}>
                        {shortDate(k.expiresAt)}
                      </span>
                    </Tooltip>
                  ) : (
                    <span className={classes.muted}>{t("developers.expiresNever")}</span>
                  )}
                </Table.Td>
                <Table.Td>
                  {k.lastUsedAt ? (
                    <Tooltip label={dateTime(k.lastUsedAt)} withArrow>
                      <span className={classes.muted}>{timeAgo(k.lastUsedAt)}</span>
                    </Tooltip>
                  ) : (
                    <span className={classes.muted}>{t("developers.neverUsed")}</span>
                  )}
                </Table.Td>
                <Table.Td>
                  {creator ? (
                    <div className={classes.creator}>
                      <Avatar size={22} radius="xl" color="emerald" name={creator} />
                      <Text size="sm" truncate>
                        {creator}
                      </Text>
                    </div>
                  ) : (
                    <span className={classes.muted}>—</span>
                  )}
                </Table.Td>
                <Table.Td className={classes.lastCol}>
                  <KeyActionsMenu onRename={() => onRename(k)} onRevoke={() => onRevoke(k)} />
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
