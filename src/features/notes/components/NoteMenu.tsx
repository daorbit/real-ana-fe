import { Menu, Tooltip, UnstyledButton } from "@mantine/core";
import { MoreHorizontal, Pin, PinOff, Trash2 } from "lucide-react";
import { NOTE_COLORS } from "@/features/notes/types";
import type { NoteColor } from "@/features/notes/types";
import classes from "@/features/notes/components/Notes.module.css";

export function NoteMenu({
  color,
  pinned,
  onColor,
  onTogglePin,
  onDelete,
}: {
  color: NoteColor;
  pinned: boolean;
  onColor: (color: NoteColor) => void;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  return (
    <Menu position="bottom-end" withinPortal zIndex={320} width={220} radius="md" classNames={{ dropdown: classes.menu }}>
      <Menu.Target>
        <UnstyledButton className={classes.ctrl} aria-label="Note options">
          <MoreHorizontal size={15} />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Colour</Menu.Label>
        <div className={classes.swatches}>
          {NOTE_COLORS.map((c) => (
            <Tooltip key={c.value} label={c.label} withArrow zIndex={330}>
              <UnstyledButton
                className={`${classes.swatch} ${classes.tone}`}
                data-color={c.value}
                aria-label={c.label}
                aria-pressed={color === c.value}
                onClick={() => onColor(c.value)}
              />
            </Tooltip>
          ))}
        </div>
        <Menu.Divider />
        <Menu.Item leftSection={pinned ? <PinOff size={14} /> : <Pin size={14} />} onClick={onTogglePin}>
          {pinned ? "Unpin" : "Pin to top"}
        </Menu.Item>
        <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={onDelete}>
          Delete note
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
