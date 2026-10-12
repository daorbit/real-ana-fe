import type { ReferralStatus } from "@/shared/types";
import { REFERRAL_STATUS_META } from "../../lib/referralStatus";
import classes from "./ReferralMobile.module.css";

export function StatusPill({ status }: { status: ReferralStatus }) {
  const meta = REFERRAL_STATUS_META[status];
  return (
    <span className={classes.pill} data-color={meta.color}>
      <span className={classes.pillDot} />
      {meta.label}
    </span>
  );
}
