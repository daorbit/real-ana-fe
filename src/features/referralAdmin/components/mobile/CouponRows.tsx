import { Badge } from "@mantine/core";
import { shortDate } from "@/shared/lib";
import { InsetRow } from "@/shared/ui/InsetList";
import type { AdminReferral } from "@/shared/types";
import { COUPON_STATE_COLOR } from "@/features/referrals/lib/rewards";
import classes from "./ReferralMobile.module.css";

const STATE_LABEL = { ready: "Not used", used: "Used", expired: "Expired", off: "Turned off" } as const;

export function CouponRows({ coupon }: { coupon: AdminReferral["coupon"] }) {
  if (!coupon) return <InsetRow title="No coupon issued" subtitle="A coupon is created when the referral is rewarded." />;

  return (
    <>
      <InsetRow
        title={<span className={classes.mono}>{coupon.code}</span>}
        subtitle={`${coupon.percentOff}% off`}
        trailing={
          <Badge size="sm" variant="light" color={COUPON_STATE_COLOR[coupon.state]}>
            {STATE_LABEL[coupon.state]}
          </Badge>
        }
      />
      {coupon.state === "used" ? (
        <InsetRow
          title="Used"
          trailing={coupon.usedAt ? shortDate(coupon.usedAt) : "—"}
          subtitle={coupon.usedFor ? `on ${coupon.usedFor}` : undefined}
        />
      ) : (
        <InsetRow
          title={coupon.state === "expired" ? "Expired" : "Expires"}
          trailing={coupon.expiresAt ? shortDate(coupon.expiresAt) : "Never"}
        />
      )}
    </>
  );
}
