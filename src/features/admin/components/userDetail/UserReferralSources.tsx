import { REFERRAL_OPTIONS } from "@/features/auth/components/onboarding/ReferralStep";
import type { ReferralSource } from "@/shared/types";
import classes from "./userDetail.module.css";

export function UserReferralSources({ sources }: { sources?: ReferralSource[] }) {
  const picked = REFERRAL_OPTIONS.filter((option) => sources?.includes(option.value));

  return (
    <div className={classes.referral}>
      <span className={classes.referralLabel}>Heard about us from</span>
      {picked.length ? (
        <ul className={classes.referralList}>
          {picked.map(({ value, label, icon: Icon, color }) => (
            <li key={value} className={classes.referralChip}>
              <Icon size={13} color={color} aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      ) : (
        <span className={classes.referralEmpty}>Not answered</span>
      )}
    </div>
  );
}
