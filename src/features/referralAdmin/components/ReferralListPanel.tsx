import { useEffect, useState } from "react";
import { Badge, Card, Center, Group, Loader, Pagination, SegmentedControl, Stack, Table, Text, TextInput, Tooltip } from "@mantine/core";
import { ArrowRight, Search, Users } from "lucide-react";
import { useGetAdminReferralOverviewQuery, useGetAdminReferralsQuery } from "@/app/store";
import { EmptyState } from "@/shared/ui/EmptyState";
import { num, shortDate } from "@/shared/lib";
import { useReferralActions } from "../hooks/useReferralActions";
import { REFERRAL_STATUS_FILTERS, REFERRAL_STATUS_META } from "../lib/referralStatus";
import { ReferralPerson } from "./ReferralPerson";
import { AdminCouponCell } from "./AdminCouponCell";
import { ReferralRowActions } from "./ReferralRowActions";
import classes from "./ReferralAdmin.module.css";

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
  const { data: overview } = useGetAdminReferralOverviewQuery();
  const { act, busy } = useReferralActions();
  const rows = data?.referrals ?? [];

  const filters = REFERRAL_STATUS_FILTERS.map((f) => {
    const count = overview ? (f.value ? overview[f.value as keyof typeof REFERRAL_STATUS_META] : overview.total) : null;
    return { value: f.value, label: count === null ? f.label : `${f.label} · ${num(count)}` };
  });

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
        <SegmentedControl value={status} onChange={setStatus} data={filters} size="xs" />
      </Group>

      <Card withBorder radius="lg" p={0}>
        {isLoading ? (
          <Center py="xl"><Loader size="sm" /></Center>
        ) : !rows.length ? (
          <EmptyState compact icon={Users} title="No referrals found" description="Referrals appear here as people sign up with a referral link." />
        ) : (
          <Table.ScrollContainer minWidth={1000}>
            <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Referral</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Reward coupon</Table.Th>
                  <Table.Th>Joined</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((r) => {
                  const meta = REFERRAL_STATUS_META[r.status];
                  return (
                    <Table.Tr key={r.id}>
                      <Table.Td>
                        <div className={classes.pair}>
                          <ReferralPerson user={r.referrer} role="Referrer" />
                          <ArrowRight size={14} className={classes.pairArrow} />
                          <ReferralPerson user={r.referee} role="Joined" />
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={4} align="flex-start">
                          <Group gap={6} wrap="nowrap">
                            <Badge variant="light" color={meta.color}>{meta.label}</Badge>
                            {r.flagged && (
                              <Tooltip label="Same network as another referral from this referrer. Not rewarded automatically." multiline w={240}>
                                <Badge variant="outline" color="red">Flagged</Badge>
                              </Tooltip>
                            )}
                          </Group>
                          <span className={classes.muted}>
                            Code <span className={classes.mono}>{r.code}</span>
                          </span>
                        </Stack>
                      </Table.Td>
                      <Table.Td><AdminCouponCell coupon={r.coupon} /></Table.Td>
                      <Table.Td>
                        <Text size="sm">{shortDate(r.createdAt)}</Text>
                        {r.rewardedAt && <span className={classes.muted}>Rewarded {shortDate(r.rewardedAt)}</span>}
                      </Table.Td>
                      <Table.Td>
                        <ReferralRowActions referral={r} busy={busy === r.id} onAct={act} />
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      {data && data.total > 0 && (
        <Group justify="space-between">
          <Text size="sm" c="dimmed">{num(data.total)} referrals</Text>
          {data.pages > 1 && <Pagination value={page} onChange={setPage} total={data.pages} size="sm" />}
        </Group>
      )}
    </Stack>
  );
}
