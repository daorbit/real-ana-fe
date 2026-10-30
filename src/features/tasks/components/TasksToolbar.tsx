import { Button, Menu, SegmentedControl, TextInput } from "@mantine/core";
import { Check, ChevronDown, Columns3, Rows3, Search, Table2 } from "lucide-react";
import type { WorkspaceMember } from "@/shared/types";
import { GROUP_LABEL } from "../lib/board";
import type { BoardView, GroupBy } from "../types";
import { PeopleFilter } from "./PeopleFilter";
import classes from "./Tasks.module.css";

const GROUPS: GroupBy[] = ["progress", "assignee", "priority"];

export function TasksToolbar({
  query,
  onQuery,
  members,
  people,
  onTogglePerson,
  groupBy,
  onGroupBy,
  view,
  onView,
  usage,
}: {
  query: string;
  onQuery: (value: string) => void;
  members: WorkspaceMember[];
  people: Set<string>;
  onTogglePerson: (id: string) => void;
  groupBy: GroupBy;
  onGroupBy: (value: GroupBy) => void;
  view: BoardView;
  onView: (value: BoardView) => void;
  usage: string | null;
}) {
  return (
    <div className={classes.toolbar}>
      <TextInput
        className={classes.search}
        size="sm"
        leftSection={<Search size={15} />}
        placeholder="Search tasks or T-12"
        value={query}
        onChange={(e) => onQuery(e.currentTarget.value)}
        aria-label="Search tasks"
      />
      <PeopleFilter members={members} selected={people} onToggle={onTogglePerson} />
      <span className={classes.spacer} />
      {usage && <span className={classes.usage}>{usage} open tasks</span>}
      {view === "board" && (
        <Menu position="bottom-end" width={200}>
          <Menu.Target>
            <Button variant="default" size="sm" leftSection={<Rows3 size={15} />} rightSection={<ChevronDown size={14} />}>
              Group by {GROUP_LABEL[groupBy]}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {GROUPS.map((g) => (
              <Menu.Item key={g} onClick={() => onGroupBy(g)} rightSection={g === groupBy ? <Check size={14} /> : null}>
                {GROUP_LABEL[g]}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      )}
      <SegmentedControl
        size="sm"
        classNames={{ label: classes.segItem }}
        value={view}
        onChange={(v) => onView(v as BoardView)}
        data={[
          { value: "board", label: <span className={classes.segLabel}><Columns3 size={14} />Board</span> },
          { value: "grid", label: <span className={classes.segLabel}><Table2 size={14} />Grid</span> },
        ]}
      />
    </div>
  );
}
