import { Link } from "react-router-dom";
import { ActionIcon, Box, Group, Tooltip } from "@mantine/core";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Wordmark } from "@/shared/ui/Brand";

/**
 * The wordmark and the control that hides it, on one row.
 *
 * Collapsed the wordmark goes and the toggle takes the whole width — the mark
 * does not shorten to a letter, because a lone "Q" is a different logo rather
 * than a smaller one.
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
      px={6}
      pt={6}
      pb="md"
      justify={collapsed ? "center" : "space-between"}
    >
      {!collapsed && (
        <Box component={Link} to="/app" display="flex" style={{ minWidth: 0 }}>
          <Wordmark />
        </Box>
      )}
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
