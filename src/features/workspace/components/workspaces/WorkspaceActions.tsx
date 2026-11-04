import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ActionIcon, Button, Menu, Modal, TextInput } from "@mantine/core";
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Workspace } from "@/shared/types";
import classes from "./Workspaces.module.css";

interface Props {
  workspace: Workspace;
  canAdmin: boolean;
  canDelete: boolean;
  validateName: (name: string) => string | null;
  onRename: (name: string) => Promise<boolean>;
  renaming: boolean;
  onDelete: () => void;
}

export function WorkspaceActions({
  workspace,
  canAdmin,
  canDelete,
  validateName,
  onRename,
  renaming,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const error = editing ? validateName(name) : null;

  const startEditing = () => {
    setName(workspace.name);
    setEditing(true);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (error) return;
    if (await onRename(name)) setEditing(false);
  };

  return (
    <>
      <Button variant="default" radius="xl" leftSection={<Users size={15} />} onClick={() => nav("/app/members")}>
        {t("workspaces.members")}
      </Button>

      {(canAdmin || canDelete) && (
        <Menu position="bottom-end" withinPortal shadow="md" width={210}>
          <Menu.Target>
            <ActionIcon variant="default" radius="xl" size={36} aria-label={t("workspaces.moreActions", "More actions")}>
              <MoreHorizontal size={17} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {canAdmin && (
              <Menu.Item leftSection={<Pencil size={14} />} onClick={startEditing}>
                {t("workspaces.rename")}
              </Menu.Item>
            )}
            {canAdmin && canDelete && <Menu.Divider />}
            {canDelete && (
              <Menu.Item className="danger-item" color="red" leftSection={<Trash2 size={14} />} onClick={onDelete}>
                {t("workspaces.deleteWorkspace")}
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      )}

      <Modal opened={editing} onClose={() => setEditing(false)} title={t("workspaces.rename")} size={400}>
        <form onSubmit={(e) => void save(e)}>
          <TextInput
            data-autofocus
            label={t("workspaces.nameLabel")}
            value={name}
            error={name ? error : null}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <div className={classes.renameActions}>
            <Button variant="default" radius="xl" onClick={() => setEditing(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" radius="xl" loading={renaming} disabled={!!error}>
              {t("common.saveShort")}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
