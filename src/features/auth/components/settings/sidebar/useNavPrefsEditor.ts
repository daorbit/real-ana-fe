import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  api,
  useClearNavLinkLogoMutation,
  useSaveNavPrefsMutation,
  useUploadNavLinkLogoMutation,
  type AppDispatch,
} from "@/app/store";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { useDemo } from "@/features/demo/context";
import { useNavPrefs, type NavPrefs } from "@/app/shell/navPrefs";
import { notify, errMessage } from "@/shared/lib/notify";

const SAVE_DELAY = 500;

export function useNavPrefsEditor() {
  const dispatch = useDispatch<AppDispatch>();
  const { active } = useWorkspace();
  const { canAdmin } = usePermissions();
  const { demo } = useDemo();
  const prefs = useNavPrefs();
  const workspaceId = active?._id;
  const [save] = useSaveNavPrefsMutation();
  const [upload] = useUploadNavLinkLogoMutation();
  const [clear] = useClearNavLinkLogoMutation();

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<{ workspaceId: string; navPrefs: NavPrefs } | null>(null);

  const writeCache = useCallback(
    (id: string, next: NavPrefs | null) => {
      dispatch(
        api.util.updateQueryData("getWorkspaces", undefined, (draft) => {
          const ws = draft.find((w) => w._id === id);
          if (ws) ws.navPrefs = next;
        }),
      );
    },
    [dispatch],
  );

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const job = pending.current;
    pending.current = null;
    if (!job) return;
    try {
      const { navPrefs } = await save(job).unwrap();
      if (!pending.current) writeCache(job.workspaceId, navPrefs);
    } catch (e) {
      notify.error(errMessage(e, "Couldn't save your sidebar."));
      dispatch(api.util.invalidateTags([{ type: "Workspace", id: job.workspaceId }]));
    }
  }, [save, writeCache, dispatch]);

  useEffect(() => () => void flush(), [flush]);

  const editable = canAdmin && !demo && Boolean(workspaceId);

  const apply = useCallback(
    (next: NavPrefs) => {
      if (!workspaceId || !editable) return;
      writeCache(workspaceId, next);
      pending.current = { workspaceId, navPrefs: next };
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), SAVE_DELAY);
    },
    [workspaceId, editable, writeCache, flush],
  );

  const setLogo = useCallback(
    async (linkId: string, file: string | null) => {
      if (!workspaceId) return;
      await flush();
      if (file) await upload({ workspaceId, linkId, file }).unwrap();
      else await clear({ workspaceId, linkId }).unwrap();
    },
    [workspaceId, flush, upload, clear],
  );

  return { prefs, editable, apply, flush, setLogo };
}

export type NavPrefsEditor = ReturnType<typeof useNavPrefsEditor>;
