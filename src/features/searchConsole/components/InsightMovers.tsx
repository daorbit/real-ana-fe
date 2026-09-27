import { useState } from "react";
import { SegmentedControl, Text, UnstyledButton } from "@mantine/core";
import { num } from "@/shared/lib";
import type { SearchInsights } from "@/shared/types";
import { buildMovers, type Mover } from "../insightActions";
import classes from "./insights.module.css";

function MoverRow({ mover, max, onOpen }: { mover: Mover; max: number; onOpen: () => void }) {
  const up = mover.delta >= 0;
  const width = max ? Math.max(4, (Math.abs(mover.delta) / max) * 100) : 0;
  return (
    <UnstyledButton className={classes.mover} onClick={onOpen} title={mover.key}>
      <span className={classes.moverLabel}>{mover.label}</span>
      <span className={classes.moverTrack} data-dir={up ? "up" : "down"}>
        <span className={classes.moverBar} style={{ width: `${width}%` }} />
      </span>
      <span className={classes.moverValue} data-dir={up ? "up" : "down"}>
        {up ? "+" : "−"}
        {num(Math.abs(mover.delta))}
      </span>
    </UnstyledButton>
  );
}

export function InsightMovers({
  data,
  onOpen,
}: {
  data: SearchInsights;
  onOpen: (dimension: "query" | "page", key: string) => void;
}) {
  const [dimension, setDimension] = useState<"query" | "page">("page");
  const { winners, losers } = buildMovers(data, dimension);
  const max = Math.max(0, ...[...winners, ...losers].map((m) => Math.abs(m.delta)));

  return (
    <section className={classes.panel}>
      <header className={classes.panelHead}>
        <div>
          <Text fw={650} size="sm">
            Top movers
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            Change in clicks vs the previous period.
          </Text>
        </div>
        <SegmentedControl
          size="xs"
          value={dimension}
          onChange={(v) => setDimension(v as "query" | "page")}
          data={[
            { value: "page", label: "Pages" },
            { value: "query", label: "Queries" },
          ]}
        />
      </header>

      {[
        { title: "Gaining", rows: winners, empty: "Nothing gained clicks this period." },
        { title: "Losing", rows: losers, empty: "Nothing lost clicks this period." },
      ].map((group) => (
        <div key={group.title} className={classes.moverGroup}>
          <Text className={classes.moverGroupTitle}>{group.title}</Text>
          {group.rows.length === 0 ? (
            <Text size="xs" c="dimmed">
              {group.empty}
            </Text>
          ) : (
            group.rows.map((m) => (
              <MoverRow key={m.key} mover={m} max={max} onOpen={() => onOpen(m.dimension, m.key)} />
            ))
          )}
        </div>
      ))}
    </section>
  );
}
