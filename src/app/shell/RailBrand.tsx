import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * The control that narrows the rail to its icon column.
 *
 * It sits at the end of the workspace row rather than on a line of its own.
 * Collapsed there is nothing beside it, so it centres in the icon column.
 */
export function RailBrand({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const label = collapsed
    ? t("nav.expandRail", "Expand sidebar")
    : t("nav.collapseRail", "Collapse sidebar");

  return (
    <Group
      gap={4}
      wrap="nowrap"
      justify={collapsed ? "center" : "flex-end"}
      style={{ flex: collapsed ? 1 : undefined }}
    >
      <Tooltip label={label} position="right" withArrow openDelay={200}>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="md"
          onClick={onToggle}
          aria-label={label}
          aria-expanded={!collapsed}
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
