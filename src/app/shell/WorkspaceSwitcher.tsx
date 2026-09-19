import { ActionIcon, Menu, Tooltip, UnstyledButton } from "@mantine/core";
import { Check, FolderKanban, Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWorkspace } from "@/features/workspace/context";
import { useAuth } from "@/features/auth/context";

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
export function WorkspaceMenuItems() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { user } = useAuth();
  const { workspaces, active, setActive, refresh } = useWorkspace();

  return (
    <Menu.Dropdown>
      {/* Whose workspaces these are. With several accounts in play the list
          alone does not say which login it belongs to. */}
      {user?.email && (
        <div className="ws-menu__account">
          <span className="ws-menu__email">{user.email}</span>
          <Tooltip label={t("common.refresh", "Refresh")} withArrow position="top">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              aria-label={t("common.refresh", "Refresh")}
              // Re-fetches the list in place. The menu stays open: this is for
              // when a workspace you were just given has not appeared yet, and
              // closing would hide the result you asked for.
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                refresh();
              }}
            >
              <RefreshCw size={14} />
            </ActionIcon>
          </Tooltip>
        </div>
      )}

      {workspaces.map((w, i) => (
        <Menu.Item
          key={w._id}
          onClick={() => setActive(w._id)}
          leftSection={<WorkspaceMark name={w.name} />}
          // The current one is marked rather than omitted: a list that
          // silently drops where you are makes you count to find out.
          rightSection={
            w._id === active?._id ? (
              <Check size={15} style={{ color: "var(--accent-2)" }} />
            ) : (
              // Only the first nine are reachable by number, so only those
              // advertise one.
              i < 9 && <span className="ws-menu__hint">Ctrl {i + 1}</span>
            )
          }
        >
          <span className={w._id === active?._id ? "ws-menu__name--active" : undefined}>
            {w.name}
          </span>
        </Menu.Item>
      ))}

      <Menu.Divider />

      {/* Creating one runs through the same onboarding steps a new signup
          gets — see the Workspaces page, which links to the same place. */}
      <Menu.Item
        leftSection={<Plus size={15} />}
        onClick={() => nav("/app/onboarding?mode=workspace")}
      >
        {t("workspaces.newWorkspace", "New workspace")}
      </Menu.Item>
    </Menu.Dropdown>
  );
}

/**
 * The square mark beside a workspace in the list.
 *
 * A workspace has no logo of its own, so this is its initial on a tile whose
 * colour is derived from the name — stable per workspace, and enough to tell
 * the rows apart at a glance without inventing branding for them.
 */
function WorkspaceMark({ name }: { name: string }) {
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

  return (
    <span
      aria-hidden
      className="ws-menu__mark"
      style={{ background: `hsl(${hue} 52% 46%)` }}
    >
      {(name || "?").slice(0, 1).toUpperCase()}
    </span>
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
