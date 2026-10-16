import { useMemo } from "react";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { CATEGORY_TITLE } from "../lib/catalog";
import { tileState, type Searchable } from "../lib/filter";
import { quantalogAppTiles } from "../lib/quantalogApps";

export function useQuantalogApps() {
  const apps = useWorkspaceApps();
  const items = useMemo(
    () =>
      quantalogAppTiles(apps).map(({ info, tile }) => ({
        info,
        tile,
        entry: { name: tile.name, description: tile.description, group: CATEGORY_TITLE.quantalog, state: tileState(tile) } as Searchable,
      })),
    [apps],
  );
  const entries = useMemo(() => items.map((item) => item.entry), [items]);
  return { items, entries };
}
