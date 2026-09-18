import { ActionIcon, Indicator, Tooltip } from "@mantine/core";
import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useActivityPanel } from "./ActivityPanelContext";

/**
 * The bell, pinned to the top-right of the app panel.
 *
 * `PageHeader` renders it for most screens. The handful that build their own
 * top row — Home, Analytics, Orbit, the social composer — place it themselves,
 * so it lands in the same corner everywhere rather than floating over the page
 * on a fixed position.
 *
 * It opens the single drawer held by `ActivityPanelProvider`; see the note
 * there for why the panel is hoisted rather than owned by the bell.
 */
export function ActivityBellIcon({
  variant = "default",
  size = "lg",
  iconSize = 17,
}: {
  /** Matches whatever `ActionIcon` variant the host toolbar already uses. */
  variant?: "default" | "subtle";
  size?: "md" | "lg";
  iconSize?: number;
}) {
  const { t } = useTranslation();
  const { count, open } = useActivityPanel();

  const label = t("activity.title", "Activity");
  // Past a hundred the exact number stops being information and starts being a
  // wide badge that pushes the rest of the row around.
  const badge = count > 99 ? "99+" : String(count);

  return (
    <Tooltip label={count > 0 ? `${label} · ${badge}` : label} withArrow>
      <Indicator
        inline
        disabled={count === 0}
        label={badge}
        size={16}
        offset={size === "md" ? 4 : 6}
        color="red"
        withBorder
        styles={{ indicator: { fontSize: 10, fontWeight: 700, paddingInline: 4 } }}
      >
        <ActionIcon
          variant={variant}
          color={variant === "subtle" ? "gray" : undefined}
          size={size}
          radius="md"
          onClick={open}
          aria-label={count > 0 ? `${label} (${badge})` : label}
        >
          <Bell size={iconSize} />
        </ActionIcon>
      </Indicator>
    </Tooltip>
  );
}
