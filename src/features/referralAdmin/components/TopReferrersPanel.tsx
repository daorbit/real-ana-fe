import { useState } from "react";
import { Card, Center, Group, Loader, Progress, Table, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Trophy } from "lucide-react";
import { useGetAdminTopReferrersQuery, useSetAdminReferralCodeActiveMutation } from "@/app/store";
import { EmptyState } from "@/shared/ui/EmptyState";
import { num } from "@/shared/lib";
import { notify, errMessage } from "@/shared/lib/notify";
import { useImpersonateUser } from "../hooks/useImpersonateUser";
import { ReferralPerson } from "./ReferralPerson";
import { ImpersonateButton, ReferralLinkSwitch } from "./TopReferrerControls";
import { TopReferrerMobileList } from "./mobile/TopReferrerMobileList";
import classes from "./ReferralAdmin.module.css";

export function TopReferrersPanel() {
  const mobile = useMediaQuery("(max-width: 48em)") ?? false;
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

  if (isLoading) return <Center py="xl"><Loader size="sm" /></Center>;

  if (!rows.length) {
    return (
      <Card withBorder radius="lg" p={0}>
        <EmptyState compact icon={Trophy} title="No referrers yet" description="The people who bring in the most signups will be ranked here." />
      </Card>
    );
  }

  if (mobile) {
    return <TopReferrerMobileList rows={rows} toggling={toggling} busy={busy} onToggle={toggle} onEnter={enter} />;
  }

  return (
    <Card withBorder radius="lg" p={0}>
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
                  <ReferralLinkSwitch referrer={r} toggling={toggling === r.user?.id} onToggle={toggle} />
                </Table.Td>
                <Table.Td>
                  <Group justify="flex-end">
                    <ImpersonateButton referrer={r} busy={busy === r.user?.id} onEnter={enter} />
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
}
