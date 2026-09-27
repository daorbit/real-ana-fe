import { useState } from "react";
import { Button, Text, UnstyledButton } from "@mantine/core";
import { CheckCircle2 } from "lucide-react";
import { ACTION_KINDS, type ActionKind, type InsightAction } from "../insightActions";
import { InsightActionItem } from "./InsightActionItem";
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
  const filters: { id: ActionKind | "all"; label: string; count: number }[] = [
    { id: "all", label: "All", count: actions.length },
    ...ACTION_KINDS.map((k) => ({ ...k, count: actions.filter((a) => a.kind === k.id).length })),
  ];

  return (
    <section className={classes.panel}>
      <header className={classes.panelHead}>
        <div>
          <Text fw={650} size="sm">
            Recommended actions
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            Ranked by estimated impact on clicks. Open one to see its trend and ranking pages.
          </Text>
        </div>
        <div className={classes.filters} role="tablist">
          {filters.map((f) => (
            <UnstyledButton
              key={f.id}
              role="tab"
              aria-selected={kind === f.id}
              data-active={kind === f.id || undefined}
              data-kind={f.id}
              className={classes.filter}
              onClick={() => {
                setKind(f.id);
                setExpanded(false);
              }}
            >
              {f.label}
              <span className={classes.filterCount}>{f.count}</span>
            </UnstyledButton>
          ))}
        </div>
      </header>

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
        <div className={classes.actions}>
          {shown.map((a) => (
            <InsightActionItem key={a.id} action={a} onOpen={() => onOpen(a)} />
          ))}
        </div>
      )}

      {filtered.length > PREVIEW && (
        <Button variant="subtle" size="compact-sm" className={classes.more} onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Show fewer" : `Show all ${filtered.length}`}
        </Button>
      )}
    </section>
  );
}
