import type { ReferralStatus } from "@/shared/types";

export const REFERRAL_STATUS_META: Record<ReferralStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "yellow" },
  rewarded: { label: "Rewarded", color: "teal" },
  rejected: { label: "Rejected", color: "red" },
  revoked: { label: "Revoked", color: "gray" },
};

export const REFERRAL_STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Rewarded", value: "rewarded" },
  { label: "Rejected", value: "rejected" },
  { label: "Revoked", value: "revoked" },
];
