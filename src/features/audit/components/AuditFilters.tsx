import { Select } from "@mantine/core";
import type { AuditSummary, WorkspaceMember } from "@/shared/types";
import type { WorkspaceAuditCategory } from "../lib/categories";
import { AreaChips } from "./AreaChips";
import classes from "./AuditLog.module.css";

export function AuditFilters({
  summary,
  category,
  actor,
  members,
  onCategory,
  onActor,
}: {
  summary: AuditSummary | null;
  category: WorkspaceAuditCategory | null;
  actor: string | null;
  members: WorkspaceMember[];
  onCategory: (next: WorkspaceAuditCategory | null) => void;
  onActor: (next: string | null) => void;
}) {
  return (
    <div className={classes.toolbar}>
      <AreaChips summary={summary} category={category} onCategory={onCategory} />
      <label className={classes.actorFilter}>
        Person
        <Select
          className={classes.actorSelect}
          size="xs"
          radius={10}
          placeholder="Everyone"
          clearable
          searchable
          value={actor}
          onChange={onActor}
          data={members.map((m) => ({ value: m.userId, label: m.name || m.email }))}
          nothingFoundMessage="No member by that name"
          aria-label="Filter by person"
        />
      </label>
    </div>
  );
}
