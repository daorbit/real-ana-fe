import { Avatar, Table, Tooltip, UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { dateTime, num, shortDate, timeAgo } from "@/shared/lib/format";
import type { ApiKey, ApiKeyUsageEntry, ApiKeyUsageWindow } from "@/shared/types";
import { keyStatus, maskedKey } from "../../developers";
import { KeyActionsMenu } from "./KeyActionsMenu";
import { KeyStatusBadge } from "./KeyStatusBadge";
import classes from "./Developers.module.css";

interface Props {
  keys: ApiKey[];
  usage: Map<string, ApiKeyUsageEntry>;
  windowDays: ApiKeyUsageWindow;
  onViewUsage: (keyId: string) => void;
  onRename: (key: ApiKey) => void;
  onRevoke: (key: ApiKey) => void;
}

export function ApiKeysTable({ keys, usage, windowDays, onViewUsage, onRename, onRevoke }: Props) {
  const { t } = useTranslation();

  return (
    <Table.ScrollContainer minWidth={760} type="native">
      <Table className={classes.table} verticalSpacing={10} horizontalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t("developers.colName")}</Table.Th>
            <Table.Th>{t("developers.colSecret")}</Table.Th>
            <Table.Th>{t("developers.colStatus")}</Table.Th>
            <Table.Th>{t("developers.colLastUsed")}</Table.Th>
            <Table.Th className={classes.numCol}>{t("developers.colRequests", { count: windowDays })}</Table.Th>
            <Table.Th>{t("developers.colCreated")}</Table.Th>
            <Table.Th className={classes.actionCol} aria-label={t("developers.keyActions")} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {keys.map((k) => {
            const creator = k.createdBy?.name || k.createdBy?.email;
            const status = keyStatus(k);
            const entry = usage.get(k.id);
            const requests = entry?.requests ?? 0;
            const failures = entry?.failures ?? 0;

            return (
              <Table.Tr key={k.id} className={classes.row} data-expired={status === "expired" || undefined}>
                <Table.Td>
                  <span className={classes.keyName}>{k.name}</span>
                </Table.Td>
                <Table.Td>
                  <code className={classes.secret}>{maskedKey(k.prefix)}</code>
                </Table.Td>
                <Table.Td>
                  {k.expiresAt ? (
                    <Tooltip label={t("developers.expiresAt", { date: dateTime(k.expiresAt) })} withArrow>
                      <span>
                        <KeyStatusBadge apiKey={k} />
                      </span>
                    </Tooltip>
                  ) : (
                    <KeyStatusBadge apiKey={k} />
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
                <Table.Td className={classes.numCol}>
                  <Tooltip
                    label={
                      failures > 0
                        ? `${t("developers.failedCount", { count: failures })} · ${t("developers.allTimeRequests", { total: num(k.requestCount ?? 0) })}`
                        : t("developers.allTimeRequests", { total: num(k.requestCount ?? 0) })
                    }
                    withArrow
                  >
                    <UnstyledButton className={classes.requestLink} onClick={() => onViewUsage(k.id)}>
                      {num(requests)}
                      {failures > 0 && <span className={classes.failDot} aria-hidden />}
                    </UnstyledButton>
                  </Tooltip>
                </Table.Td>
                <Table.Td>
                  <div className={classes.creator}>
                    {creator && (
                      <Tooltip label={t("developers.createdBy", { name: creator })} withArrow>
                        <Avatar size={20} radius="xl" color="gray" name={creator} />
                      </Tooltip>
                    )}
                    <Tooltip label={dateTime(k.createdAt)} withArrow>
                      <span className={classes.muted}>{shortDate(k.createdAt)}</span>
                    </Tooltip>
                  </div>
                </Table.Td>
                <Table.Td className={classes.actionCol}>
                  <KeyActionsMenu
                    onViewUsage={() => onViewUsage(k.id)}
                    onRename={() => onRename(k)}
                    onRevoke={() => onRevoke(k)}
                  />
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
