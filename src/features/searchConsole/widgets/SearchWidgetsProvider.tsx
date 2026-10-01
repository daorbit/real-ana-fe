import { useMemo, type ReactNode } from "react";
import { useDispatch } from "react-redux";
import { api } from "@/app/store";
import { useSearchConsoleConnect } from "@/features/searchConsole/useSearchConsoleConnect";
import { SearchWidgetsContext } from "@/features/searchConsole/widgets/searchWidgetsContext";

export function SearchWidgetsProvider({ workspaceId, children }: { workspaceId: string | undefined; children: ReactNode }) {
  const dispatch = useDispatch();
  const { connect, connecting } = useSearchConsoleConnect(workspaceId, () =>
    dispatch(api.util.invalidateTags(["SearchConsole", "SearchPerformance"])),
  );
  const value = useMemo(() => ({ connect, connecting }), [connect, connecting]);

  return <SearchWidgetsContext.Provider value={value}>{children}</SearchWidgetsContext.Provider>;
}
