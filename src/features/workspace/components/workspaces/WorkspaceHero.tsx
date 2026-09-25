import { useState } from "react";
import {
  ActionIcon, Box, Button, CopyButton, Group, Menu, TextInput, Tooltip, UnstyledButton,
} from "@mantine/core";
import {
  CalendarDays, Check, Copy, Crown, MoreHorizontal, Pencil, Plus, ShieldCheck, Trash2, UserRound, X,
} from "lucide-react";
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

  const RoleIcon = workspace.role === "owner" ? Crown : workspace.role === "admin" ? ShieldCheck : UserRound;
  const plan = workspace.billing?.plan?.name;
  const paid = Boolean(plan && plan.toLowerCase() !== "free");

  return (
    <Box
      component="section"
      className={`${classes.card} ${classes.hero}`}
      style={mark ? { ["--mark" as string]: mark } : undefined}
    >
      {/* A soft wash of the workspace's own colour along the top. */}
      <div className={classes.heroCover} aria-hidden />
      <Box className={classes.heroBody}>
        <WorkspaceMark name={workspace.name} color={mark} size="lg" />

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
            <div className={classes.heroTitleRow}>
              <h2 className={classes.heroName} title={workspace.name}>
                {workspace.name}
              </h2>
              {plan && (
                <span className={classes.planPill} data-paid={paid || undefined}>
                  {plan}
                </span>
              )}
            </div>
          )}

          <Box className={classes.heroMeta}>
            <span className={classes.chip}>
              <RoleIcon size={12} />
              {roleLabel(workspace.role)}
            </span>
            <span className={classes.chip}>
              <CalendarDays size={12} />
              {t("workspaces.statCreated")} {shortDate(workspace.createdAt)}
            </span>
            <CopyButton value={workspace._id} timeout={1600}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? t("workspaces.copied") : t("workspaces.copyId", "Copy workspace ID")} withArrow>
                  <UnstyledButton className={`${classes.chip} ${classes.idButton}`} onClick={copy}>
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
