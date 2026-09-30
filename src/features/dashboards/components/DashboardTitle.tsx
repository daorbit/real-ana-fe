import { useState } from "react";
import { ActionIcon, TextInput, Tooltip } from "@mantine/core";
import { Pencil } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import classes from "@/features/dashboards/components/Dashboards.module.css";

export function DashboardTitle({
  name,
  icon: Icon,
  canEdit,
  onRename,
}: {
  name: string;
  icon: LucideIcon;
  canEdit: boolean;
  onRename: (next: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);

  const commit = () => {
    const next = value.trim();
    setEditing(false);
    if (next && next !== name) onRename(next);
    else setValue(name);
  };

  if (editing) {
    return (
      <TextInput
        className={classes.titleInput}
        value={value}
        maxLength={80}
        autoFocus
        onChange={(e) => setValue(e.currentTarget.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setValue(name);
            setEditing(false);
          }
        }}
        aria-label="Dashboard name"
      />
    );
  }

  return (
    <div className={classes.titleRow}>
      <span className={classes.titleIcon}><Icon size={18} /></span>
      <h1 className={classes.title}>{name}</h1>
      {canEdit && (
        <Tooltip label="Rename" withArrow>
          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label="Rename dashboard"
            onClick={() => {
              setValue(name);
              setEditing(true);
            }}
          >
            <Pencil size={15} />
          </ActionIcon>
        </Tooltip>
      )}
    </div>
  );
}
