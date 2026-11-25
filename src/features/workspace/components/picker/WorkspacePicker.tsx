import { useMemo, useState } from "react";
import { Button } from "@mantine/core";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/context";
import { useWorkspace } from "@/features/workspace/context";
import { readLastWorkspace } from "@/features/workspace/lib/storedWorkspace";
import { Wordmark } from "@/shared/ui/Brand";
import { WorkspaceTile } from "./WorkspaceTile";
import { NewWorkspaceTile } from "./NewWorkspaceTile";
import { PickerProfile } from "./PickerProfile";
import { PickerHandoff } from "./PickerHandoff";
import { lastUsedFirst } from "./orderWorkspaces";
import { usePickTransition } from "./usePickTransition";
import { usePickerShortcuts } from "./usePickerShortcuts";
import classes from "./WorkspacePicker.module.css";

const NEW_WORKSPACE_PATH = "/app/onboarding?mode=workspace";
const NO_IDS: string[] = [];

export default function WorkspacePicker() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const { workspaces } = useWorkspace();
  const { picked, pickingId, pick } = usePickTransition();
  const [lastId] = useState(readLastWorkspace);

  const ordered = useMemo(() => lastUsedFirst(workspaces, lastId), [workspaces, lastId]);
  const ids = useMemo(() => ordered.map((w) => w._id), [ordered]);
  usePickerShortcuts(picked ? NO_IDS : ids, pick);

  if (picked) {
    return (
      <div className={classes.screen}>
        <PickerHandoff workspace={picked} />
      </div>
    );
  }

  return (
    <div className={classes.screen}>
      <header className={classes.top}>
        <Wordmark />
        {user?.email && (
          <div className={classes.account}>
            <span className={classes.email}>{user.email}</span>
            <Button
              variant="subtle"
              color="red"
              size="xs"
              radius="xl"
              leftSection={<LogOut size={14} />}
              onClick={logout}
            >
              {t("workspaces.picker.signOut")}
            </Button>
          </div>
        )}
      </header>

      <main className={classes.center}>
        <PickerProfile />
        <h1 className={classes.title}>{t("workspaces.picker.title")}</h1>

        <div className={classes.grid}>
          {ordered.map((w) => (
            <WorkspaceTile
              key={w._id}
              name={w.name}
              icon={w.icon}
              lastUsed={w._id === lastId}
              picking={w._id === pickingId}
              onClick={() => pick(w._id)}
            />
          ))}
          <NewWorkspaceTile
            label={t("workspaces.newWorkspace")}
            onClick={() => nav(NEW_WORKSPACE_PATH)}
          />
        </div>
      </main>
    </div>
  );
}
