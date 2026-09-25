import type { KeyboardEvent } from "react";
import { Avatar, Table, Tooltip } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { dateTime, num, shortDate, timeAgo } from "@/shared/lib/format";
import type { ApiKey, ApiKeyUsageEntry, ApiKeyUsageWindow } from "@/shared/types";
import { keyStatus, maskedKey } from "../../developers";
import { KeyActionsMenu } from "./KeyActionsMenu";
import { KeySparkline } from "./KeySparkline";
import { KeyStatusBadge } from "./KeyStatusBadge";
import classes from "./Developers.module.css";

interface Props {
  keys: ApiKey[];
  usage: Map<string, ApiKeyUsageEntry>;
  windowDays: ApiKeyUsageWindow;
  focusKeyId: string | null;
  onFocusKey: (keyId: string) => void;
  onRename: (key: ApiKey) => void;
  onRevoke: (key: ApiKey) => void;
}

export function ApiKeysTable({ keys, usage, windowDays, focusKeyId, onFocusKey, onRename, onRevoke }: Props) {
  const { t } = useTranslation();

  const onRowKey = (e: KeyboardEvent, keyId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onFocusKey(keyId);
    }
  };

  return (
    <Table.ScrollContainer minWidth={860} type="native">
      <Table className={classes.table} verticalSpacing="sm" horizontalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th className={classes.firstCol}>{t("developers.colKey")}</Table.Th>
            <Table.Th>{t("developers.colStatus")}</Table.Th>
            <Table.Th>{t("developers.colRequests", { count: windowDays })}</Table.Th>
            <Table.Th>{t("developers.colLastUsed")}</Table.Th>
            <Table.Th>{t("developers.colExpires")}</Table.Th>
            <Table.Th>{t("developers.colCreated")}</Table.Th>
            <Table.Th className={classes.lastCol} aria-label={t("developers.keyActions")} />
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
              <Table.Tr
                key={k.id}
                className={classes.row}
                data-expired={status === "expired" || undefined}
                data-selected={focusKeyId === k.id || undefined}
                tabIndex={0}
                onClick={() => onFocusKey(k.id)}
                onKeyDown={(e) => onRowKey(e, k.id)}
              >
                <Table.Td className={classes.firstCol}>
                  <div className={classes.keyCell}>
                    <span className={classes.keyName}>{k.name}</span>
                    <span className={classes.secret}>{maskedKey(k.prefix)}</span>
                  </div>
                </Table.Td>
                <Table.Td>
                  <KeyStatusBadge apiKey={k} />
                </Table.Td>
                <Table.Td>
                  <div className={classes.requests}>
                    <div className={classes.requestText}>
                      <Tooltip
                        label={t("developers.allTimeRequests", { total: num(k.requestCount ?? 0) })}
                        withArrow
                      >
                        <span className={classes.requestCount}>{num(requests)}</span>
                      </Tooltip>
                      {failures > 0 && (
                        <span className={classes.requestFailed}>
                          {t("developers.failedCount", { count: failures })}
                        </span>
                      )}
                    </div>
                    <KeySparkline values={entry?.series.requests ?? []} />
                  </div>
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
                  <div className={classes.creator}>
                    {creator && (
                      <Tooltip label={t("developers.createdBy", { name: creator })} withArrow>
                        <Avatar size={20} radius="xl" color="emerald" name={creator} />
                      </Tooltip>
                    )}
                    <Tooltip label={dateTime(k.createdAt)} withArrow>
                      <span className={classes.muted}>{shortDate(k.createdAt)}</span>
                    </Tooltip>
                  </div>
                </Table.Td>
                <Table.Td
                  className={classes.lastCol}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <KeyActionsMenu
                    onViewUsage={() => onFocusKey(k.id)}
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
