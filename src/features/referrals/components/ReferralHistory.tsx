import { Badge, CopyButton, Table, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { shortDate } from "@/shared/lib";
import type { MyReferralRow } from "@/shared/types";
import classes from "./Referrals.module.css";

const STATUS_COLOR: Record<MyReferralRow["status"], string> = {
  pending: "yellow",
  rewarded: "teal",
  closed: "gray",
};

export function ReferralHistory({ rows }: { rows: MyReferralRow[] }) {
  const { t } = useTranslation();

  if (!rows.length) {
    return (
      <EmptyState
        compact
        icon={Users}
        title={t("referrals.emptyTitle", "No referrals yet")}
        description={t("referrals.emptyBody", "People who sign up with your link will show up here.")}
      />
    );
  }

  const statusLabel = (s: MyReferralRow["status"]) =>
    s === "rewarded"
      ? t("referrals.statusRewarded", "Rewarded")
      : s === "pending"
        ? t("referrals.statusPending", "Pending")
        : t("referrals.statusClosed", "Not eligible");

  return (
    <div>
      <p className={classes.sectionLabel}>{t("referrals.history", "Your referrals")}</p>
      <Table.ScrollContainer minWidth={560}>
        <Table verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("referrals.colPerson", "Person")}</Table.Th>
              <Table.Th>{t("referrals.colJoined", "Joined")}</Table.Th>
              <Table.Th>{t("referrals.colStatus", "Status")}</Table.Th>
              <Table.Th>{t("referrals.colReward", "Your coupon")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((r) => (
              <Table.Tr key={r.id}>
                <Table.Td>{r.name}</Table.Td>
                <Table.Td>{shortDate(r.createdAt)}</Table.Td>
                <Table.Td>
                  <Badge variant="light" color={STATUS_COLOR[r.status]}>{statusLabel(r.status)}</Badge>
                </Table.Td>
                <Table.Td>
                  {r.coupon ? (
                    r.coupon.used ? (
                      <Text size="sm" className={`${classes.code} ${classes.used}`}>{r.coupon.code}</Text>
                    ) : (
                      <CopyButton value={r.coupon.code} timeout={1400}>
                        {({ copied, copy }) => (
                          <Tooltip
                            label={
                              copied
                                ? t("share.copied")
                                : r.coupon?.expiresAt
                                  ? t("referrals.validUntil", "Valid until {{date}}", { date: shortDate(r.coupon.expiresAt) })
                                  : t("share.copy")
                            }
                            withArrow
                          >
                            <UnstyledButton onClick={copy}>
                              <Text size="sm" className={classes.code}>{r.coupon?.code}</Text>
                            </UnstyledButton>
                          </Tooltip>
                        )}
                      </CopyButton>
                    )
                  ) : (
                    <Text size="sm" c="dimmed">—</Text>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </div>
  );
}
