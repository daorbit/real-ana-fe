import { Button, Text, UnstyledButton } from "@mantine/core";
import { ArrowRight, ChevronRight } from "lucide-react";
import { insightLabel, type InsightDef, type InsightItem } from "../insightDefs";
import { PositionChip } from "./SearchCells";
import classes from "./insights.module.css";

const PREVIEW_ROWS = 5;

export function SearchInsightCard({
  def,
  rows,
  onOpenRow,
  onViewAll,
}: {
  def: InsightDef;
  rows: InsightItem[];
  onOpenRow: (row: InsightItem) => void;
  onViewAll: () => void;
}) {
  const Icon = def.icon;

  return (
    <article className={classes.card} data-tone={def.tone}>
      <header className={classes.cardHead}>
        <span className={classes.icon} data-tone={def.tone}>
          <Icon size={16} />
        </span>
        <div className={classes.cardTitle}>
          <Text fw={650} size="sm">
            {def.title}
          </Text>
          <Text size="xs" c="dimmed" lineClamp={2}>
            {def.description}
          </Text>
        </div>
        <span className={classes.count}>{rows.length}</span>
      </header>

      <ul className={classes.list}>
        {rows.slice(0, PREVIEW_ROWS).map((row, i) => (
          <li key={`${row.key}-${i}`}>
            <UnstyledButton className={classes.row} onClick={() => onOpenRow(row)} title={row.key}>
              <span className={classes.rowLabel}>{insightLabel(def, row)}</span>
              <span className={classes.rowValue}>{def.highlight(row)}</span>
              {row.position !== undefined && <PositionChip position={row.position} />}
              <ChevronRight size={14} className={classes.rowChevron} />
            </UnstyledButton>
          </li>
        ))}
      </ul>

      <footer className={classes.cardFoot}>
        <Button variant="subtle" size="compact-sm" rightSection={<ArrowRight size={13} />} onClick={onViewAll}>
          {rows.length > PREVIEW_ROWS ? `View all ${rows.length}` : "Details & what to do"}
        </Button>
      </footer>
    </article>
  );
}
