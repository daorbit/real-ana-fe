import { useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown, Filter, type LucideIcon } from "lucide-react";
import type { RankTone } from "./tones";
import classes from "./Rank.module.css";

export type RankItem = {
  id: string;
  label: ReactNode;
  title?: string;
  value: ReactNode;
  weight?: number;
  aside?: ReactNode;
  meta?: ReactNode;
  leading?: ReactNode;
  tone?: RankTone;
};

const STRIP_STEPS = 5;

function RankRow({
  item,
  position,
  showRank,
  step,
  active,
  dim,
  selected,
  selectHint,
  hintIcon: HintIcon,
  onSelect,
  onHover,
}: {
  item: RankItem;
  position: number;
  showRank: boolean;
  step?: number;
  active: boolean;
  dim: boolean;
  selected: boolean;
  selectHint: string;
  hintIcon: LucideIcon;
  onSelect?: (id: string) => void;
  onHover: (index: number | null) => void;
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
      data-active={active || undefined}
      data-dim={dim || undefined}
      data-selected={selected || undefined}
      aria-pressed={onSelect ? selected : undefined}
      role={selectable ? "button" : undefined}
      tabIndex={selectable ? 0 : undefined}
      title={item.title}
      onClick={selectable ? () => onSelect?.(item.id) : undefined}
      onKeyDown={selectable ? onKeyDown : undefined}
      onMouseEnter={() => onHover(position - 1)}
      onMouseLeave={() => onHover(null)}
    >
      {showRank && (
        <span className={classes.rank} data-step={step}>
          {position}
        </span>
      )}
      {item.leading && <span className={classes.leading}>{item.leading}</span>}
      <span className={classes.label}>
        <span className={classes.labelText}>{item.label}</span>
        {item.meta && <span className={classes.meta}>{item.meta}</span>}
      </span>
      {selectable && !selected && (
        <span className={classes.hint}>
          <HintIcon size={11} />
          {selectHint}
        </span>
      )}
      {item.aside && <span className={classes.aside}>{item.aside}</span>}
      <span className={classes.value}>{item.value}</span>
    </li>
  );
}

function ShareStrip({
  items,
  hover,
  onHover,
}: {
  items: RankItem[];
  hover: number | null;
  onHover: (index: number | null) => void;
}) {
  const top = items.slice(0, STRIP_STEPS);
  const rest = items.slice(STRIP_STEPS).reduce((sum, i) => sum + (i.weight ?? 0), 0);
  const restActive = hover !== null && hover >= STRIP_STEPS;

  return (
    <div className={classes.strip} data-hovering={hover !== null || undefined} role="presentation">
      {top.map((item, i) => (
        <span
          key={item.id}
          className={classes.segment}
          data-step={i}
          data-active={hover === i || undefined}
          style={{ flexGrow: item.weight ?? 0 } as CSSProperties}
          onMouseEnter={() => onHover(i)}
          onMouseLeave={() => onHover(null)}
        />
      ))}
      {rest > 0 && (
        <span
          className={classes.segment}
          data-step="rest"
          data-active={restActive || undefined}
          style={{ flexGrow: rest } as CSSProperties}
        />
      )}
    </div>
  );
}

export function RankList({
  items,
  limit = 8,
  showRank = true,
  strip = false,
  selectedId,
  selectHint = "Filter",
  hintIcon = Filter,
  onSelect,
}: {
  items: RankItem[];
  limit?: number;
  showRank?: boolean;
  strip?: boolean;
  selectedId?: string | null;
  selectHint?: string;
  hintIcon?: LucideIcon;
  onSelect?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const overflow = items.length > limit;
  const visible = expanded || !overflow ? items : items.slice(0, limit);
  const showStrip = strip && items.length > 1 && items.every((i) => typeof i.weight === "number");

  return (
    <div className={classes.listWrap}>
      {showStrip && <ShareStrip items={items} hover={hover} onHover={setHover} />}
      <ol className={classes.list}>
        {visible.map((item, index) => (
          <RankRow
            key={item.id}
            item={item}
            position={index + 1}
            showRank={showRank}
            step={showStrip && index < STRIP_STEPS ? index : undefined}
            active={hover === index}
            dim={showStrip && hover !== null && hover !== index}
            selected={selectedId === item.id}
            selectHint={selectHint}
            hintIcon={hintIcon}
            onSelect={onSelect}
            onHover={setHover}
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
