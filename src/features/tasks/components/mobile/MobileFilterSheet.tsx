import { Button, Menu } from "@mantine/core";
import { Check, ListFilter, UserRound, UserRoundCheck } from "lucide-react";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import type { WorkspaceMember } from "@/shared/types";
import { GROUP_LABEL, UNASSIGNED } from "../../lib/board";
import type { BoardView, DueFilter, GroupBy } from "../../types";
import { DUE_FILTERS, GROUPS } from "../toolbarOptions";
import classes from "./MobileControls.module.css";

const CHECK = <Check size={16} />;

export function MobileFilterSheet({
  view,
  members,
  people,
  onTogglePerson,
  userId,
  myTasksOnly,
  onMyTasks,
  dueFilter,
  onDueFilter,
  groupBy,
  onGroupBy,
  onClearFilters,
}: {
  view: BoardView;
  members: WorkspaceMember[];
  people: Set<string>;
  onTogglePerson: (id: string) => void;
  userId: string | null;
  myTasksOnly: boolean;
  onMyTasks: () => void;
  dueFilter: DueFilter;
  onDueFilter: (filter: DueFilter) => void;
  groupBy: GroupBy;
  onGroupBy: (value: GroupBy) => void;
  onClearFilters: () => void;
}) {
  const count = people.size + Number(myTasksOnly) + Number(dueFilter !== "all");

  return (
    <Menu position="bottom-end" closeOnItemClick={false}>
      <Menu.Target>
        <Button
          className={classes.control}
          variant={count ? "light" : "default"}
          leftSection={<ListFilter size={16} />}
          aria-label={count ? `Filters, ${count} on` : "Filters"}
        >
          Filter
          {count > 0 && <span className={classes.count}>{count}</span>}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Show</Menu.Label>
        <Menu.Item
          leftSection={<UserRoundCheck size={18} />}
          rightSection={myTasksOnly ? CHECK : null}
          disabled={!userId}
          onClick={onMyTasks}
        >
          Only my tasks
        </Menu.Item>

        <Menu.Label>Due date</Menu.Label>
        {DUE_FILTERS.map((item) => (
          <Menu.Item key={item.value} rightSection={item.value === dueFilter ? CHECK : null} onClick={() => onDueFilter(item.value)}>
            {item.label}
          </Menu.Item>
        ))}

        <Menu.Label>Assigned to</Menu.Label>
        {members.map((m) => (
          <Menu.Item
            key={m.userId}
            leftSection={<UserAvatar src={m.avatarUrl} name={m.name || m.email} size={24} radius="xl" />}
            rightSection={people.has(m.userId) ? CHECK : null}
            onClick={() => onTogglePerson(m.userId)}
          >
            {m.name || m.email}
          </Menu.Item>
        ))}
        <Menu.Item
          leftSection={
            <span className={classes.unassigned}>
              <UserRound size={14} />
            </span>
          }
          rightSection={people.has(UNASSIGNED) ? CHECK : null}
          onClick={() => onTogglePerson(UNASSIGNED)}
        >
          Unassigned
        </Menu.Item>

        {view === "board" && (
          <>
            <Menu.Label>Group by</Menu.Label>
            {GROUPS.map((g) => (
              <Menu.Item key={g} rightSection={g === groupBy ? CHECK : null} onClick={() => onGroupBy(g)}>
                {GROUP_LABEL[g]}
              </Menu.Item>
            ))}
          </>
        )}

        {count > 0 && (
          <>
            <Menu.Divider />
            <Menu.Item className={classes.clear} closeMenuOnClick onClick={onClearFilters}>
              Clear filters
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
