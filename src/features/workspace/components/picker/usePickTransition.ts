import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/app/store";
import { prefetchWorkspaceData } from "@/app/bootPrefetch";
import { withViewTransition } from "@/app/viewTransition";
import { useWorkspace } from "@/features/workspace/context";
import { readThemePrefs } from "@/shared/lib/theme";
import type { Workspace } from "@/shared/types";

const TRANSITION_MS = 1000;
const REDUCED_MS = 250;
const PICK_TRANSITION_KIND = "workspace";

function motionOff(): boolean {
  const osReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  return osReduced || !readThemePrefs().motion;
}

export function usePickTransition() {
  const dispatch = useDispatch<AppDispatch>();
  const { workspaces, setActive } = useWorkspace();
  const [picked, setPicked] = useState<Workspace | null>(null);
  const [pickingId, setPickingId] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pick = useCallback(
    (id: string) => {
      const workspace = workspaces.find((w) => w._id === id);
      if (!workspace || timer.current !== undefined) return;
      prefetchWorkspaceData(dispatch, id, window.location.pathname);
      timer.current = window.setTimeout(() => setActive(id), motionOff() ? REDUCED_MS : TRANSITION_MS);
      flushSync(() => setPickingId(id));
      withViewTransition(PICK_TRANSITION_KIND, () => setPicked(workspace));
    },
    [workspaces, dispatch, setActive],
  );

  return { picked, pickingId, pick };
}
