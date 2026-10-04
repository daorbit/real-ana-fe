import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ADD_SITE_PARAM, SNIPPET_PARAM } from "@/features/workspace/paths";

export function useWorkspacesDeepLink(ready: boolean, canEdit: boolean, openAddSite: () => void) {
  const [params, setParams] = useSearchParams();
  const wantsAddSite = params.get(ADD_SITE_PARAM) === "1";
  const focusedSiteId = params.get(SNIPPET_PARAM);
  const open = useRef(openAddSite);
  open.current = openAddSite;

  useEffect(() => {
    if (!ready || !wantsAddSite) return;
    if (canEdit) open.current();
    setParams(
      (prev) => {
        const out = new URLSearchParams(prev);
        out.delete(ADD_SITE_PARAM);
        return out;
      },
      { replace: true },
    );
  }, [ready, wantsAddSite, canEdit, setParams]);

  return focusedSiteId;
}
