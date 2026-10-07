import { useContext, useEffect } from "react";
import { RailAutoCollapseContext } from "@/app/shell/ShellContext";
import { LEAD_FORMS_BASE } from "./themeParams";

const EDITOR = "quantalog:editor-open";

export function useFrameRailCollapse() {
  const setAutoCollapsed = useContext(RailAutoCollapseContext);

  useEffect(() => {
    const formsOrigin = new URL(LEAD_FORMS_BASE, window.location.href).origin;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== formsOrigin) return;
      const data = event.data as { type?: unknown; open?: unknown } | null;
      if (data?.type !== EDITOR || typeof data.open !== "boolean") return;
      setAutoCollapsed(data.open);
    };
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      setAutoCollapsed(false);
    };
  }, [setAutoCollapsed]);
}
