import { Badge, Text } from "@mantine/core";
import { shortDate } from "@/shared/lib";
import type { AdminReferral } from "@/shared/types";
import { COUPON_STATE_COLOR } from "@/features/referrals/lib/rewards";
import classes from "./ReferralAdmin.module.css";

const STATE_LABEL = { ready: "Not used", used: "Used", expired: "Expired", off: "Turned off" } as const;

export function AdminCouponCell({ coupon }: { coupon: AdminReferral["coupon"] }) {
  if (!coupon) return <Text size="sm" c="dimmed">No coupon</Text>;

  const detail =
    coupon.state === "used"
      ? [coupon.usedAt && `Used ${shortDate(coupon.usedAt)}`, coupon.usedFor && `on ${coupon.usedFor}`].filter(Boolean).join(" ")
      : coupon.expiresAt
        ? `${coupon.state === "expired" ? "Expired" : "Expires"} ${shortDate(coupon.expiresAt)}`
        : "No expiry";

  return (
    <div className={classes.coupon}>
      <div className={classes.couponTop}>
        <span className={classes.mono}>{coupon.code}</span>
        <Badge size="xs" variant="light" color={COUPON_STATE_COLOR[coupon.state]}>{STATE_LABEL[coupon.state]}</Badge>
      </div>
      <span className={classes.muted}>
        {coupon.percentOff}% off · {detail || "Used"}
      </span>
    </div>
  );
}
