import { UnstyledButton } from "@mantine/core";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import classes from "./Workspaces.module.css";

export function NewWorkspaceTile({ onCreate }: { onCreate: () => void }) {
  const { t } = useTranslation();
  return (
    <UnstyledButton className={classes.newCard} onClick={onCreate}>
      <span className={classes.newIcon}>
        <Plus size={20} />
      </span>
      <span className={classes.newLabel}>{t("workspaces.newWorkspace")}</span>
      <span className={classes.newHint}>{t("workspaces.newWorkspaceHint", "Track another website")}</span>
    </UnstyledButton>
  );
}
