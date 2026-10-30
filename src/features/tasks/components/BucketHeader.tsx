import { useState } from "react";
import { ActionIcon, Menu, NumberInput, TextInput, Tooltip } from "@mantine/core";
import { Gauge, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import classes from "./Tasks.module.css";

const MAX_LIMIT = 999;

function limitState(total: number, limit: number | null): "near" | "over" | undefined {
  if (!limit) return undefined;
  if (total > limit) return "over";
  return total === limit ? "near" : undefined;
}

export function BucketHeader({
  name,
  count,
  total,
  limit,
  compact = false,
  canEdit,
  canDelete,
  onRename,
  onSetLimit,
  onDelete,
}: {
  name: string;
  count: number;
  total: number;
  limit: number | null;
  compact?: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onRename: (name: string) => void;
  onSetLimit: (limit: number | null) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState<"name" | "limit" | null>(null);
  const [value, setValue] = useState(name);
  const [limitValue, setLimitValue] = useState<number | string>(limit ?? "");

  const save = () => {
    const next = value.trim();
    setEditing(null);
    if (next && next !== name) onRename(next);
    else setValue(name);
  };

  const saveLimit = () => {
    setEditing(null);
    const next = typeof limitValue === "number" && limitValue > 0 ? limitValue : null;
    if (next !== limit) onSetLimit(next);
  };

  if (editing === "name") {
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
            setEditing(null);
          }
        }}
        aria-label="Bucket name"
      />
    );
  }

  if (editing === "limit") {
    return (
      <NumberInput
        size="sm"
        className={classes.bucketInput}
        value={limitValue}
        min={1}
        max={MAX_LIMIT}
        allowDecimal={false}
        allowNegative={false}
        placeholder="No limit"
        leftSection={<Gauge size={14} />}
        autoFocus
        onChange={setLimitValue}
        onBlur={saveLimit}
        onKeyDown={(e) => {
          if (e.key === "Enter") saveLimit();
          if (e.key === "Escape") {
            setLimitValue(limit ?? "");
            setEditing(null);
          }
        }}
        aria-label={`Most open tasks allowed in ${name}`}
      />
    );
  }

  const state = limitState(total, limit);

  return (
    <>
      {!compact && (
        <span
          className={classes.columnTitle}
          onDoubleClick={() => canEdit && setEditing("name")}
          title={canEdit ? "Double-click to rename" : undefined}
        >
          {limit ? name : `${name} (${count})`}
        </span>
      )}
      {limit ? (
        <Tooltip label={state === "over" ? "Over the limit for this bucket" : `Limit of ${limit} open tasks`} withArrow>
          <span className={classes.limit} data-state={state}>
            {total}/{limit}
          </span>
        </Tooltip>
      ) : null}
      {canEdit && (
        <Menu position="bottom-end" width={190}>
          <Menu.Target>
            <ActionIcon className={classes.columnMenu} variant="subtle" color="gray" size="sm" aria-label={`${name} options`}>
              <MoreHorizontal size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<Pencil size={14} />} onClick={() => setEditing("name")}>
              Rename bucket
            </Menu.Item>
            <Menu.Item
              leftSection={<Gauge size={14} />}
              onClick={() => {
                setLimitValue(limit ?? "");
                setEditing("limit");
              }}
            >
              {limit ? "Change limit" : "Set a limit"}
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
