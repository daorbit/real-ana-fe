import { Button, Group, Menu, TextInput, UnstyledButton } from "@mantine/core";
import { ChartPie, Check, ChevronDown, Columns3, Rows3, Search, Table2 } from "lucide-react";
import type { WorkspaceMember } from "@/shared/types";
import { GROUP_LABEL } from "../lib/board";
import type { BoardView, GroupBy } from "../types";
import { PeopleFilter } from "./PeopleFilter";
import classes from "./Tasks.module.css";

const GROUPS: GroupBy[] = ["bucket", "progress", "assignee", "priority"];

const VIEWS: { value: BoardView; label: string; icon: typeof Columns3 }[] = [
  { value: "board", label: "Board", icon: Columns3 },
  { value: "grid", label: "Grid", icon: Table2 },
  { value: "charts", label: "Charts", icon: ChartPie },
];

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
      <Group gap={2} wrap="nowrap" className="range-segmented" role="tablist" aria-label="View">
        {VIEWS.map(({ value, label, icon: Icon }) => (
          <UnstyledButton
            key={value}
            role="tab"
            aria-selected={view === value}
            className="range-seg-btn"
            data-active={view === value}
            onClick={() => onView(value)}
          >
            <Icon size={14} className={classes.viewIcon} />
            {label}
          </UnstyledButton>
        ))}
      </Group>
    </div>
  );
}
