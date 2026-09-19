import { Box, Menu, UnstyledButton } from "@mantine/core";
import { ChevronDown, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWorkspace } from "@/features/workspace/context";
import { WorkspaceMenuItems } from "./WorkspaceSwitcher";

/**
 * The workspace this session is looking at, as the first block in the rail.
 *
 * Named here rather than only in a tooltip because every number below it
 * belongs to this workspace — with several of them in play, which one is
 * selected is context for the whole screen, not an occasional lookup.
 *
 * Collapsed it is not drawn at all: the rail keeps its icon-sized switcher at
 * the bottom for that width, and two ways to switch stacked in one column
 * would read as two different controls.
 */
export function RailWorkspaceHeader({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation();
  const { workspaces, active } = useWorkspace();

  if (collapsed || workspaces.length === 0) return null;

  return (
    <Menu
      position="bottom-start"
      radius="md"
      width={264}
      shadow="md"
      withinPortal
      zIndex={400}
      classNames={{ dropdown: "ws-menu" }}
    >
      <Menu.Target>
        <UnstyledButton
          className="rail-workspace"
          aria-label={t("nav.activeWorkspace")}
        >
          {/* The real product mark, not an initial: a workspace has no logo of
              its own, and a letter tile here reads as a placeholder for one. */}
          <Box
            component="img"
            src="/brand-mark.png"
            alt=""
            aria-hidden
            style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 8 }}
          />

          <Box style={{ minWidth: 0, flex: 1 }}>
            <Box className="rail-workspace__name" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Box component="span" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {active?.name ?? t("nav.activeWorkspace")}
              </Box>
              <ChevronDown size={13} style={{ flexShrink: 0, color: "var(--muted)" }} />
            </Box>

            {/* The reference puts a member count here, which nothing on the
                client knows without another request. The caller's own role is
                already on the workspace and answers a question they are more
                likely to have: what am I allowed to do in here. */}
            {active?.role && (
              <Box className="rail-workspace__meta" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Users size={11} />
                {t(`roles.${active.role}`, active.role)}
              </Box>
            )}
          </Box>
        </UnstyledButton>
      </Menu.Target>

      <WorkspaceMenuItems />
    </Menu>
  );
}
