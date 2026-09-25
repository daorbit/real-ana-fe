import { ActionIcon, Box, Tooltip, UnstyledButton } from "@mantine/core";
import { Check, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Workspace } from "@/shared/types";
import { WorkspaceMark } from "./WorkspaceMark";
import { roleLabel } from "./format";
import classes from "./Workspaces.module.css";

interface Props {
  workspaces: Workspace[];
  activeId: string;
  marks: Map<string, string>;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export function WorkspaceList({ workspaces, activeId, marks, onSelect, onCreate }: Props) {
  const { t } = useTranslation();

  return (
    <Box component="nav" className={`${classes.card} ${classes.list}`} aria-label={t("workspaces.title")}>
      <Box className={classes.listHead}>
        <span className={classes.listTitle}>
          {t("workspaces.title")} · {workspaces.length}
        </span>
        <Tooltip label={t("workspaces.newWorkspace")} withArrow>
          <ActionIcon variant="subtle" color="gray" onClick={onCreate} aria-label={t("workspaces.newWorkspace")}>
            <Plus size={16} />
          </ActionIcon>
        </Tooltip>
      </Box>

      <Box className={classes.listItems}>
        {workspaces.map((w) => {
          const isActive = w._id === activeId;
          return (
            <UnstyledButton
              key={w._id}
              className={classes.item}
              data-active={isActive || undefined}
              aria-current={isActive ? "true" : undefined}
              onClick={() => onSelect(w._id)}
            >
              <WorkspaceMark color={marks.get(w._id)} />
              <Box className={classes.itemText}>
                <div className={classes.itemName}>{w.name}</div>
                <div className={classes.itemMeta}>
                  {roleLabel(w.role)}
                  {w.billing?.plan?.name ? ` · ${w.billing.plan.name}` : ""}
                </div>
              </Box>
              {isActive && <Check size={15} className={classes.itemCheck} />}
            </UnstyledButton>
          );
        })}
      </Box>
    </Box>
  );
}
