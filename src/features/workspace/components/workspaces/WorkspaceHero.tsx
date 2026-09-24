import { useState } from "react";
import {
  ActionIcon, Box, Button, CopyButton, Group, Menu, TextInput, Tooltip, UnstyledButton,
} from "@mantine/core";
import { Check, Copy, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { shortDate } from "@/shared/lib";
import type { Workspace } from "@/shared/types";
import { WorkspaceMark } from "./WorkspaceMark";
import { roleLabel } from "./format";
import classes from "./Workspaces.module.css";

interface Props {
  workspace: Workspace;
  mark?: string;
  canEdit: boolean;
  canAdmin: boolean;
  canDelete: boolean;
  validateName: (name: string) => string | null;
  onRename: (name: string) => Promise<boolean>;
  renaming: boolean;
  onAddSite: () => void;
  onDelete: () => void;
}

export function WorkspaceHero({
  workspace,
  mark,
  canEdit,
  canAdmin,
  canDelete,
  validateName,
  onRename,
  renaming,
  onAddSite,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const error = editing ? validateName(name) : null;

  const startEditing = () => {
    setName(workspace.name);
    setEditing(true);
  };

  const save = async () => {
    if (error) return;
    if (await onRename(name)) setEditing(false);
  };

  return (
    <Box component="section" className={classes.card}>
      <Box className={classes.heroBody}>
        <WorkspaceMark src={mark} size="lg" />

        <Box className={classes.heroText}>
          {editing ? (
            <Group gap="xs" wrap="nowrap">
              <TextInput
                value={name}
                error={name ? error : null}
                onChange={(e) => setName(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void save();
                  if (e.key === "Escape") setEditing(false);
                }}
                w={280}
                autoFocus
                aria-label={t("workspaces.nameLabel")}
              />
              <ActionIcon
                variant="filled"
                size="lg"
                onClick={() => void save()}
                loading={renaming}
                disabled={!!error}
                aria-label={t("common.saveShort")}
              >
                <Check size={16} />
              </ActionIcon>
              <ActionIcon
                variant="default"
                size="lg"
                onClick={() => setEditing(false)}
                aria-label={t("common.cancel")}
              >
                <X size={16} />
              </ActionIcon>
            </Group>
          ) : (
            <h2 className={classes.heroName} title={workspace.name}>
              {workspace.name}
            </h2>
          )}

          <Box className={classes.heroMeta}>
            <span className={classes.metaItem}>{roleLabel(workspace.role)}</span>
            {workspace.billing?.plan?.name && (
              <span className={classes.metaItem}>{workspace.billing.plan.name} plan</span>
            )}
            <span className={classes.metaItem}>
              {t("workspaces.statCreated")} {shortDate(workspace.createdAt)}
            </span>
            <CopyButton value={workspace._id} timeout={1600}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? t("workspaces.copied") : t("workspaces.copyId", "Copy workspace ID")} withArrow>
                  <UnstyledButton className={`${classes.metaItem} ${classes.idButton}`} onClick={copy}>
                    ID {workspace._id.slice(-8)}
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                  </UnstyledButton>
                </Tooltip>
              )}
            </CopyButton>
          </Box>
        </Box>

        <Box className={classes.heroActions}>
          {canEdit && (
            <Button leftSection={<Plus size={15} />} onClick={onAddSite}>
              {t("workspaces.addSite")}
            </Button>
          )}
          {(canAdmin || canDelete) && (
            <Menu position="bottom-end" withinPortal shadow="md" width={210}>
              <Menu.Target>
                <ActionIcon variant="default" size="lg" aria-label={t("workspaces.moreActions", "More actions")}>
                  <MoreHorizontal size={17} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {canAdmin && (
                  <Menu.Item leftSection={<Pencil size={14} />} onClick={startEditing}>
                    {t("workspaces.rename")}
                  </Menu.Item>
                )}
                <Menu.Item
                  leftSection={<Copy size={14} />}
                  onClick={() => void navigator.clipboard.writeText(workspace._id)}
                >
                  {t("workspaces.copyId", "Copy workspace ID")}
                </Menu.Item>
                {canDelete && (
                  <>
                    <Menu.Divider />
                    <Menu.Item className="danger-item" color="red" leftSection={<Trash2 size={14} />} onClick={onDelete}>
                      {t("workspaces.deleteWorkspace")}
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
          )}
        </Box>
      </Box>
    </Box>
  );
}
