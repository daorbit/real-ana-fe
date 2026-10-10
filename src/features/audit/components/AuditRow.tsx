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

function TeamMark({ entry }: { entry: AuditEntry }) {
  const Icon = CATEGORY_META[entry.category].icon;
  const name = actorName(entry);
  return (
    <span className={classes.mark}>
      <UserAvatar src={entry.actor?.avatarUrl} name={name} radius="xl" size={34} />
      <span className={classes.categoryBadge} aria-hidden>
        <Icon size={10} />
      </span>
    </span>
  );
}

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
  onSelect,
}: {
  entry: AuditEntry;
  perspective: "team" | "self";
  onSelect?: (entry: AuditEntry) => void;
}) {
  const device = deviceLine(entry);
  const interactive = onSelect
    ? {
        role: "button",
        tabIndex: 0,
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
    <div className={classes.row} {...interactive}>
      {perspective === "team" ? <TeamMark entry={entry} /> : <SelfMark entry={entry} />}

      <div className={classes.body}>
        <div className={classes.sentence}>
          {perspective === "team" ? (
            <>
              <span className={classes.actor}>{actorName(entry)}</span> {describeTeamAction(entry)}
            </>
          ) : (
            describeOwnAction(entry)
          )}
        </div>
        {(device || entry.viaSupport || entry.source === "forms") && (
          <div className={classes.meta}>
            {entry.viaSupport && perspective === "team" && (
              <span className={classes.tag} data-tone="support">
                Via Quantalog support
              </span>
            )}
            {entry.source === "forms" && <span className={classes.tag}>Lead capture</span>}
            {device && <span>{device}</span>}
          </div>
        )}
      </div>

      <time className={classes.time} dateTime={entry.createdAt} title={dateTime(entry.createdAt)}>
        {perspective === "team" ? timeOfDay(entry.createdAt) : dateTime(entry.createdAt)}
      </time>
    </div>
  );
}
