import { useMemo, useState } from "react";
import { Menu, TextInput } from "@mantine/core";
import { Check, Search } from "lucide-react";
import { workspaceInitial } from "@/features/workspace/workspaceMarks";
import classes from "./WorkspaceList.module.css";

const SEARCH_FROM = 6;

type WorkspaceRow = { _id: string; name: string };

export function WorkspaceList({
  workspaces,
  activeId,
  onPick,
}: {
  workspaces: WorkspaceRow[];
  activeId: string | undefined;
  onPick: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const searchable = workspaces.length >= SEARCH_FROM;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return workspaces
      .map((w, index) => ({ w, index }))
      .filter(({ w }) => !q || w.name.toLowerCase().includes(q));
  }, [workspaces, query]);

  return (
    <>
      {searchable && (
        <div className={classes.search}>
          <TextInput
            size="xs"
            autoFocus
            placeholder="Find a workspace"
            leftSection={<Search size={13} />}
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && rows.length > 0) {
                e.preventDefault();
                e.currentTarget
                  .closest('[role="menu"]')
                  ?.querySelector<HTMLElement>("[data-ws-item]")
                  ?.click();
              }
              if (e.key !== "Escape" && e.key !== "ArrowDown" && e.key !== "ArrowUp") e.stopPropagation();
            }}
            aria-label="Find a workspace"
          />
        </div>
      )}

      <div className={searchable ? classes.scroll : undefined}>
        {rows.length === 0 && <div className={classes.empty}>No workspace matches “{query.trim()}”</div>}
        {rows.map(({ w, index }) => {
          const current = w._id === activeId;
          return (
            <Menu.Item
              key={w._id}
              data-ws-item
              onClick={() => onPick(w._id)}
              leftSection={
                <span aria-hidden className="ws-menu__mark">
                  {workspaceInitial(w.name)}
                </span>
              }
              rightSection={
                current ? (
                  <Check size={15} className={classes.check} />
                ) : (
                  index < 9 && <span className="ws-menu__hint">Ctrl {index + 1}</span>
                )
              }
            >
              <span className={current ? "ws-menu__name--active" : undefined}>{w.name}</span>
            </Menu.Item>
          );
        })}
      </div>
    </>
  );
}
