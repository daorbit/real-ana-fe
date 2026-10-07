import { useState } from "react";
import { ActionIcon, Card, Center, Group, Loader, Progress, Switch, Table, Text, Tooltip } from "@mantine/core";
import { LogIn, Trophy } from "lucide-react";
import { useGetAdminTopReferrersQuery, useSetAdminReferralCodeActiveMutation } from "@/app/store";
import { EmptyState } from "@/shared/ui/EmptyState";
import { num } from "@/shared/lib";
import { notify, errMessage } from "@/shared/lib/notify";
import { useImpersonateUser } from "../hooks/useImpersonateUser";
import { ReferralPerson } from "./ReferralPerson";
import classes from "./ReferralAdmin.module.css";

export function TopReferrersPanel() {
  const { data, isLoading } = useGetAdminTopReferrersQuery();
  const [setActive] = useSetAdminReferralCodeActiveMutation();
  const [toggling, setToggling] = useState<string | null>(null);
  const { enter, busy } = useImpersonateUser("referrals");
  const rows = data?.referrers ?? [];

  const toggle = async (userId: string, active: boolean) => {
    setToggling(userId);
    try {
      await setActive({ userId, active }).unwrap();
      notify.success(active ? "Referral link turned on." : "Referral link turned off.", "Referrals");
    } catch (e) {
      notify.error(errMessage(e, "Could not change that referral link."));
    } finally {
      setToggling(null);
    }
  };

  return (
    <Card withBorder radius="lg" p={0}>
      {isLoading ? (
        <Center py="xl"><Loader size="sm" /></Center>
      ) : !rows.length ? (
        <EmptyState compact icon={Trophy} title="No referrers yet" description="The people who bring in the most signups will be ranked here." />
      ) : (
        <Table.ScrollContainer minWidth={760}>
          <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>Referrer</Table.Th>
                <Table.Th>Code</Table.Th>
                <Table.Th>Referrals</Table.Th>
                <Table.Th>Rewarded</Table.Th>
                <Table.Th>Link active</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((r, i) => (
                <Table.Tr key={r.user?.id ?? i}>
                  <Table.Td><span className={classes.rank} data-top={i < 3 || undefined}>{i + 1}</span></Table.Td>
                  <Table.Td><ReferralPerson user={r.user} /></Table.Td>
                  <Table.Td><span className={classes.mono}>{r.code?.code ?? "—"}</span></Table.Td>
                  <Table.Td><Text size="sm" fw={600}>{num(r.total)}</Text></Table.Td>
                  <Table.Td>
                    <div className={classes.rate}>
                      <Text size="sm" fw={600}>{num(r.rewarded)}</Text>
                      <Progress value={r.total ? (r.rewarded / r.total) * 100 : 0} size="xs" radius="xl" color="teal" className={classes.rateBar} />
                    </div>
                  </Table.Td>
                  <Table.Td>
                    {r.user && r.code ? (
                      <Switch
                        checked={r.code.active}
                        disabled={toggling === r.user.id}
                        onChange={(e) => toggle(r.user!.id, e.currentTarget.checked)}
                        aria-label="Referral link active"
                      />
                    ) : (
                      <Text size="sm" c="dimmed">—</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {r.user && (
                      <Group justify="flex-end">
                        <Tooltip label="Impersonate this user">
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            loading={busy === r.user.id}
                            onClick={() => enter(r.user!)}
                            aria-label="Impersonate"
                          >
                            <LogIn size={15} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Card>
  );
}
