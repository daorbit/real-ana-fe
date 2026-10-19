import { Building2, CalendarDays, ChartLine, FileText, Inbox, LockKeyhole, ShieldCheck, type LucideIcon } from "lucide-react";
import type { ConnectorScope } from "@/features/connectors/lib/connectorApi";
import classes from "./PermissionList.module.css";

const SCOPES: Record<string, { icon: LucideIcon; label: string }> = {
  "workspace:read": { icon: Building2, label: "Workspace & sites" },
  "forms:read": { icon: FileText, label: "Forms" },
  "submissions:read": { icon: Inbox, label: "Responses & leads" },
  "bookings:read": { icon: CalendarDays, label: "Bookings" },
  "analytics:read": { icon: ChartLine, label: "Website traffic" },
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
        Read-only — nothing can be created, changed or deleted.
      </p>
    </div>
  );
}
