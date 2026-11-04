import type { AuditEntry } from "@/shared/types";
import { AuditDetailContent } from "./AuditDetailContent";
import { AuditDetailHead } from "./AuditDetailHead";
import classes from "./AuditDetail.module.css";

export function AuditInspector({ entry }: { entry: AuditEntry }) {
  return (
    <aside className={classes.inspector} aria-label="Entry details">
      <AuditDetailHead entry={entry} />
      <AuditDetailContent entry={entry} />
    </aside>
  );
}
