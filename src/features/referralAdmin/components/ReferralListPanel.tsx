import { useEffect, useState } from "react";
import {
  ActionIcon, Badge, Card, Center, Group, Loader, Pagination, SegmentedControl, Stack, Table, Text, TextInput, Tooltip,
} from "@mantine/core";
import { Ban, Flag, Gift, Search, Undo2, Users } from "lucide-react";
import { useGetAdminReferralsQuery } from "@/app/store";
import { EmptyState } from "@/shared/ui/EmptyState";
import { num, shortDate } from "@/shared/lib";
import type { AdminReferral, ReferralUserRef } from "@/shared/types";
import { useReferralActions } from "../hooks/useReferralActions";
import { REFERRAL_STATUS_FILTERS, REFERRAL_STATUS_META } from "../lib/referralStatus";

function Person({ user }: { user: ReferralUserRef | null }) {
  if (!user) return <Text size="sm" c="dimmed">Deleted account</Text>;
  return (
    <div>
      <Text size="sm" fw={500} lineClamp={1}>{user.name}</Text>
      <Text size="xs" c="dimmed" lineClamp={1}>{user.email}</Text>
    </div>
  );
}

function CouponCell({ coupon }: { coupon: AdminReferral["coupon"] }) {
  if (!coupon) return <Text size="sm" c="dimmed">—</Text>;
  const state = !coupon.active ? "Off" : coupon.uses > 0 ? "Used" : coupon.expiresAt && new Date(coupon.expiresAt) < new Date() ? "Expired" : "Unused";
  return (
    <div>
      <Text size="sm" ff="monospace">{coupon.code}</Text>
      <Text size="xs" c="dimmed">{state}{coupon.expiresAt ? ` · until ${shortDate(coupon.expiresAt)}` : ""}</Text>
    </div>
  );
}

export function ReferralListPanel() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => setPage(1), [search, status]);

  const { data, isLoading, isFetching } = useGetAdminReferralsQuery({ q: search || undefined, status: status || undefined, page });
  const { act, busy } = useReferralActions();
  const rows = data?.referrals ?? [];

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <TextInput
          placeholder="Search by name, email or code"
          leftSection={<Search size={15} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          w={{ base: "100%", sm: 320 }}
          rightSection={isFetching ? <Loader size={14} /> : null}
        />
        <SegmentedControl value={status} onChange={setStatus} data={REFERRAL_STATUS_FILTERS} />
      </Group>

      <Card withBorder radius="lg" p={0}>
        {isLoading ? (
          <Center py="xl"><Loader size="sm" /></Center>
        ) : !rows.length ? (
          <EmptyState compact icon={Users} title="No referrals found" description="Referrals appear here as people sign up with a referral link." />
        ) : (
          <Table.ScrollContainer minWidth={980}>
            <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Referrer</Table.Th>
                  <Table.Th>Joined user</Table.Th>
                  <Table.Th>Code</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Reward coupon</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((r) => {
                  const meta = REFERRAL_STATUS_META[r.status];
                  const rowBusy = busy === r.id;
                  return (
                    <Table.Tr key={r.id}>
                      <Table.Td><Person user={r.referrer} /></Table.Td>
                      <Table.Td><Person user={r.referee} /></Table.Td>
                      <Table.Td><Text size="sm" ff="monospace">{r.code}</Text></Table.Td>
                      <Table.Td>
                        <Group gap={6} wrap="nowrap">
                          <Badge variant="light" color={meta.color}>{meta.label}</Badge>
                          {r.flagged && (
                            <Tooltip label="Same network as another referral from this referrer. Not rewarded automatically.">
                              <Flag size={14} color="var(--mantine-color-red-5)" />
                            </Tooltip>
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td><CouponCell coupon={r.coupon} /></Table.Td>
                      <Table.Td><Text size="sm">{shortDate(r.createdAt)}</Text></Table.Td>
                      <Table.Td>
                        <Group gap={4} justify="flex-end" wrap="nowrap">
                          {r.status === "pending" && (
                            <>
                              <Tooltip label="Issue reward coupon">
                                <ActionIcon variant="subtle" color="teal" loading={rowBusy} onClick={() => act(r, "reward")} aria-label="Reward">
                                  <Gift size={15} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Reject">
                                <ActionIcon variant="subtle" color="red" disabled={rowBusy} onClick={() => act(r, "reject")} aria-label="Reject">
                                  <Ban size={15} />
                                </ActionIcon>
                              </Tooltip>
                            </>
                          )}
                          {r.status === "rewarded" && (
                            <Tooltip label="Revoke reward">
                              <ActionIcon variant="subtle" color="red" loading={rowBusy} onClick={() => act(r, "revoke")} aria-label="Revoke">
                                <Undo2 size={15} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      {data && data.pages > 1 && (
        <Group justify="space-between">
          <Text size="sm" c="dimmed">{num(data.total)} referrals</Text>
          <Pagination value={page} onChange={setPage} total={data.pages} size="sm" />
        </Group>
      )}
    </Stack>
  );
}
