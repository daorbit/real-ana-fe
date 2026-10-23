import { Button } from "@mantine/core";
import { FolderKanban, LogOut, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/context";
import { useWorkspace } from "@/features/workspace/context";
import { Wordmark } from "@/shared/ui/Brand";
import type { Workspace } from "@/shared/types";
import { WorkspaceTile } from "./WorkspaceTile";
import classes from "./WorkspacePicker.module.css";

const NEW_WORKSPACE_PATH = "/app/onboarding?mode=workspace";

export default function WorkspacePicker() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const { workspaces, setActive } = useWorkspace();

  const metaFor = (w: Workspace) =>
    [w.billing?.plan.name, t(`workspaces.picker.role.${w.role}`)].filter(Boolean).join(" · ");

  return (
    <div className={classes.screen}>
      <header className={classes.top}>
        <Wordmark />
      </header>

      <main className={classes.center}>
        <h1 className={classes.title}>{t("workspaces.picker.title")}</h1>
        <p className={classes.subtitle}>{t("workspaces.picker.subtitle")}</p>

        <div className={classes.grid}>
          {workspaces.map((w) => (
            <WorkspaceTile
              key={w._id}
              icon={FolderKanban}
              name={w.name}
              meta={metaFor(w)}
              onClick={() => setActive(w._id)}
            />
          ))}
          <WorkspaceTile
            icon={Plus}
            variant="add"
            name={t("workspaces.newWorkspace")}
            onClick={() => nav(NEW_WORKSPACE_PATH)}
          />
        </div>

        {user?.email && (
          <div className={classes.account}>
            <span className={classes.email}>{user.email}</span>
            <Button
              variant="default"
              radius="xl"
              size="sm"
              leftSection={<LogOut size={15} />}
              onClick={logout}
            >
              {t("workspaces.picker.signOut")}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
