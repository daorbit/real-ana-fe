import { useState } from "react";
import { useAdminReferralActionMutation } from "@/app/store";
import { notify, errMessage, confirmDelete } from "@/shared/lib/notify";
import type { AdminReferral } from "@/shared/types";

export type ReferralAction = "reward" | "reject" | "revoke";

const COPY: Record<ReferralAction, { title: string; confirmLabel: string; color: string; done: string }> = {
  reward: { title: "Reward this referral?", confirmLabel: "Issue coupon", color: "teal", done: "Coupon issued to the referrer." },
  reject: { title: "Reject this referral?", confirmLabel: "Reject", color: "red", done: "Referral rejected." },
  revoke: { title: "Revoke this reward?", confirmLabel: "Revoke", color: "red", done: "Reward revoked and coupon turned off." },
};

const BODY: Record<ReferralAction, string> = {
  reward: "Creates a single-use coupon for the referrer with the current program discount, even if they are over the reward cap.",
  reject: "Marks the referral as not eligible. No coupon is issued. Use this for self-referrals or fake accounts.",
  revoke: "Turns off the coupon issued for this referral. If it was already used, the past discount stays as it is.",
};

export function useReferralActions() {
  const [run] = useAdminReferralActionMutation();
  const [busy, setBusy] = useState<string | null>(null);

  const act = (referral: AdminReferral, action: ReferralAction) => {
    const copy = COPY[action];
    confirmDelete({
      title: copy.title,
      confirmLabel: copy.confirmLabel,
      confirmColor: copy.color,
      body: (
        <>
          <b>{referral.referrer?.email ?? "Unknown"}</b> referred <b>{referral.referee?.email ?? "Unknown"}</b>.{" "}
          {BODY[action]}
        </>
      ),
      onConfirm: async () => {
        setBusy(referral.id);
        try {
          await run({ id: referral.id, action }).unwrap();
          notify.success(copy.done, "Referrals");
        } catch (e) {
          notify.error(errMessage(e, "Could not update that referral."));
        } finally {
          setBusy(null);
        }
      },
    });
  };

  return { act, busy };
}
