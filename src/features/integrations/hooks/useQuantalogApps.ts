import { useMemo } from "react";
import { useGetAppPricesQuery } from "@/app/store";
import { useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { useDemo } from "@/features/demo/context";
import { detectCurrency, formatMoney, getStoredCurrency } from "@/shared/lib/currency";
import type { WorkspaceAppId } from "@/shared/types";
import { CATEGORY_TITLE } from "../lib/catalog";
import { tileState, type Searchable } from "../lib/filter";
import { quantalogAppTiles } from "../lib/quantalogApps";
import { PAID_APP_IDS, appUnlocked } from "../lib/paidApps";

export function useQuantalogApps() {
  const apps = useWorkspaceApps();
  const { active } = useWorkspace();
  const { demo } = useDemo();
  const anyLocked = !demo && PAID_APP_IDS.some((id) => !appUnlocked(active?.apps, id));
  const { data: appPrices } = useGetAppPricesQuery(undefined, { skip: !anyLocked });

  const prices = useMemo(() => {
    const currency = getStoredCurrency() ?? detectCurrency();
    const labels: Partial<Record<WorkspaceAppId, string>> = {};
    for (const entry of appPrices ?? []) {
      if (!appUnlocked(active?.apps, entry.appId)) labels[entry.appId] = formatMoney(entry.price[currency], currency);
    }
    return labels;
  }, [appPrices, active?.apps]);

  const items = useMemo(
    () =>
      quantalogAppTiles(apps, prices).map(({ info, tile }) => ({
        info,
        tile,
        entry: { name: tile.name, description: tile.description, group: CATEGORY_TITLE.quantalog, state: tileState(tile) } as Searchable,
      })),
    [apps, prices],
  );
  const entries = useMemo(() => items.map((item) => item.entry), [items]);
  return { items, entries };
}
