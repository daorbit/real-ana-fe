import { useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown, Filter } from "lucide-react";
import type { RankTone } from "./tones";
import classes from "./Rank.module.css";

export type RankItem = {
  id: string;
  label: ReactNode;
  title?: string;
  value: ReactNode;
  aside?: ReactNode;
  meta?: ReactNode;
  leading?: ReactNode;
  tone?: RankTone;
};

function RankRow({
  item,
  position,
  showRank,
  selectHint,
  onSelect,
}: {
  item: RankItem;
  position: number;
  showRank: boolean;
  selectHint: string;
  onSelect?: (id: string) => void;
}) {
  const selectable = Boolean(onSelect);
  const onKeyDown = (e: KeyboardEvent<HTMLLIElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    onSelect?.(item.id);
  };

  return (
    <li
      className={classes.row}
      data-tone={item.tone}
      data-selectable={selectable || undefined}
      role={selectable ? "button" : undefined}
      tabIndex={selectable ? 0 : undefined}
      title={item.title}
      onClick={selectable ? () => onSelect?.(item.id) : undefined}
      onKeyDown={selectable ? onKeyDown : undefined}
    >
      {showRank && (
        <span className={classes.rank} data-podium={position <= 3 || undefined}>
          {position}
        </span>
      )}
      {item.leading && <span className={classes.leading}>{item.leading}</span>}
      <span className={classes.label}>
        <span className={classes.labelText}>{item.label}</span>
        {item.meta && <span className={classes.meta}>{item.meta}</span>}
      </span>
      {selectable && (
        <span className={classes.hint}>
          <Filter size={11} />
          {selectHint}
        </span>
      )}
      {item.aside && <span className={classes.aside}>{item.aside}</span>}
      <span className={classes.value}>{item.value}</span>
    </li>
  );
}

export function RankList({
  items,
  limit = 8,
  showRank = true,
  selectHint = "Filter",
  onSelect,
}: {
  items: RankItem[];
  limit?: number;
  showRank?: boolean;
  selectHint?: string;
  onSelect?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const overflow = items.length > limit;
  const visible = expanded || !overflow ? items : items.slice(0, limit);

  return (
    <div className={classes.listWrap}>
      <ol className={classes.list}>
        {visible.map((item, index) => (
          <RankRow
            key={item.id}
            item={item}
            position={index + 1}
            showRank={showRank}
            selectHint={selectHint}
            onSelect={onSelect}
          />
        ))}
      </ol>
      {overflow && (
        <button type="button" className={classes.more} onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Show less" : `Show all ${items.length}`}
          <ChevronDown size={14} className={classes.moreIcon} data-open={expanded || undefined} />
        </button>
      )}
    </div>
  );
}
