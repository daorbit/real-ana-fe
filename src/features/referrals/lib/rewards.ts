import type { MyReferralRow, MyRewardCoupon, RewardCouponState } from "@/shared/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export const COUPON_STATE_COLOR: Record<RewardCouponState, string> = {
  ready: "teal",
  used: "blue",
  expired: "gray",
  off: "gray",
};

const STATE_ORDER: Record<RewardCouponState, number> = { ready: 0, used: 1, expired: 2, off: 3 };

export function daysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / DAY_MS));
}

export function rewardCoupons(rows: MyReferralRow[]): MyRewardCoupon[] {
  return rows
    .flatMap((r) => (r.coupon ? [r.coupon] : []))
    .sort((a, b) => {
      const byState = STATE_ORDER[a.state] - STATE_ORDER[b.state];
      if (byState) return byState;
      if (a.state === "ready") return (daysLeft(a.expiresAt) ?? Infinity) - (daysLeft(b.expiresAt) ?? Infinity);
      return new Date(b.usedAt ?? b.expiresAt ?? 0).getTime() - new Date(a.usedAt ?? a.expiresAt ?? 0).getTime();
    });
}

export function referralTotals(rows: MyReferralRow[]) {
  const coupons = rows.flatMap((r) => (r.coupon ? [r.coupon] : []));
  return {
    joined: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    earned: coupons.length,
    ready: coupons.filter((c) => c.state === "ready").length,
    used: coupons.filter((c) => c.state === "used").length,
  };
}
