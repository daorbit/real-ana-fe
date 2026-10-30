import { Tooltip, UnstyledButton } from "@mantine/core";
import { UserRound } from "lucide-react";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import type { WorkspaceMember } from "@/shared/types";
import { UNASSIGNED } from "../lib/board";
import classes from "./Tasks.module.css";

const MAX_SHOWN = 8;

export function PeopleFilter({
  members,
  selected,
  onToggle,
}: {
  members: WorkspaceMember[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className={`${classes.people} ${selected.size ? classes.peopleDim : ""}`}>
      {members.slice(0, MAX_SHOWN).map((m) => (
        <Tooltip key={m.userId} label={m.name || m.email} withArrow>
          <UnstyledButton
            className={classes.person}
            data-active={selected.has(m.userId) || undefined}
            onClick={() => onToggle(m.userId)}
            aria-pressed={selected.has(m.userId)}
            aria-label={`Show tasks for ${m.name || m.email}`}
          >
            <UserAvatar src={m.avatarUrl} name={m.name || m.email} size={28} radius="xl" />
          </UnstyledButton>
        </Tooltip>
      ))}
      <Tooltip label="Unassigned" withArrow>
        <UnstyledButton
          className={classes.person}
          data-active={selected.has(UNASSIGNED) || undefined}
          onClick={() => onToggle(UNASSIGNED)}
          aria-pressed={selected.has(UNASSIGNED)}
          aria-label="Show unassigned tasks"
        >
          <span className={classes.unassignedDot}>
            <UserRound size={14} />
          </span>
        </UnstyledButton>
      </Tooltip>
    </div>
  );
}
