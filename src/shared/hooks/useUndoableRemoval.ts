import { useCallback, useState, type ReactNode } from "react";
import { notify, notifyError } from "@/shared/lib/notify";

const NONE: ReadonlySet<string> = new Set();

export function useUndoableRemoval() {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(NONE);

  const setHiddenIds = useCallback((ids: string[], hide: boolean) => {
    setHidden((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (hide) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);

  const remove = useCallback(
    ({
      ids,
      message,
      commit,
      errorMessage,
    }: {
      ids: string[];
      message: ReactNode;
      commit: () => Promise<unknown>;
      errorMessage: string;
    }) => {
      if (!ids.length) return;
      setHiddenIds(ids, true);
      notify.undo({
        message,
        onUndo: () => setHiddenIds(ids, false),
        onCommit: async () => {
          try {
            await commit();
          } catch (e) {
            setHiddenIds(ids, false);
            notifyError(e, errorMessage);
          }
        },
      });
    },
    [setHiddenIds],
  );

  return { hidden, remove };
}
