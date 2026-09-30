import { ActionIcon, Loader, Menu } from "@mantine/core";
import { MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";

export function SitemapRowActions({
  busy,
  onResubmit,
  onRemove,
}: {
  busy: boolean;
  onResubmit: () => void;
  onRemove: () => void;
}) {
  if (busy) return <Loader size={14} color="gray" />;

  return (
    <Menu position="bottom-end" withinPortal shadow="md" width={180}>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" size={28} radius="xl" aria-label="Sitemap actions">
          <MoreHorizontal size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<RefreshCw size={14} />} onClick={onResubmit}>
          Resubmit
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item className="danger-item" color="red" leftSection={<Trash2 size={14} />} onClick={onRemove}>
          Remove
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
