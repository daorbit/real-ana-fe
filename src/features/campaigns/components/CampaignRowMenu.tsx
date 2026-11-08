import { ActionIcon, Menu } from "@mantine/core";
import { BarChart3, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Campaign } from "@/features/campaigns/types";

export function CampaignRowMenu({
  campaign,
  to,
  onDelete,
}: {
  campaign: Campaign;
  to: string;
  onDelete: (campaign: Campaign) => void;
}) {
  const draft = campaign.status === "draft";
  const busy = campaign.status === "sending" || campaign.status === "preparing";

  return (
    <Menu position="bottom-end" withinPortal shadow="md" width={180}>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" size={32} radius={10} aria-label={`Actions for ${campaign.name}`}>
          <MoreHorizontal size={17} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item component={Link} to={to} leftSection={draft ? <Pencil size={14} /> : <BarChart3 size={14} />}>
          {draft ? "Edit" : "View report"}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<Trash2 size={14} />}
          disabled={busy}
          onClick={() => onDelete(campaign)}
        >
          {busy ? "Pause to delete" : "Delete"}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
