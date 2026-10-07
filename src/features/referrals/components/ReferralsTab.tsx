import { Alert, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { useGetMyReferralsQuery } from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { BillingSkeleton } from "@/shared/ui/Skeletons";
import { referralTotals, rewardCoupons } from "../lib/rewards";
import { ReferralInviteCard } from "./ReferralInviteCard";
import { ReferralStats } from "./ReferralStats";
import { RewardWallet } from "./RewardWallet";
import { ReferralHistory } from "./ReferralHistory";

export function ReferralsTab() {
  const { t } = useTranslation();
  const { isDemo } = useAuth();
  const { data, isLoading } = useGetMyReferralsQuery(undefined, { skip: isDemo });

  if (isDemo || (data && !data.enabled)) {
    return (
      <Alert variant="light" color="gray" icon={<Info size={16} />} radius="md">
        <Text size="sm">
          {isDemo
            ? t("referrals.demo", "Referrals are available once you have an account.")
            : t("referrals.paused", "The referral program is paused right now. Check back soon.")}
        </Text>
      </Alert>
    );
  }

  if (isLoading || !data) return <BillingSkeleton />;

  if (!data.active) {
    return (
      <Alert variant="light" color="gray" icon={<Info size={16} />} radius="md">
        <Text size="sm">{t("referrals.disabled", "Your referral link is turned off. Contact support if you think this is a mistake.")}</Text>
      </Alert>
    );
  }

  return (
    <Stack gap={32}>
      <ReferralInviteCard data={data} />
      <ReferralStats totals={referralTotals(data.referrals)} />
      <RewardWallet coupons={rewardCoupons(data.referrals)} />
      <ReferralHistory rows={data.referrals} qualifyOn={data.qualifyOn} />
    </Stack>
  );
}
