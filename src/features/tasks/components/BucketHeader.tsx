import { useState } from "react";
import { ActionIcon, Menu, TextInput } from "@mantine/core";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import classes from "./Tasks.module.css";

export function BucketHeader({
  name,
  count,
  canEdit,
  canDelete,
  onRename,
  onDelete,
}: {
  name: string;
  count: number;
  canEdit: boolean;
  canDelete: boolean;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);

  const save = () => {
    const next = value.trim();
    setEditing(false);
    if (next && next !== name) onRename(next);
    else setValue(name);
  };

  if (editing) {
    return (
      <TextInput
        size="sm"
        className={classes.bucketInput}
        value={value}
        maxLength={40}
        autoFocus
        onChange={(e) => setValue(e.currentTarget.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") {
            setValue(name);
            setEditing(false);
          }
        }}
        aria-label="Bucket name"
      />
    );
  }

  return (
    <>
      <span
        className={classes.columnTitle}
        onDoubleClick={() => canEdit && setEditing(true)}
        title={canEdit ? "Double-click to rename" : undefined}
      >
        {name}
      </span>
      <span className={classes.columnCount}>{count}</span>
      {canEdit && (
        <Menu position="bottom-end" width={180}>
          <Menu.Target>
            <ActionIcon className={classes.columnMenu} variant="subtle" color="gray" size="sm" aria-label={`${name} options`}>
              <MoreHorizontal size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<Pencil size={14} />} onClick={() => setEditing(true)}>
              Rename bucket
            </Menu.Item>
            <Menu.Item className="danger-item" leftSection={<Trash2 size={14} />} disabled={!canDelete} onClick={onDelete}>
              Delete bucket
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
    </>
  );
}
