import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { api, useCheckSearchIndexingMutation } from "@/app/store";
import { useDemo } from "@/features/demo/context";
import { notify, notifyError } from "@/shared/lib/notify";
import { useSearchUpgrade } from "./useSearchEntitlements";

const BATCH = 10;

export type IndexCheckProgress = { done: number; total: number };

export function useIndexCheckRun(workspaceId: string, siteId: string) {
  const dispatch = useDispatch();
  const { demo } = useDemo();
  const { prompt } = useSearchUpgrade();
  const [check] = useCheckSearchIndexingMutation();
  const [progress, setProgress] = useState<IndexCheckProgress | null>(null);
  const stopped = useRef(false);

  useEffect(
    () => () => {
      stopped.current = true;
    },
    [],
  );

  const run = async (total: number) => {
    if (demo) return notify.error("Turn off demo data to make changes.");
    stopped.current = false;
    let done = 0;
    setProgress({ done, total });
    try {
      while (done < total && !stopped.current) {
        const result = await check({ workspaceId, siteId, count: Math.min(BATCH, total - done) }).unwrap();
        done += result.checks.length;
        setProgress({ done, total });
        if (result.outOfChecks && result.stopped) {
          prompt(result.stopped);
          break;
        }
        if (result.stopped) {
          notify.error(result.stopped);
          break;
        }
        if (!result.checks.length || !result.remaining) break;
      }
      if (done) notify.success(`${done} page${done === 1 ? "" : "s"} checked with Google`);
    } catch (e) {
      notifyError(e, "Pages could not be checked with Google.");
    } finally {
      setProgress(null);
      if (done) dispatch(api.util.invalidateTags([{ type: "Workspace", id: workspaceId }, "Usage"]));
    }
  };

  return {
    run,
    progress,
    stop: () => {
      stopped.current = true;
    },
  };
}
