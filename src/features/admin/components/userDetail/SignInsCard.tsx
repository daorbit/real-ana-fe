import { timeAgo } from "@/shared/lib";
import type { AdminUserOverview } from "@/shared/types";
import classes from "./userDetail.module.css";

const METHOD_LABEL: Record<string, string> = {
  password: "Password",
  google: "Google",
  "2fa": "Password + 2FA",
  backup_code: "Backup code",
};

export function SignInsCard({ signIns }: { signIns: AdminUserOverview["signIns"] }) {
  return (
    <div className={classes.card}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>Recent sign-ins</span>
      </div>

      {signIns.length ? (
        <div className={classes.signIns}>
          {signIns.map((entry) => (
            <div key={String(entry.at)} className={classes.signIn}>
              <div className={classes.signInMain}>
                <span>{METHOD_LABEL[entry.method] ?? "Sign-in"}</span>
                <span className={classes.signInSub}>
                  {[entry.browser, entry.os, entry.location].filter(Boolean).join(" · ") || "Unknown device"}
                </span>
              </div>
              <span className={classes.signInTime}>{timeAgo(entry.at)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className={classes.empty}>No sign-ins recorded</div>
      )}
    </div>
  );
}
