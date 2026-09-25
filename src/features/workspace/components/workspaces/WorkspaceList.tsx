import { useState } from "react";
import { Box, TextInput, UnstyledButton } from "@mantine/core";
import { Plus, Search } from "lucide-react";
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

/** Past this many, the list gets a filter. */
const FILTER_FROM = 7;

export function WorkspaceList({ workspaces, activeId, marks, onSelect, onCreate }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const shown = q ? workspaces.filter((w) => w.name.toLowerCase().includes(q)) : workspaces;

  return (
    <Box component="nav" className={classes.list} aria-label={t("workspaces.title")}>
      <Box className={classes.listHead}>
        <span className={classes.listTitle}>{t("workspaces.yours", "Your workspaces")}</span>
        <span className={classes.listCount}>{workspaces.length}</span>
      </Box>

      {workspaces.length >= FILTER_FROM && (
        <TextInput
          size="xs"
          className={classes.listFilter}
          placeholder={t("workspaces.findWorkspace", "Find a workspace")}
          leftSection={<Search size={13} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          aria-label={t("workspaces.findWorkspace", "Find a workspace")}
        />
      )}

      <Box className={classes.listItems}>
        {shown.map((w) => {
          const isActive = w._id === activeId;
          const plan = w.billing?.plan?.name;
          const paid = Boolean(plan && plan.toLowerCase() !== "free");
          return (
            <UnstyledButton
              key={w._id}
              className={classes.item}
              data-active={isActive || undefined}
              aria-current={isActive ? "true" : undefined}
              onClick={() => onSelect(w._id)}
              style={{ ["--mark" as string]: marks.get(w._id) }}
            >
              <WorkspaceMark name={w.name} color={marks.get(w._id)} />
              <Box className={classes.itemText}>
                <div className={classes.itemName}>{w.name}</div>
                <div className={classes.itemMeta}>{roleLabel(w.role)}</div>
              </Box>
              {plan && (
                <span className={classes.planPill} data-paid={paid || undefined}>
                  {plan}
                </span>
              )}
            </UnstyledButton>
          );
        })}

        <UnstyledButton className={classes.newItem} onClick={onCreate}>
          <span className={classes.newIcon}>
            <Plus size={14} />
          </span>
          {t("workspaces.newWorkspace")}
        </UnstyledButton>
      </Box>
    </Box>
  );
}
