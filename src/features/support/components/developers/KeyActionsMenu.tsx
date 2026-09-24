import { ActionIcon, Menu } from "@mantine/core";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  onRename: () => void;
  onRevoke: () => void;
}

export function KeyActionsMenu({ onRename, onRevoke }: Props) {
  const { t } = useTranslation();

  return (
    <Menu position="bottom-end" withinPortal shadow="md" width={180}>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" aria-label={t("developers.keyActions")}>
          <MoreHorizontal size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<Pencil size={14} />} onClick={onRename}>
          {t("developers.rename")}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          className="danger-item"
          color="red"
          leftSection={<Trash2 size={14} />}
          onClick={onRevoke}
        >
          {t("developers.revoke")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
