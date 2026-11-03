import { useState } from "react";
import { UnstyledButton } from "@mantine/core";
import { SearchSegmented } from "./SearchSegmented";
import { num } from "@/shared/lib";
import type { SearchInsights } from "@/shared/types";
import { buildMovers, type Mover } from "../insightActions";
import { SearchCardHead } from "./SearchSectionHead";
import classes from "./insights.module.css";

function MoverRow({ mover, onOpen }: { mover: Mover; onOpen: () => void }) {
  const up = mover.delta >= 0;
  return (
    <UnstyledButton className={classes.mover} onClick={onOpen} title={mover.key}>
      <span className={classes.moverLabel}>{mover.label}</span>
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
  const [dimension, setDimension] = useState<"query" | "page">("query");
  const { winners, losers } = buildMovers(data, dimension);

  return (
    <section className={classes.panel}>
      <SearchCardHead
        title="Biggest movers"
        description="Change in clicks vs the previous period."
        right={
          <SearchSegmented
            size="xs"
            label="Movers by"
            value={dimension}
            onChange={setDimension}
            items={[
              { value: "query", label: "Queries" },
              { value: "page", label: "Pages" },
            ]}
          />
        }
      />

      {[
        { title: "Gaining clicks", rows: winners, empty: "Nothing gained clicks this period." },
        { title: "Losing clicks", rows: losers, empty: "Nothing lost clicks this period." },
      ].map((group) => (
        <div key={group.title} className={classes.moverGroup}>
          <span className={classes.moverGroupTitle}>{group.title}</span>
          {group.rows.length === 0 ? (
            <span className={classes.moverEmpty}>{group.empty}</span>
          ) : (
            group.rows.map((m) => <MoverRow key={m.key} mover={m} onOpen={() => onOpen(m.dimension, m.key)} />)
          )}
        </div>
      ))}
    </section>
  );
}
