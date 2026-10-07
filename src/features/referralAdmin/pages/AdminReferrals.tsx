import { Stack, Tabs } from "@mantine/core";
import { List, Settings2, Trophy } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { useIsPlatformAdmin } from "@/features/auth/context";
import { useTitle } from "@/shared/lib/useTitle";
import { SuperAdminOnly } from "../components/SuperAdminOnly";
import { ReferralOverviewStats } from "../components/ReferralOverviewStats";
import { ReferralListPanel } from "../components/ReferralListPanel";
import { TopReferrersPanel } from "../components/TopReferrersPanel";
import { ReferralSettingsPanel } from "../components/ReferralSettingsPanel";

export default function AdminReferrals() {
  useTitle("Referrals");
  const isSuperAdmin = useIsPlatformAdmin();

  if (!isSuperAdmin) {
    return (
      <AppShell>
        <SuperAdminOnly />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Referrals"
        description="Run the referral program: rewards, who referred whom, and the people bringing in the most signups."
      />
      <Stack gap="xl">
        <ReferralOverviewStats />
        <Tabs defaultValue="referrals" keepMounted={false}>
          <Tabs.List mb="lg">
            <Tabs.Tab value="referrals" leftSection={<List size={15} />}>Referrals</Tabs.Tab>
            <Tabs.Tab value="top" leftSection={<Trophy size={15} />}>Top referrers</Tabs.Tab>
            <Tabs.Tab value="settings" leftSection={<Settings2 size={15} />}>Program settings</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="referrals"><ReferralListPanel /></Tabs.Panel>
          <Tabs.Panel value="top"><TopReferrersPanel /></Tabs.Panel>
          <Tabs.Panel value="settings"><ReferralSettingsPanel /></Tabs.Panel>
        </Tabs>
      </Stack>
    </AppShell>
  );
}
