import { timeAgo } from "@/shared/lib/format";
import type { AuditEntry } from "@/shared/types";
import { actorName, describeTeamAction } from "../lib/auditCopy";
import { CATEGORY_META } from "../lib/categories";
import classes from "./AuditDetail.module.css";

export function AuditDetailHead({ entry }: { entry: AuditEntry }) {
  return (
    <div className={classes.head}>
      <span className={classes.eyebrow}>
        {CATEGORY_META[entry.category].label} · {timeAgo(entry.createdAt)}
      </span>
      <h2 className={classes.title}>
        {actorName(entry)} {describeTeamAction(entry)}
      </h2>
    </div>
  );
}
