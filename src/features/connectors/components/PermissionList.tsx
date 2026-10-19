import { Building2, CalendarDays, ChartLine, FileText, Inbox, ShieldCheck, type LucideIcon } from "lucide-react";
import type { ConnectorScope } from "@/features/connectors/lib/connectorApi";
import classes from "./PermissionList.module.css";

const SCOPE_ICONS: Record<string, LucideIcon> = {
  "workspace:read": Building2,
  "forms:read": FileText,
  "submissions:read": Inbox,
  "bookings:read": CalendarDays,
  "analytics:read": ChartLine,
};

export function PermissionList({ scopes }: { scopes: ConnectorScope[] }) {
  return (
    <div className={classes.group}>
      <ul className={classes.list}>
        {scopes.map((s) => {
          const Icon = SCOPE_ICONS[s.scope] ?? ShieldCheck;
          return (
            <li key={s.scope} className={classes.item}>
              <Icon size={17} strokeWidth={1.9} className={classes.icon} />
              <span>{s.description}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
