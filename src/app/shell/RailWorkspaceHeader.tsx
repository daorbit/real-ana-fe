import { Box, Menu, UnstyledButton } from "@mantine/core";
import { ChevronDown, FolderPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWorkspace, useActiveBilling } from "@/features/workspace/context";
import { PlanIcon } from "@/features/billing/components/PlanIcons";
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
  const billing = useActiveBilling();

  if (collapsed) return null;

  // Nothing to switch between yet — the menu below needs at least one
  // workspace to open onto, so this stands in its place until one exists,
  // rather than leaving a blank gap at the top of the rail.
  if (workspaces.length === 0) {
    return (
      <UnstyledButton
        component={Link}
        to="/app/onboarding"
        className="rail-workspace"
        aria-label={t("nav.createWorkspace", "Create a workspace")}
      >
        <Box
          style={{
            width: 34,
            height: 34,
            flexShrink: 0,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--surface-2)",
            color: "var(--muted)",
          }}
        >
          <FolderPlus size={16} />
        </Box>

        <Box style={{ minWidth: 0, flex: 1 }}>
          <Box className="rail-workspace__name">
            {t("nav.createWorkspace", "Create a workspace")}
          </Box>
          <Box className="rail-workspace__meta">
            {t("nav.createWorkspaceHint", "Get started")}
          </Box>
        </Box>
      </UnstyledButton>
    );
  }

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

            {/* The plan, not the role: which tier this workspace is on decides
                what the app will actually let you do, and it used to need a
                card of its own at the foot of the rail to say so. */}
            {billing?.plan && (
              <Box className="rail-workspace__meta" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <PlanIcon slug={billing.plan.slug} size={12} uid="rail-header" />
                {t("nav.planName", "{{plan}} plan", { plan: billing.plan.name })}
              </Box>
            )}
          </Box>
        </UnstyledButton>
      </Menu.Target>

      <WorkspaceMenuItems />
    </Menu>
  );
}
