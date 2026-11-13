import { Select } from "@mantine/core";
import type { WorkspaceMember } from "@/shared/types";
import { SECTION_HELP } from "../../lib/help";
import type { Person } from "../../types";
import { Panel } from "./Panel";

const NOBODY = "";

export function OwnerPanel({
  assignee,
  members,
  canEdit,
  busy,
  onChange,
}: {
  assignee: Person | null;
  members: WorkspaceMember[];
  canEdit: boolean;
  busy: boolean;
  onChange: (assigneeId: string | null) => void;
}) {
  const options = members.map((m) => ({ value: m.userId, label: m.name || m.email }));
  if (assignee && !options.some((o) => o.value === assignee.id)) options.push({ value: assignee.id, label: assignee.name || "A member" });
  const data = [{ value: NOBODY, label: "Nobody yet" }, ...options];

  return (
    <Panel id="radar-owner" title="Owner" help={SECTION_HELP.owner}>
      <Select
        aria-label="Owner"
        data={data}
        value={assignee?.id ?? NOBODY}
        disabled={!canEdit || busy}
        allowDeselect={false}
        onChange={(value) => onChange(value ? value : null)}
      />
    </Panel>
  );
}
