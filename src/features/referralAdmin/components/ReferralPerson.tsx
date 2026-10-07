import type { ReferralUserRef } from "@/shared/types";
import classes from "./ReferralAdmin.module.css";

export function ReferralPerson({ user, role }: { user: ReferralUserRef | null; role?: string }) {
  return (
    <div className={classes.person}>
      <span className={classes.avatar} aria-hidden>{user ? user.name.charAt(0).toUpperCase() : "?"}</span>
      <div className={classes.personText}>
        {role && <span className={classes.role}>{role}</span>}
        <span className={classes.personName}>{user ? user.name : "Deleted account"}</span>
        {user && <span className={classes.muted}>{user.email}</span>}
      </div>
    </div>
  );
}
