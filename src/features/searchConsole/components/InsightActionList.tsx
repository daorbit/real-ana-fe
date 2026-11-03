import { useState } from "react";
import { Button, Text } from "@mantine/core";
import { SearchSegmented } from "./SearchSegmented";
import { CheckCircle2 } from "lucide-react";
import { ACTION_KINDS, type ActionKind, type InsightAction } from "../insightActions";
import { InsightActionItem } from "./InsightActionItem";
import { SearchSectionHead } from "./SearchSectionHead";
import classes from "./insights.module.css";

const PREVIEW = 8;

export function InsightActionList({
  actions,
  onOpen,
}: {
  actions: InsightAction[];
  onOpen: (action: InsightAction) => void;
}) {
  const [kind, setKind] = useState<ActionKind | "all">("all");
  const [expanded, setExpanded] = useState(false);

  const filtered = kind === "all" ? actions : actions.filter((a) => a.kind === kind);
  const shown = expanded ? filtered : filtered.slice(0, PREVIEW);
  const filters: { value: ActionKind | "all"; label: string }[] = [
    { value: "all", label: "All" },
    ...ACTION_KINDS.map((k) => ({ value: k.id, label: k.label })),
  ];

  return (
    <section className={classes.group} aria-label="What to do next">
      <SearchSectionHead
        title="What to do next"
        right={
          <SearchSegmented
            size="sm"
            label="Filter actions"
            value={kind}
            items={filters}
            onChange={(v) => {
              setKind(v);
              setExpanded(false);
            }}
          />
        }
      />

      <div className={classes.list}>
        {shown.length === 0 ? (
          <div className={classes.empty}>
            <CheckCircle2 size={22} />
            <Text fw={650} size="sm">
              All clear here
            </Text>
            <Text size="xs" c="dimmed">
              Nothing in this category for the selected period. Try a longer date range.
            </Text>
          </div>
        ) : (
          shown.map((a) => <InsightActionItem key={a.id} action={a} onOpen={() => onOpen(a)} />)
        )}
      </div>

      {filtered.length > PREVIEW && (
        <Button variant="subtle" size="compact-sm" className={classes.more} onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Show fewer" : `Show all ${filtered.length}`}
        </Button>
      )}
    </section>
  );
}
