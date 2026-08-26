import { useMemo, useState } from "react";
import { Box, Center, Group, Text, ScrollArea } from "@mantine/core";
import type { JourneyStep } from "@/features/journey/lib/deriveJourney";

const NODE_W = 14;
const COL_GAP = 240;
const PAD_Y = 20;
const MIN_BAND = 3;
const GAP = 10;

/** A step's screen names, with the empty string standing in as "direct". */
function endpoints(e: JourneyStep): { from: string; to: string } {
  return { from: e.src || "(direct)", to: e.dest || e.action };
}

type Band = {
  from: string;
  to: string;
  count: number;
  d: string;
  y1: number;
  y2: number;
  thickness: number;
};

/**
 * The journey as a Sankey: screens as vertical bars, moves between them as
 * ribbons whose thickness is how often that move happened.
 *
 * Where the flow graph answers "what connects to what", this answers "how
 * much" — a hairline ribbon and a fat one are the same arrow in a node graph
 * but very different facts. Built as plain SVG rather than pulling in d3-
 * sankey: the layout here is one pass of arithmetic and the dependency would
 * be larger than the file.
 */
export function JourneySankeyView({ steps }: { steps: JourneyStep[] }) {
  const [hovered, setHovered] = useState<Band | null>(null);

  const { columns, bands, height, width } = useMemo(() => {
    // Column = how many moves from the start a screen first appears at, so
    // the diagram flows left to right in journey order.
    const depth = new Map<string, number>();
    const firstScreen = steps.length ? endpoints(steps[0]).from : "";
    if (firstScreen) depth.set(firstScreen, 0);

    for (let pass = 0; pass < 4; pass++) {
      for (const s of steps) {
        const { from, to } = endpoints(s);
        const at = depth.get(from);
        if (at === undefined) continue;
        const existing = depth.get(to);
        if (existing === undefined || existing > at + 1) depth.set(to, at + 1);
      }
    }
    for (const s of steps) {
      const { from, to } = endpoints(s);
      for (const n of [from, to]) if (!depth.has(n)) depth.set(n, 0);
    }

    // Traffic through each screen decides how tall its bar is.
    const through = new Map<string, number>();
    const moves = new Map<string, { from: string; to: string; count: number }>();
    for (const s of steps) {
      const { from, to } = endpoints(s);
      through.set(from, (through.get(from) ?? 0) + s.repeats);
      through.set(to, (through.get(to) ?? 0) + s.repeats);
      if (from === to) continue;
      const key = `${from}->${to}`;
      const hit = moves.get(key) ?? { from, to, count: 0 };
      hit.count += s.repeats;
      moves.set(key, hit);
    }

    const byColumn = new Map<number, string[]>();
    for (const [name, col] of depth) {
      byColumn.set(col, [...(byColumn.get(col) ?? []), name]);
    }

    const maxThrough = Math.max(...through.values(), 1);
    const tallest = Math.max(
      ...[...byColumn.values()].map(
        (names) =>
          names.reduce((sum, n) => sum + (through.get(n) ?? 0), 0) / maxThrough,
      ),
      0.1,
    );
    // Scale so the busiest column fills the available height.
    const scale = 460 / (tallest * maxThrough === 0 ? 1 : tallest * maxThrough);

    const cols = [...byColumn.entries()].sort((a, b) => a[0] - b[0]);
    const placed = new Map<string, { x: number; y: number; h: number }>();

    for (const [col, names] of cols) {
      let cursor = PAD_Y;
      // Busiest first, so the eye lands on the main path.
      const ordered = [...names].sort((a, b) => (through.get(b) ?? 0) - (through.get(a) ?? 0));
      for (const name of ordered) {
        const h = Math.max(MIN_BAND * 4, (through.get(name) ?? 0) * scale);
        placed.set(name, { x: col * COL_GAP, y: cursor, h });
        cursor += h + GAP * 2;
      }
    }

    // Ribbons leave a bar stacked in order, so two moves out of one screen
    // do not draw on top of each other.
    const outCursor = new Map<string, number>();
    const inCursor = new Map<string, number>();

    const bands: Band[] = [...moves.values()]
      .sort((a, b) => b.count - a.count)
      .map((move) => {
        const a = placed.get(move.from)!;
        const b = placed.get(move.to)!;
        const outTotal = [...moves.values()]
          .filter((m) => m.from === move.from)
          .reduce((s, m) => s + m.count, 0);
        const inTotal = [...moves.values()]
          .filter((m) => m.to === move.to)
          .reduce((s, m) => s + m.count, 0);

        const thickness = Math.max(MIN_BAND, (move.count / outTotal) * a.h);
        const inThickness = Math.max(MIN_BAND, (move.count / inTotal) * b.h);

        const y1 = a.y + (outCursor.get(move.from) ?? 0) + thickness / 2;
        const y2 = b.y + (inCursor.get(move.to) ?? 0) + inThickness / 2;
        outCursor.set(move.from, (outCursor.get(move.from) ?? 0) + thickness);
        inCursor.set(move.to, (inCursor.get(move.to) ?? 0) + inThickness);

        const x1 = a.x + NODE_W;
        const x2 = b.x;
        const mid = (x1 + x2) / 2;

        return {
          from: move.from,
          to: move.to,
          count: move.count,
          thickness,
          y1,
          y2,
          d: `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`,
        };
      });

    const maxCol = Math.max(...[...depth.values()], 0);
    const maxY = Math.max(...[...placed.values()].map((p) => p.y + p.h), 200);

    return {
      columns: [...placed.entries()].map(([name, pos]) => ({
        name,
        ...pos,
        total: through.get(name) ?? 0,
      })),
      bands,
      width: maxCol * COL_GAP + NODE_W + 200,
      height: maxY + PAD_Y * 2,
    };
  }, [steps]);

  if (!columns.length) {
    return (
      <Center mih={280}>
        <Text size="sm" c="dimmed">Not enough steps to chart a flow yet.</Text>
      </Center>
    );
  }

  return (
    <Box>
      <ScrollArea type="auto">
        <svg width={width} height={height} style={{ display: "block", minWidth: "100%" }}>
          {bands.map((band, i) => {
            const active = hovered === band;
            return (
              <path
                key={i}
                d={band.d}
                fill="none"
                stroke="var(--accent-2)"
                strokeWidth={band.thickness}
                opacity={hovered ? (active ? 0.75 : 0.12) : 0.3}
                style={{ cursor: "pointer", transition: "opacity 120ms ease" }}
                onMouseEnter={() => setHovered(band)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}

          {columns.map((col) => (
            <g key={col.name}>
              <rect
                x={col.x}
                y={col.y}
                width={NODE_W}
                height={col.h}
                rx={3}
                fill="var(--text-2)"
              />
              <text
                x={col.x + NODE_W + 8}
                y={col.y + 12}
                fill="var(--text)"
                fontSize={11}
                fontWeight={600}
              >
                {col.name.length > 24 ? `${col.name.slice(0, 23)}…` : col.name}
              </text>
              <text
                x={col.x + NODE_W + 8}
                y={col.y + 26}
                fill="var(--text-2)"
                fontSize={10}
              >
                {col.total} {col.total === 1 ? "pass" : "passes"}
              </text>
            </g>
          ))}
        </svg>
      </ScrollArea>

      <Group justify="center" mt="sm">
        <Text size="xs" c="dimmed">
          {hovered
            ? `${hovered.from} → ${hovered.to} · ${hovered.count} ${hovered.count === 1 ? "time" : "times"}`
            : "Ribbon thickness is how often that move happened. Hover one to read it."}
        </Text>
      </Group>
    </Box>
  );
}
