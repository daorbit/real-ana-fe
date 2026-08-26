import { useMemo } from "react";
import { ScrollArea } from "@mantine/core";
import type { JourneyEvent } from "@/shared/types";

const COL_W = 190;
const HEAD_H = 44;
const ROW_H = 58;
const PAD_X = 24;
const PAD_TOP = 16;

/** A step's screen names, with the empty string standing in as "direct". */
function endpoints(e: JourneyEvent): { from: string; to: string } {
  return { from: e.src || "(direct)", to: e.dest || e.action };
}

/**
 * The journey as a UML-style sequence diagram: one lifeline per screen, one
 * numbered arrow per step crossing from the screen it happened on to the one
 * it led to.
 *
 * Where the flow graph collapses repeats to show shape, this keeps every step
 * on its own row in order — so it answers "what happened, in what order" while
 * the graph answers "how does this person move around".
 *
 * Drawn as plain SVG rather than with a diagram library: the layout is a
 * fixed grid (a column per screen, a row per step), which is a few lines of
 * arithmetic and stays theme-aware through CSS variables.
 */
export function JourneySequenceView({
  events,
  selectedIndex,
  onSelect,
}: {
  events: JourneyEvent[];
  selectedIndex: number | null;
  onSelect: (i: number) => void;
}) {
  const { columns, width, height } = useMemo(() => {
    const cols: string[] = [];
    for (const e of events) {
      const { from, to } = endpoints(e);
      for (const name of [from, to]) if (!cols.includes(name)) cols.push(name);
    }
    return {
      columns: cols,
      width: Math.max(cols.length * COL_W + PAD_X * 2, 600),
      height: PAD_TOP + HEAD_H + events.length * ROW_H + 32,
    };
  }, [events]);

  const colX = (name: string) => PAD_X + columns.indexOf(name) * COL_W + COL_W / 2;

  return (
    <ScrollArea type="auto">
      <svg width={width} height={height} style={{ display: "block", minWidth: "100%" }}>
        {/* Lifelines: one dashed vertical per screen, drawn first so the
            arrows sit on top of them. */}
        {columns.map((name) => (
          <g key={name}>
            <rect
              x={colX(name) - COL_W / 2 + 10}
              y={PAD_TOP}
              width={COL_W - 20}
              height={HEAD_H - 12}
              rx={7}
              fill="var(--surface-2)"
              stroke="var(--border)"
            />
            <text
              x={colX(name)}
              y={PAD_TOP + (HEAD_H - 12) / 2 + 4}
              textAnchor="middle"
              fill="var(--text)"
              fontSize={11}
              fontWeight={600}
            >
              {name.length > 22 ? `${name.slice(0, 21)}…` : name}
            </text>
            <line
              x1={colX(name)}
              y1={PAD_TOP + HEAD_H - 8}
              x2={colX(name)}
              y2={height - 16}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          </g>
        ))}

        <defs>
          <marker
            id="jseq-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-2)" />
          </marker>
        </defs>

        {events.map((e, i) => {
          const { from, to } = endpoints(e);
          const y = PAD_TOP + HEAD_H + i * ROW_H + ROW_H / 2;
          const x1 = colX(from);
          const x2 = colX(to);
          const selected = selectedIndex === i;
          // A step that starts and ends on the same screen has no distance to
          // cross, so it gets a short stub rather than a zero-length arrow.
          const isSelf = from === to;
          const stubEnd = x1 + 44;

          return (
            <g
              key={i}
              onClick={() => onSelect(i)}
              style={{ cursor: "pointer" }}
              opacity={selectedIndex === null || selected ? 1 : 0.45}
            >
              {/* Full-width hit area, so clicking anywhere on the row selects
                  it rather than only the thin arrow itself. */}
              <rect
                x={0}
                y={y - ROW_H / 2}
                width={width}
                height={ROW_H}
                fill={selected ? "var(--surface-2)" : "transparent"}
              />

              <line
                x1={x1}
                y1={y}
                x2={isSelf ? stubEnd : x2}
                y2={y}
                stroke="var(--accent-2)"
                strokeWidth={selected ? 2 : 1.4}
                markerEnd="url(#jseq-arrow)"
              />

              <text
                x={isSelf ? x1 + 10 : (x1 + x2) / 2}
                y={y - 8}
                textAnchor={isSelf ? "start" : "middle"}
                fill="var(--text-2)"
                fontSize={10}
                fontWeight={600}
              >
                {e.action}
              </text>

              {/* Step number, pinned to the left margin so the sequence reads
                  as an ordered list even when arrows point backwards. */}
              <circle cx={12} cy={y} r={9} fill="var(--accent-2)" opacity={selected ? 1 : 0.85} />
              <text x={12} y={y + 3.5} textAnchor="middle" fill="#fff" fontSize={9} fontWeight={700}>
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
    </ScrollArea>
  );
}
