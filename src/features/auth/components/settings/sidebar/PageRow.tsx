import { ActionIcon, Switch, Tooltip } from "@mantine/core";
import { Pin } from "lucide-react";
import type { NavItem } from "@/app/shell/navItems";
import { NavItemIcon } from "@/app/shell/NavItemIcon";
import classes from "./Sidebar.module.css";

export function PageRow({
  item,
  label,
  section,
  pinned,
  hidden,
  locked,
  editable,
  onTogglePin,
  onToggleShown,
}: {
  item: NavItem;
  label: string;
  section: string;
  pinned: boolean;
  hidden: boolean;
  locked: boolean;
  editable: boolean;
  onTogglePin: () => void;
  onToggleShown: () => void;
}) {
  return (
    <div className={classes.pageRow} data-hidden={hidden || undefined}>
      <span className={classes.pageName}>
        <span className={classes.tile} data-accent={pinned || undefined}>
          <NavItemIcon item={item} size={16} />
        </span>
        <span className={classes.rowLabel}>{label}</span>
      </span>
      <span className={classes.pageSection}>{section}</span>
      <span className={classes.cell}>
        <Tooltip label={pinned ? "Unpin" : "Pin to top"} withArrow openDelay={300} disabled={!editable}>
          <ActionIcon
            variant="subtle"
            color="gray"
            size={30}
            radius="md"
            className={classes.pinButton}
            data-active={pinned || undefined}
            disabled={!editable}
            onClick={onTogglePin}
            aria-label={pinned ? `Unpin ${label}` : `Pin ${label}`}
            aria-pressed={pinned}
          >
            <Pin size={15} />
          </ActionIcon>
        </Tooltip>
      </span>
      <span className={classes.cell}>
        <Tooltip label="Always shown" withArrow openDelay={300} disabled={!locked}>
          <span>
            <Switch
              size="sm"
              checked={!hidden}
              disabled={!editable || locked}
              onChange={onToggleShown}
              aria-label={hidden ? `Show ${label}` : `Hide ${label}`}
            />
          </span>
        </Tooltip>
      </span>
    </div>
  );
}
