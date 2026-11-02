import { useMemo } from "react";
import { MAP_HEIGHT, MAP_WIDTH, useWorldPaths } from "./useWorldPaths";
import classes from "./BubbleWorldMap.module.css";

const MAX_RADIUS = 30;
const MIN_RADIUS = 6;
const LABELLED = 8;

export function BubbleWorldMap({
  byName,
  onHover,
  onSelect,
}: {
  byName: Map<string, number>;
  onHover: (hover: { name: string; count: number } | null) => void;
  onSelect?: (code: string) => void;
}) {
  const shapes = useWorldPaths();
  const max = Math.max(1, ...byName.values());

  const bubbles = useMemo(
    () =>
      shapes
        .map((s) => ({ shape: s, count: byName.get(s.name) ?? 0 }))
        .filter((b) => b.count > 0)
        .sort((a, b) => b.count - a.count)
        .map((b, i) => ({
          ...b,
          r: MIN_RADIUS + Math.sqrt(b.count / max) * (MAX_RADIUS - MIN_RADIUS),
          labelled: i < LABELLED,
        }))
        .reverse(),
    [shapes, byName, max],
  );

  return (
    <>
      <div className={classes.frame}>
        <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className={classes.map} role="img" aria-label="Visitors by country">
          <g aria-hidden>
            {shapes.map((s) => (
              <path key={s.name} d={s.d} className={classes.land} />
            ))}
          </g>
          {bubbles.map(({ shape, count, r, labelled }) => {
            const [x, y] = shape.anchor;
            const select = onSelect && shape.code ? () => onSelect(shape.code as string) : undefined;
            return (
              <g
                key={shape.name}
                className={classes.bubble}
                data-selectable={select ? true : undefined}
                role={select ? "button" : undefined}
                tabIndex={select ? 0 : undefined}
                aria-label={`${shape.name}, ${count.toLocaleString()} visitors`}
                onClick={select}
                onKeyDown={(e) => {
                  if (select && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    select();
                  }
                }}
                onMouseEnter={() => onHover({ name: shape.name, count })}
                onMouseLeave={() => onHover(null)}
              >
                <circle cx={x} cy={y} r={r} className={classes.dot} />
                {labelled && (
                  <text x={x} y={y - r - 6} textAnchor="middle" className={classes.label}>
                    {shape.code ?? shape.name} · {count.toLocaleString()}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className={classes.note}>
        Circle size shows visitors.{onSelect ? " Click a country to filter the report." : ""}
      </p>
    </>
  );
}
