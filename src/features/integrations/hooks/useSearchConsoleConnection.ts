import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query";
import { api, useDisconnectSearchConsoleMutation, useGetSearchConsoleStatusQuery } from "@/app/store";
import { useSearchConsoleConnect } from "@/features/searchConsole/useSearchConsoleConnect";
import { confirmDelete, errMessage, notify } from "@/shared/lib/notify";
import type { SearchConsoleStatus } from "@/shared/types";
import { CATEGORY_TITLE } from "../lib/catalog";
import { tileState, type Searchable } from "../lib/filter";
import type { IntegrationTile } from "../types";

export const SEARCH_CONSOLE_ID = "search-console";

function toTile(status: SearchConsoleStatus): IntegrationTile {
  const connection = status.connection;
  const active = Boolean(status.connected && connection?.status === "active");
  const linked = status.links.length;
  return {
    kind: "search-console",
    id: SEARCH_CONSOLE_ID,
    name: "Google Search Console",
    category: "search",
    description: "Search clicks, rankings and the queries people use, inside Search visibility.",
    connected: Boolean(connection),
    enabled: active,
    account: active
      ? `${connection?.googleEmail ?? "Connected"}${linked ? ` · ${linked} site${linked === 1 ? "" : "s"} linked` : ""}`
      : undefined,
  };
}

export function useSearchConsoleConnection(workspaceId: string | null) {
  const dispatch = useDispatch();
  const query = useGetSearchConsoleStatusQuery(workspaceId ?? skipToken);
  const status = query.currentData;
  const refresh = () => dispatch(api.util.invalidateTags(["SearchConsole", "SearchPerformance"]));
  const popup = useSearchConsoleConnect(workspaceId ?? undefined, refresh);
  const [disconnectMutation, disconnectState] = useDisconnectSearchConsoleMutation();

  const tile = useMemo(() => (status?.configured ? toTile(status) : null), [status]);
  const entry = useMemo<Searchable | null>(
    () =>
      tile
        ? { name: tile.name, description: tile.description, group: CATEGORY_TITLE.search, state: tileState(tile) }
        : null,
    [tile],
  );

  const disconnect = (onDone: () => void) => {
    if (!workspaceId) return;
    confirmDelete({
      title: "Disconnect Google Search Console?",
      body: "Quantalog will stop reading search data for every site in this workspace, and the saved Search visibility data is deleted. Your other Google apps in Quantalog stay connected, and you can reconnect at any time.",
      confirmLabel: "Disconnect",
      onConfirm: async () => {
        try {
          await disconnectMutation(workspaceId).unwrap();
          notify.success("Google Search Console disconnected");
          onDone();
        } catch (e) {
          notify.error(errMessage(e, "Could not disconnect Google Search Console."));
        }
      },
    });
  };

  return {
    status,
    tile,
    entry,
    loading: query.isLoading,
    connect: popup.connect,
    busy: popup.connecting || query.isFetching || disconnectState.isLoading,
    disconnect,
  };
}
