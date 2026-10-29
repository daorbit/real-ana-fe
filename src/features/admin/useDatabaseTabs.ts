import { useMemo, useRef, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { Cpu, Database, type LucideIcon } from "lucide-react";
import {
  useGetDbConnectionsQuery,
  useGetDbConnectionStatsQuery,
  useGetDbStatsQuery,
  useRemoveDbConnectionMutation,
} from "@/app/store";
import { confirmDelete, errMessage, notify } from "@/shared/lib/notify";
import type { DbConnection } from "@/shared/types";
import type { WorkersAiTrendCardHandle } from "./components/database/WorkersAiTrendCard";

export const PRIMARY_TAB = "primary";
export const AI_TAB = "ai";

export type DatabaseTab = { id: string; label: string; icon: LucideIcon };

const NO_CONNECTIONS: DbConnection[] = [];

export function useDatabaseTabs() {
  const [active, setActive] = useState<string>(PRIMARY_TAB);
  const trendRef = useRef<WorkersAiTrendCardHandle>(null);

  const primary = useGetDbStatsQuery();
  const { data: connectionList } = useGetDbConnectionsQuery();
  const connections = connectionList ?? NO_CONNECTIONS;
  const [removeConnection] = useRemoveDbConnectionMutation();

  const connection = connections.find((c) => c.id === active) ?? null;
  const connectionStats = useGetDbConnectionStatsQuery(connection?.id ?? skipToken);

  const primaryName = primary.data?.name;
  const tabs = useMemo<DatabaseTab[]>(
    () => [
      { id: PRIMARY_TAB, label: primaryName ?? "Primary", icon: Database },
      ...connections.map((c) => ({ id: c.id, label: c.label, icon: Database })),
      { id: AI_TAB, label: "AI usage", icon: Cpu },
    ],
    [primaryName, connections]
  );

  const current = tabs.some((t) => t.id === active) ? active : PRIMARY_TAB;

  const refresh = () => {
    if (connection) {
      connectionStats.refetch();
      return;
    }
    primary.refetch();
    trendRef.current?.refetch();
  };

  const remove = (target: DbConnection) =>
    confirmDelete({
      title: `Remove ${target.label}?`,
      body: "Quantalog forgets this connection string. The database itself is not touched.",
      confirmLabel: "Remove",
      onConfirm: async () => {
        try {
          await removeConnection(target.id).unwrap();
          setActive(PRIMARY_TAB);
          notify.success("Database removed.");
        } catch (e) {
          notify.error(errMessage(e, "Could not remove the database."));
        }
      },
    });

  return {
    tabs,
    current,
    setActive,
    primary,
    connection,
    connectionStats,
    trendRef,
    refresh,
    refreshing: connection ? connectionStats.isFetching : primary.isFetching,
    remove,
  };
}
