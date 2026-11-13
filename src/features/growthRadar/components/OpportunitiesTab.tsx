import { useState } from "react";
import { SegmentedControl, Skeleton } from "@mantine/core";
import { AlarmClock, Radar } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useRadarList } from "../hooks/useRadarData";
import { SNOOZED_HELP } from "../lib/help";
import type { OpportunityCard, OpportunityStatus } from "../types";
import { PriorityGroups } from "./PriorityGroups";
import { OpportunityGroup } from "./OpportunityRow";
import { SectionHeader } from "./SectionHeader";
import classes from "./GrowthRadar.module.css";

type Filter = "all" | OpportunityStatus | "snoozed";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "New" },
  { value: "planned", label: "Planned" },
  { value: "investigating", label: "Investigating" },
  { value: "snoozed", label: "Snoozed" },
];

function SnoozedList({ workspaceId }: { workspaceId: string }) {
  const { list, loading } = useRadarList(workspaceId, "snoozed", undefined, true);
  if (loading) return <Skeleton height={200} radius="md" />;
  if (!list?.items.length) {
    return <EmptyState compact icon={AlarmClock} title="Nothing is snoozed" description="Snoozed findings return to your list on the date you pick." />;
  }
  return (
    <section className={classes.section}>
      <SectionHeader title="Snoozed" count={list.items.length} help={SNOOZED_HELP} />
      <OpportunityGroup cards={list.items} />
    </section>
  );
}

export function OpportunitiesTab({
  workspaceId,
  cards,
  snoozedCount,
}: {
  workspaceId: string;
  cards: OpportunityCard[];
  snoozedCount: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const counts: Record<Filter, number> = {
    all: cards.length,
    open: cards.filter((c) => c.status === "open").length,
    planned: cards.filter((c) => c.status === "planned").length,
    investigating: cards.filter((c) => c.status === "investigating").length,
    resolved: 0,
    dismissed: 0,
    archived: 0,
    snoozed: snoozedCount,
  };
  const shown = filter === "all" ? cards : cards.filter((c) => c.status === filter);

  return (
    <div className={classes.page}>
      <div className={classes.toolbar}>
        <SegmentedControl
          value={filter}
          onChange={(v) => setFilter(v as Filter)}
          data={FILTERS.map((f) => ({ value: f.value, label: `${f.label} ${counts[f.value]}` }))}
          aria-label="Show findings"
        />
        <span className={classes.sectionNote}>Grouped by priority, most recently seen first</span>
      </div>

      {filter === "snoozed" ? (
        <SnoozedList workspaceId={workspaceId} />
      ) : shown.length ? (
        <PriorityGroups cards={shown} />
      ) : (
        <EmptyState
          compact
          icon={Radar}
          title="Nothing here"
          description="Findings move between these lists as you plan, investigate and resolve them."
        />
      )}
    </div>
  );
}
