import { Menu } from "@mantine/core";
import { Check, ChevronsUpDown } from "lucide-react";
import type { AuthorizationRequest } from "@/features/connectors/lib/connectorApi";
import classes from "./WorkspaceSelect.module.css";

type Workspace = AuthorizationRequest["workspaces"][number];

interface Props {
  workspaces: Workspace[];
  value: string | null;
  disabled?: boolean;
  onChange: (id: string) => void;
}

function Identity({ workspace }: { workspace: Workspace }) {
  return (
    <>
      <span className={classes.avatar} aria-hidden>
        {workspace.name.trim().charAt(0).toUpperCase() || "W"}
      </span>
      <span className={classes.text}>
        <span className={classes.name}>{workspace.name}</span>
        <span className={classes.role}>{workspace.role}</span>
      </span>
    </>
  );
}

export function WorkspaceSelect({ workspaces, value, disabled, onChange }: Props) {
  const selected = workspaces.find((w) => w.id === value) ?? workspaces[0];
  if (!selected) return null;

  if (workspaces.length === 1) {
    return (
      <div className={classes.field}>
        <Identity workspace={selected} />
      </div>
    );
  }

  return (
    <Menu
      position="bottom"
      width="target"
      offset={6}
      withinPortal={false}
      disabled={disabled}
      classNames={{ dropdown: classes.dropdown, item: classes.item }}
    >
      <Menu.Target>
        <button type="button" className={classes.field} aria-label="Choose a workspace" disabled={disabled}>
          <Identity workspace={selected} />
          <ChevronsUpDown size={16} className={classes.chevron} />
        </button>
      </Menu.Target>
      <Menu.Dropdown>
        {workspaces.map((w) => (
          <Menu.Item
            key={w.id}
            onClick={() => onChange(w.id)}
            rightSection={w.id === selected.id ? <Check size={15} /> : null}
          >
            <span className={classes.option}>
              <Identity workspace={w} />
            </span>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
