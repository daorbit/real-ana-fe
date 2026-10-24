import { ActionIcon, Menu } from "@mantine/core";
import { Copy, MoreHorizontal, Trash2 } from "lucide-react";

export function FunnelViewMenu({ onDuplicate, onDelete }: { onDuplicate: () => void; onDelete: () => void }) {
  return (
    <Menu position="bottom-end" withinPortal radius="lg" width={200}>
      <Menu.Target>
        <ActionIcon variant="default" size="lg" radius="md" aria-label="More actions">
          <MoreHorizontal size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<Copy size={14} />} onClick={onDuplicate}>
          Duplicate
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item leftSection={<Trash2 size={14} />} color="red" onClick={onDelete}>
          Delete funnel
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
