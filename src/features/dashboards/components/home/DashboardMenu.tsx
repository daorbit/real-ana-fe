import { ActionIcon, Menu } from "@mantine/core";
import { Copy, MoreHorizontal, Trash2 } from "lucide-react";

export function DashboardMenu({ onDuplicate, onDelete }: { onDuplicate: () => void; onDelete: () => void }) {
  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="Dashboard actions"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
        <Menu.Item leftSection={<Copy size={14} />} onClick={onDuplicate}>Duplicate</Menu.Item>
        <Menu.Divider />
        <Menu.Item leftSection={<Trash2 size={14} />} color="red" onClick={onDelete}>Delete</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
