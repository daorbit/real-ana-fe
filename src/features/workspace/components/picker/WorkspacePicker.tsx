import { useMemo, useState } from "react";
import { Button, TextInput } from "@mantine/core";
import { LogOut, Search } from "lucide-react";
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
const SEARCH_FROM = 9;
const NO_IDS: string[] = [];

export default function WorkspacePicker() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const { workspaces } = useWorkspace();
  const { picked, pickingId, pick } = usePickTransition();
  const [query, setQuery] = useState("");
  const [lastId] = useState(readLastWorkspace);

  const ordered = useMemo(() => lastUsedFirst(workspaces, lastId), [workspaces, lastId]);
  const ids = useMemo(() => ordered.map((w) => w._id), [ordered]);
  usePickerShortcuts(picked ? NO_IDS : ids, pick);

  const q = query.trim().toLowerCase();
  const shown = useMemo(
    () =>
      ordered
        .map((w, index) => ({ w, index }))
        .filter(({ w }) => !q || w.name.toLowerCase().includes(q)),
    [ordered, q],
  );

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

        {workspaces.length >= SEARCH_FROM && (
          <TextInput
            className={classes.search}
            radius="xl"
            leftSection={<Search size={15} />}
            placeholder={t("workspaces.picker.search")}
            aria-label={t("workspaces.picker.search")}
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
        )}

        <div className={classes.grid}>
          {shown.map(({ w }) => (
            <WorkspaceTile
              key={w._id}
              name={w.name}
              icon={w.icon}
              lastUsed={w._id === lastId}
              picking={w._id === pickingId}
              onClick={() => pick(w._id)}
            />
          ))}
          {!q && (
            <NewWorkspaceTile
              label={t("workspaces.newWorkspace")}
              onClick={() => nav(NEW_WORKSPACE_PATH)}
            />
          )}
        </div>

        {q && shown.length === 0 && (
          <p className={classes.empty}>{t("workspaces.picker.noMatch", { query: query.trim() })}</p>
        )}
      </main>
    </div>
  );
}
