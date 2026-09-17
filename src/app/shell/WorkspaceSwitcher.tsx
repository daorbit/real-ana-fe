import { ActionIcon, Menu, Tooltip, UnstyledButton } from "@mantine/core";
import { Check, FolderKanban } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWorkspace } from "@/features/workspace/context";

/**
 * Which workspace everything on screen belongs to, as a rail-width icon row.
 *
 * Only for the states where the plan row that normally carries the switch is
 * not drawn — a collapsed rail, or a demo session. The tooltip names the
 * active workspace, since at this width nothing on screen does.
 */
export function WorkspaceSwitcher() {
  const { t } = useTranslation();
  const { workspaces, active } = useWorkspace();

  if (workspaces.length === 0) return null;

  return (
    <Menu position="right-start" withArrow radius="md" width={220} withinPortal zIndex={400}>
      <Menu.Target>
        <Tooltip
          label={active?.name ?? t("nav.activeWorkspace")}
          position="right"
          withArrow
          openDelay={200}
        >
          <UnstyledButton
            className="nav-link"
            data-collapsed
            aria-label={t("nav.activeWorkspace")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              padding: "8px 10px",
              color: "var(--text-2)",
            }}
          >
            <FolderKanban size={17} />
          </UnstyledButton>
        </Tooltip>
      </Menu.Target>

      <WorkspaceMenuItems />
    </Menu>
  );
}

/**
 * The list itself, shared by every way into it — the collapsed rail icon and
 * the button on the plan row open the same menu, so switching workspace looks
 * the same wherever it was reached from.
 */
function WorkspaceMenuItems() {
  const { t } = useTranslation();
  const { workspaces, active, setActive } = useWorkspace();

  return (
    <Menu.Dropdown>
      <Menu.Label>{t("nav.activeWorkspace")}</Menu.Label>
      {workspaces.map((w) => (
        <Menu.Item
          key={w._id}
          onClick={() => setActive(w._id)}
          leftSection={<FolderKanban size={15} />}
          // The current one is marked rather than omitted: a list that
          // silently drops where you are makes you count to find out.
          rightSection={
            w._id === active?._id
              ? <Check size={14} style={{ color: "var(--accent-2)" }} />
              : null
          }
        >
          {w.name}
        </Menu.Item>
      ))}
    </Menu.Dropdown>
  );
}

/**
 * The workspace switch as a bare icon, for the plan row.
 *
 * The rail used to spend a full-width Select on this near the top. It is a
 * control reached occasionally — once at the start of a session, if at all —
 * so it sits beside the other occasional switches instead, and the workspace
 * it points at is named in its tooltip rather than on screen at all times.
 */
export function WorkspaceMenuButton() {
  const { t } = useTranslation();
  const { workspaces, active } = useWorkspace();

  if (workspaces.length === 0) return null;

  const label = t("nav.activeWorkspace");

  return (
    <Menu position="top-end" withArrow radius="md" width={220} withinPortal zIndex={400}>
      <Menu.Target>
        <Tooltip label={active?.name ? `${label}: ${active.name}` : label} withArrow position="top">
          <ActionIcon variant="subtle" color="gray" size="sm" aria-label={label}>
            <FolderKanban size={14} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <WorkspaceMenuItems />
    </Menu>
  );
}
