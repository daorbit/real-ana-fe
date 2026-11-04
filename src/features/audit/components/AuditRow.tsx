import type { KeyboardEvent } from "react";
import { ShieldAlert } from "lucide-react";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { dateTime } from "@/shared/lib/format";
import type { AuditEntry } from "@/shared/types";
import { actorName, describeOwnAction, describeTeamAction, deviceLine } from "../lib/auditCopy";
import { CATEGORY_META } from "../lib/categories";
import { timeOfDay } from "../lib/groupByDay";
import classes from "./AuditLog.module.css";

const WARN_ACTIONS = new Set(["account.login_locked", "account.2fa_disabled", "account.impersonated"]);

function SelfMark({ entry }: { entry: AuditEntry }) {
  const warn = WARN_ACTIONS.has(entry.action);
  const Icon = warn ? ShieldAlert : CATEGORY_META[entry.category].icon;
  return (
    <span className={classes.iconMark} data-warn={warn || undefined} aria-hidden>
      <Icon size={16} />
    </span>
  );
}

export function AuditRow({
  entry,
  perspective,
  selected = false,
  onSelect,
}: {
  entry: AuditEntry;
  perspective: "team" | "self";
  selected?: boolean;
  onSelect?: (entry: AuditEntry) => void;
}) {
  const team = perspective === "team";
  const device = deviceLine(entry);
  const metaText = [team ? CATEGORY_META[entry.category].label : "", device].filter(Boolean).join(" · ");
  const interactive = onSelect
    ? {
        role: "button",
        tabIndex: 0,
        "aria-pressed": selected,
        "data-clickable": true,
        onClick: () => onSelect(entry),
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(entry);
          }
        },
      }
    : {};

  return (
    <div className={classes.row} data-selected={selected || undefined} {...interactive}>
      {team ? (
        <UserAvatar src={entry.actor?.avatarUrl} name={actorName(entry)} radius="xl" size={36} />
      ) : (
        <SelfMark entry={entry} />
      )}

      <div className={classes.body}>
        <div className={classes.sentence}>
          {team ? (
            <>
              <span className={classes.actor}>{actorName(entry)}</span> {describeTeamAction(entry)}
            </>
          ) : (
            describeOwnAction(entry)
          )}
        </div>
        {(metaText || entry.viaSupport || entry.source === "forms") && (
          <div className={classes.meta}>
            {entry.viaSupport && team && <span className={classes.tag}>Via Quantalog support</span>}
            {!team && entry.source === "forms" && <span className={classes.tag}>Lead capture</span>}
            {metaText && <span>{metaText}</span>}
          </div>
        )}
      </div>

      <time className={classes.time} dateTime={entry.createdAt} title={dateTime(entry.createdAt)}>
        {team ? timeOfDay(entry.createdAt) : dateTime(entry.createdAt)}
      </time>
    </div>
  );
}
