import { useEffect, useRef } from "react";
import { Tooltip, UnstyledButton } from "@mantine/core";
import { Check, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Workspace } from "@/shared/types";
import { WorkspaceMark } from "./WorkspaceMark";
import { roleLabel } from "./format";
import classes from "./Workspaces.module.css";

interface Props {
  workspaces: Workspace[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

/**
 * Every workspace as a tab in one scrollable strip. Picking one makes it the
 * current workspace — the one every other page reads from.
 */
export function WorkspaceSwitcher({ workspaces, activeId, onSelect, onCreate }: Props) {
  const { t } = useTranslation();
  const activeRef = useRef<HTMLButtonElement>(null);

  // Keep the current workspace in view when the strip overflows.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeId]);

  return (
    <nav className={classes.switcher} aria-label={t("workspaces.switchLabel", "Switch workspace")}>
      <div className={classes.switcherTrack}>
        {workspaces.map((w) => {
          const isActive = w._id === activeId;
          const sites = w.billing?.sites.used ?? 0;
          return (
            <UnstyledButton
              key={w._id}
              ref={isActive ? activeRef : undefined}
              className={classes.tab}
              data-active={isActive || undefined}
              aria-current={isActive ? "true" : undefined}
              onClick={() => onSelect(w._id)}
            >
              <WorkspaceMark name={w.name} />
              <span className={classes.tabText}>
                <span className={classes.tabName}>{w.name}</span>
                <span className={classes.tabMeta}>
                  {w.billing?.plan?.name ?? roleLabel(w.role)}
                  {" · "}
                  {t("workspaces.siteCount", { count: sites, defaultValue_one: "{{count}} site", defaultValue_other: "{{count}} sites" })}
                </span>
              </span>
              {isActive && (
                <span className={classes.tabCheck}>
                  <Check size={11} strokeWidth={3} />
                </span>
              )}
            </UnstyledButton>
          );
        })}
      </div>
      <Tooltip label={t("workspaces.newWorkspace")} withArrow>
        <UnstyledButton className={classes.tabNew} onClick={onCreate} aria-label={t("workspaces.newWorkspace")}>
          <Plus size={16} />
        </UnstyledButton>
      </Tooltip>
    </nav>
  );
}
