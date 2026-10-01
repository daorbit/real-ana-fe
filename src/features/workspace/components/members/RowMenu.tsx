import type { ReactNode } from "react";
import { ActionIcon, Menu } from "@mantine/core";
import { MoreHorizontal } from "lucide-react";

export function RowMenu({
  label,
  actionLabel,
  icon,
  onAction,
}: {
  label: string;
  actionLabel: string;
  icon: ReactNode;
  onAction: () => void;
}) {
  return (
    <Menu position="bottom-end" radius="md" width={200} withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" size={32} radius="md" aria-label={label}>
          <MoreHorizontal size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item color="red" leftSection={icon} onClick={onAction}>
          {actionLabel}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
