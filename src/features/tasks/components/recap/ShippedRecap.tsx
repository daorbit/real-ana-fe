import { useMemo } from "react";
import { StatTile, StatTileGrid } from "@/shared/ui/StatTile";
import type { WorkspaceMember } from "@/shared/types";
import { weeklyRecap } from "../../lib/recap";
import type { Task } from "../../types";

function deltaNote(shipped: number, previous: number): string {
  if (shipped === previous) return "Same as last week";
  const diff = shipped - previous;
  return `${diff > 0 ? "+" : "−"}${Math.abs(diff)} vs last week`;
}

export function ShippedRecap({
  tasks,
  memberMap,
  userId,
}: {
  tasks: Task[];
  memberMap: Map<string, WorkspaceMember>;
  userId?: string | null;
}) {
  const recap = useMemo(() => weeklyRecap(tasks, userId ?? null), [tasks, userId]);
  const top = recap.top ? memberMap.get(recap.top.userId) : undefined;

  return (
    <StatTileGrid>
      <StatTile
        label={userId ? "You finished this week" : "Shipped this week"}
        value={String(recap.shipped)}
        note={deltaNote(recap.shipped, recap.previous)}
      />
      <StatTile
        label="Streak"
        value={recap.streak ? `${recap.streak} ${recap.streak === 1 ? "day" : "days"}` : "—"}
        note={recap.streak ? "In a row with a finished task" : "Finish a task to start one"}
      />
      {!userId && (
        <StatTile
          label="Most shipped"
          value={top ? top.name || top.email : "—"}
          note={recap.top ? `${recap.top.count} ${recap.top.count === 1 ? "task" : "tasks"} this week` : "Nobody yet this week"}
        />
      )}
    </StatTileGrid>
  );
}
