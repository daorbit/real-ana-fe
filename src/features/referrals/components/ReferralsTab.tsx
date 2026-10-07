import { Alert, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { useGetMyReferralsQuery } from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { BillingSkeleton } from "@/shared/ui/Skeletons";
import { num } from "@/shared/lib";
import { ReferralInviteCard } from "./ReferralInviteCard";
import { ReferralHistory } from "./ReferralHistory";
import classes from "./Referrals.module.css";

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

  const rewarded = data.referrals.filter((r) => r.status === "rewarded").length;
  const unused = data.referrals.filter((r) => r.coupon && !r.coupon.used).length;

  return (
    <Stack gap={28}>
      <ReferralInviteCard data={data} />

      <div className={classes.stats}>
        <div className={classes.stat}>
          <span className={classes.statLabel}>{t("referrals.statJoined", "Joined with your link")}</span>
          <span className={classes.statValue}>{num(data.referrals.length)}</span>
        </div>
        <div className={classes.stat}>
          <span className={classes.statLabel}>{t("referrals.statRewards", "Coupons earned")}</span>
          <span className={classes.statValue}>{num(rewarded)}</span>
        </div>
        <div className={classes.stat}>
          <span className={classes.statLabel}>{t("referrals.statUnused", "Ready to use")}</span>
          <span className={classes.statValue}>{num(unused)}</span>
        </div>
      </div>

      <ReferralHistory rows={data.referrals} />
    </Stack>
  );
}
