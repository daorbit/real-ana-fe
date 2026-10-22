import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ConnectionGroup } from "@/features/auth/components/settings/ConnectionGroup";
import type { WorkspaceAppId } from "@/shared/types";
import type { useQuantalogApps } from "../../hooks/useQuantalogApps";
import { CATEGORY_HINT, CATEGORY_TITLE } from "../../lib/catalog";
import { matchesFilter, type ConnectionFilter } from "../../lib/filter";
import { WORKSPACE_APP_INFO } from "../../lib/quantalogApps";
import { IntegrationTileCard } from "../IntegrationTileCard";
import { QuantalogAppModal } from "./QuantalogAppModal";

interface Props {
  quantalogApps: ReturnType<typeof useQuantalogApps>;
  filter: ConnectionFilter;
}

export function QuantalogAppsConnection({ quantalogApps, filter }: Props) {
  const [params, setParams] = useSearchParams();
  const [openId, setOpenId] = useState<WorkspaceAppId | null>(null);
  const requested = params.get("app");

  useEffect(() => {
    const match = quantalogApps.items.find((item) => item.info.tileId === requested);
    if (!match) return;
    setOpenId(match.info.id);
    const next = new URLSearchParams(params);
    next.delete("app");
    setParams(next, { replace: true });
  }, [requested, quantalogApps.items, params, setParams]);

  const visible = quantalogApps.items.filter((item) => matchesFilter(item.entry, filter));

  const cards = visible.map((item) => (
    <IntegrationTileCard key={item.tile.id} tile={item.tile} onOpen={() => setOpenId(item.info.id)} />
  ));

  return (
    <>
      {visible.length > 0 && (
        <ConnectionGroup title={CATEGORY_TITLE.quantalog} hint={CATEGORY_HINT.quantalog}>
          {cards}
        </ConnectionGroup>
      )}
      {openId && (
        <QuantalogAppModal info={WORKSPACE_APP_INFO[openId]} opened onClose={() => setOpenId(null)} />
      )}
    </>
  );
}
