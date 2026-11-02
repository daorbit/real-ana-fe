import {
  Building2,
  CalendarDays,
  ChartLine,
  FileText,
  Inbox,
  ListChecks,
  LockKeyhole,
  NotebookPen,
  ShieldCheck,
  SquarePen,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import type { ConnectorScope } from "@/features/connectors/lib/connectorApi";
import { accessAssurance } from "@/features/connectors/lib/scopeAccess";
import classes from "./PermissionList.module.css";

const SCOPES: Record<string, { icon: LucideIcon; label: string }> = {
  "workspace:read": { icon: Building2, label: "Workspace & sites" },
  "forms:read": { icon: FileText, label: "Forms" },
  "submissions:read": { icon: Inbox, label: "Responses & leads" },
  "bookings:read": { icon: CalendarDays, label: "Bookings" },
  "analytics:read": { icon: ChartLine, label: "Website traffic" },
  "tasks:read": { icon: ListChecks, label: "Tasks" },
  "tasks:write": { icon: SquarePen, label: "Add & edit tasks" },
  "notes:read": { icon: StickyNote, label: "Your notes" },
  "notes:write": { icon: NotebookPen, label: "Add & edit notes" },
};

export function PermissionList({ scopes }: { scopes: ConnectorScope[] }) {
  return (
    <div className={classes.card}>
      <ul className={classes.grid}>
        {scopes.map((s) => {
          const known = SCOPES[s.scope];
          const Icon = known?.icon ?? ShieldCheck;
          return (
            <li key={s.scope} className={classes.item} title={s.description}>
              <Icon size={16} strokeWidth={1.9} className={classes.icon} />
              <span>{known?.label ?? s.description}</span>
            </li>
          );
        })}
      </ul>
      <p className={classes.assure}>
        <LockKeyhole size={13} />
        {accessAssurance(scopes)}
      </p>
    </div>
  );
}
