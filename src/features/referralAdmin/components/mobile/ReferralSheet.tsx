import { useEffect, useState } from "react";
import { Avatar } from "@mantine/core";
import { Ban, Flag, Gift, Undo2 } from "lucide-react";
import { shortDate } from "@/shared/lib";
import { PanelDrawer } from "@/shared/ui/PanelDrawer";
import { InsetList, InsetRow, RowIcon } from "@/shared/ui/InsetList";
import type { AdminReferral, ReferralUserRef } from "@/shared/types";
import type { ReferralAction } from "../../hooks/useReferralActions";
import { StatusPill } from "./StatusPill";
import { CouponRows } from "./CouponRows";
import classes from "./ReferralMobile.module.css";

interface Props {
  referral: AdminReferral | null;
  busy: boolean;
  onClose: () => void;
  onAct: (referral: AdminReferral, action: ReferralAction) => void;
}

export function ReferralSheet({ referral, busy, onClose, onAct }: Props) {
  const [shown, setShown] = useState(referral);

  useEffect(() => {
    if (referral) setShown(referral);
  }, [referral]);

  return (
    <PanelDrawer
      opened={Boolean(referral)}
      onClose={onClose}
      ariaLabel="Referral details"
      header={
        shown && (
          <div className={classes.sheetHead}>
            <span className={classes.sheetTitle}>Referral</span>
            <span className={classes.sheetMeta}>
              <StatusPill status={shown.status} />
              <span>{shortDate(shown.createdAt)}</span>
            </span>
          </div>
        )
      }
    >
      {shown && (
        <>
          <InsetList>
            <PersonRow user={shown.referrer} role="Referrer" />
            <PersonRow user={shown.referee} role="Joined" />
          </InsetList>

          <InsetList
            header="Details"
            footer={shown.flagged ? "Same network as another referral from this referrer, so it isn't rewarded automatically." : undefined}
          >
            <InsetRow title="Code" trailing={<span className={classes.mono}>{shown.code}</span>} />
            <InsetRow title="Signed up" trailing={shortDate(shown.createdAt)} />
            {shown.rewardedAt && <InsetRow title="Rewarded" trailing={shortDate(shown.rewardedAt)} />}
            {shown.flagged && (
              <InsetRow
                leading={<RowIcon tone="red"><Flag size={15} /></RowIcon>}
                title="Flagged"
                tone="danger"
              />
            )}
          </InsetList>

          <InsetList header="Reward coupon">
            <CouponRows coupon={shown.coupon} />
          </InsetList>

          {shown.status === "pending" && (
            <InsetList>
              <InsetRow
                leading={<RowIcon tone="teal"><Gift size={15} /></RowIcon>}
                title="Reward referrer"
                subtitle="Issue a coupon now"
                tone="accent"
                disabled={busy}
                onClick={() => onAct(shown, "reward")}
              />
              <InsetRow
                leading={<RowIcon tone="red"><Ban size={15} /></RowIcon>}
                title="Reject referral"
                subtitle="Not eligible — no coupon"
                tone="danger"
                disabled={busy}
                onClick={() => onAct(shown, "reject")}
              />
            </InsetList>
          )}

          {shown.status === "rewarded" && (
            <InsetList>
              <InsetRow
                leading={<RowIcon tone="red"><Undo2 size={15} /></RowIcon>}
                title="Revoke reward"
                subtitle="Turns the coupon off"
                tone="danger"
                disabled={busy}
                onClick={() => onAct(shown, "revoke")}
              />
            </InsetList>
          )}
        </>
      )}
    </PanelDrawer>
  );
}

function PersonRow({ user, role }: { user: ReferralUserRef | null; role: string }) {
  return (
    <InsetRow
      leading={<Avatar size={38} radius="xl" name={user?.name ?? "?"} color="initials" />}
      title={user?.name ?? "Deleted account"}
      subtitle={user?.email}
      trailing={<span className={classes.roleTag}>{role}</span>}
    />
  );
}
