import { ActionIcon, Tooltip } from "@mantine/core";
import { Eye, EyeOff, Pin } from "lucide-react";
import type { NavItem } from "@/app/shell/navItems";
import classes from "./Sidebar.module.css";

export function PageRow({
  item,
  label,
  hidden,
  locked,
  editable,
  onPin,
  onToggleHidden,
}: {
  item: NavItem;
  label: string;
  hidden: boolean;
  locked: boolean;
  editable: boolean;
  onPin: () => void;
  onToggleHidden: () => void;
}) {
  const Icon = item.icon;

  return (
    <div className={classes.row} data-hidden={hidden || undefined}>
      <span className={classes.tile}>
        <Icon size={16} />
      </span>
      <span className={classes.rowText}>
        <span className={classes.rowLabel}>{label}</span>
        {hidden && <span className={classes.rowHint}>Hidden from the sidebar</span>}
      </span>
      {editable && (
        <span className={classes.rowActions}>
          {!hidden && (
            <Tooltip label="Pin to top" withArrow openDelay={300}>
              <ActionIcon variant="subtle" color="gray" size={32} radius="md" onClick={onPin} aria-label={`Pin ${label}`}>
                <Pin size={16} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label={locked ? "Always shown" : hidden ? "Show in sidebar" : "Hide from sidebar"} withArrow openDelay={300}>
            <span>
              <ActionIcon
                variant="subtle"
                color="gray"
                size={32}
                radius="md"
                disabled={locked}
                onClick={onToggleHidden}
                aria-label={hidden ? `Show ${label}` : `Hide ${label}`}
              >
                {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
              </ActionIcon>
            </span>
          </Tooltip>
        </span>
      )}
    </div>
  );
}
