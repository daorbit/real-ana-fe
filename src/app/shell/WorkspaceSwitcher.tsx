import { Menu, Select, Tooltip, UnstyledButton } from "@mantine/core";
import { Check, ChevronsUpDown, FolderKanban } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWorkspace } from "@/features/workspace/context";

/**
 * Which workspace everything on screen belongs to.
 *
 * Collapsed it becomes a menu hung off an icon: a Select cannot shrink to 44px
 * and still be a control someone can read the current value from, so the
 * tooltip names the active workspace and the menu lists the rest.
 */
export function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation();
  const { workspaces, active, setActive } = useWorkspace();

  if (workspaces.length === 0) return null;

  if (!collapsed) {
    return (
      <Select
        size="sm"
        radius="md"
        data={workspaces.map((w) => ({ value: w._id, label: w.name }))}
        value={active?._id ?? null}
        onChange={(v) => v && setActive(v)}
        allowDeselect={false}
        comboboxProps={{ withinPortal: true, radius: "md" }}
        leftSection={<FolderKanban size={15} />}
        rightSection={<ChevronsUpDown size={14} />}
        aria-label={t("nav.activeWorkspace")}
      />
    );
  }

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
    </Menu>
  );
}
