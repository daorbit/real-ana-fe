import { AlertTriangle, Info } from "lucide-react";
import type { TrustNotice } from "../lib/trust";
import classes from "./Compare.module.css";

export function TrustNotices({ notices }: { notices: TrustNotice[] }) {
  if (!notices.length) return null;
  return (
    <div className={classes.notices}>
      {notices.map((n) => (
        <p key={n.id} className={classes.notice} data-tone={n.tone}>
          {n.tone === "warn" ? <AlertTriangle size={14} /> : <Info size={14} />}
          {n.text}
        </p>
      ))}
    </div>
  );
}
