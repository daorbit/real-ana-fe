import { useState } from "react";
import { Center, Loader, SegmentedControl, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useGetAdminReferralOverviewQuery } from "@/app/store";
import { ReferralOverviewStats } from "@/features/referralAdmin/components/ReferralOverviewStats";
import { ReferralListPanel } from "@/features/referralAdmin/components/ReferralListPanel";
import { TopReferrersPanel } from "@/features/referralAdmin/components/TopReferrersPanel";
import { ReferralSettingsPanel } from "@/features/referralAdmin/components/ReferralSettingsPanel";
import { ReferralOverviewMobile } from "@/features/referralAdmin/components/mobile/ReferralOverviewMobile";
import { AdminSection } from "../layout/AdminSection";

const VIEWS = [
  { label: "Referrals", value: "referrals" },
  { label: "Top referrers", value: "top" },
  { label: "Program settings", value: "settings" },
];

const MOBILE_VIEWS = [{ label: "Overview", value: "overview" }, ...VIEWS];

function ReferralView({ view }: { view: string }) {
  if (view === "top") return <TopReferrersPanel />;
  if (view === "settings") return <ReferralSettingsPanel />;
  return <ReferralListPanel />;
}

export default function ReferralsPanel() {
  const mobile = useMediaQuery("(max-width: 48em)") ?? false;
  const [view, setView] = useState("referrals");
  const [mobileView, setMobileView] = useState("overview");
  const { data: overview } = useGetAdminReferralOverviewQuery(undefined, { skip: !mobile });

  return (
    <AdminSection id="referrals">
      {mobile ? (
        <Stack gap="md">
          <SegmentedControl fullWidth radius="md" value={mobileView} onChange={setMobileView} data={MOBILE_VIEWS} />
          {mobileView === "overview" ? (
            overview ? <ReferralOverviewMobile data={overview} /> : <Center py="xl"><Loader size="sm" /></Center>
          ) : (
            <ReferralView view={mobileView} />
          )}
        </Stack>
      ) : (
        <Stack gap="xl">
          <ReferralOverviewStats />
          <Stack gap="md">
            <SegmentedControl radius="md" value={view} onChange={setView} data={VIEWS} w="fit-content" />
            <ReferralView view={view} />
          </Stack>
        </Stack>
      )}
    </AdminSection>
  );
}
