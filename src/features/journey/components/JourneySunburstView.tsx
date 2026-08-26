import { useMemo, useState } from "react";
import { Box, Center, Group, Text, Stack, Badge } from "@mantine/core";
import type { JourneyStep } from "@/features/journey/lib/deriveJourney";
import { groupSessions } from "@/features/journey/lib/deriveJourney";

const SIZE = 460;
const CENTER = SIZE / 2;
const HOLE = 46;
/** How many rings deep the chart will draw before it stops. */
const MAX_DEPTH = 12;

/** A node in the path tree: one screen at one depth, and where it went next. */
type PathNode = {
  name: string;
  count: number;
  children: Map<string, PathNode>;
};

/** Ring colours, walked in order so sibling arcs stay distinguishable. */
const TONES = [
  "var(--accent-2)", "var(--green)", "var(--amber)", "var(--pink)",
  "var(--violet-2)", "var(--blue-2)",
];

/** Polar to cartesian, with 0° at twelve o'clock. */
function point(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
}

/** One arc segment of a ring, as an SVG path. */
function arcPath(startAngle: number, endAngle: number, inner: number, outer: number): string {
  const a = point(startAngle, outer);
  const b = point(endAngle, outer);
  const c = point(endAngle, inner);
  const d = point(startAngle, inner);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${a.x} ${a.y}`,
    `A ${outer} ${outer} 0 ${large} 1 ${b.x} ${b.y}`,
    `L ${c.x} ${c.y}`,
    `A ${inner} ${inner} 0 ${large} 0 ${d.x} ${d.y}`,
    "Z",
  ].join(" ");
}

/**
 * The journey as a sunburst: each ring one step further from the start, each
 * arc a screen, sized by how many of this user's sessions passed through it.
 *
 * Where the flow graph shows the map and the timeline shows the order, this
 * shows *branching* — the moment where a repeated path forks, and which fork
 * usually wins. For one user that is a picture of their habits; the same
 * chart across a cohort is where the drop-offs live.
 */
export function JourneySunburstView({ steps }: { steps: JourneyStep[] }) {
  const [hovered, setHovered] = useState<{ path: string[]; count: number } | null>(null);

  const tree = useMemo(() => {
    const root: PathNode = { name: "start", count: 0, children: new Map() };

    // Each session is one walk through the tree, so a user who repeats the
    // same route five times makes that route's arcs five times heavier.
    for (const session of groupSessions(steps)) {
      let node = root;
      root.count += 1;
      for (const step of session.steps) {
        const name = step.dest || step.action;
        const next = node.children.get(name) ?? { name, count: 0, children: new Map() };
        next.count += 1;
        node.children.set(name, next);
        node = next;
      }
    }

    return root;
  }, [steps]);

  // Flattened to arcs up front: the recursion is about geometry, not React,
  // and doing it in the render would re-run it on every hover.
  const arcs = useMemo(() => {
    // How deep the tree actually goes, capped — the ring width is derived
    // from this so the chart always fills its box exactly rather than
    // overflowing it (a long single-session chain used to draw its arcs
    // clean outside the viewBox, which looked like a chart with no data).
    const treeDepth = (node: PathNode, depth = 0): number => {
      if (!node.children.size || depth >= MAX_DEPTH) return depth;
      return Math.max(...[...node.children.values()].map((c) => treeDepth(c, depth + 1)));
    };
    const depthLimit = Math.max(1, treeDepth(tree));
    const ring = (CENTER - HOLE - 8) / depthLimit;

    const out: {
      d: string;
      fill: string;
      path: string[];
      count: number;
      depth: number;
    }[] = [];

    const walk = (node: PathNode, depth: number, start: number, end: number, path: string[]) => {
      if (depth >= depthLimit) return;

      const total = [...node.children.values()].reduce((sum, c) => sum + c.count, 0);
      if (!total) return;

      let cursor = start;
      for (const child of node.children.values()) {
        const span = ((end - start) * child.count) / total;
        const childPath = [...path, child.name];
        out.push({
          d: arcPath(cursor, cursor + span, HOLE + depth * ring, HOLE + (depth + 1) * ring),
          fill: TONES[(depth + childPath.length) % TONES.length],
          path: childPath,
          count: child.count,
          depth,
        });
        walk(child, depth + 1, cursor, cursor + span, childPath);
        cursor += span;
      }
    };

    walk(tree, 0, 0, 360, []);
    return out;
  }, [tree]);

  if (!arcs.length) {
    return (
      <Center mih={280}>
        <Text size="sm" c="dimmed">Not enough steps to chart a path yet.</Text>
      </Center>
    );
  }

  return (
    <Group align="flex-start" gap="xl" wrap="wrap" justify="center">
      <Box style={{ position: "relative" }}>
        <svg width={SIZE} height={SIZE} onMouseLeave={() => setHovered(null)}>
          {arcs.map((arc, i) => {
            const active =
              hovered && arc.path.every((seg, j) => hovered.path[j] === seg);
            return (
              <path
                key={i}
                d={arc.d}
                fill={arc.fill}
                stroke="var(--surface)"
                strokeWidth={1.5}
                opacity={hovered ? (active ? 1 : 0.28) : 0.85}
                style={{ cursor: "pointer", transition: "opacity 120ms ease" }}
                onMouseEnter={() => setHovered({ path: arc.path, count: arc.count })}
              />
            );
          })}

          {/* The hub carries the session count, so the chart says what its
              whole area adds up to without a legend. */}
          <circle cx={CENTER} cy={CENTER} r={HOLE - 4} fill="var(--surface-2)" stroke="var(--border)" />
          <text
            x={CENTER}
            y={CENTER - 2}
            textAnchor="middle"
            fill="var(--text)"
            fontSize={18}
            fontWeight={700}
          >
            {tree.count}
          </text>
          <text x={CENTER} y={CENTER + 14} textAnchor="middle" fill="var(--text-2)" fontSize={10}>
            {tree.count === 1 ? "session" : "sessions"}
          </text>
        </svg>
      </Box>

      <Stack gap="xs" maw={280} pt="md">
        <Text size="xs" fw={650} tt="uppercase" c="dimmed" lts={0.4}>
          {hovered ? "Path" : "Hover a ring"}
        </Text>
        {hovered ? (
          <>
            <Stack gap={4}>
              {hovered.path.map((seg, i) => (
                <Group key={i} gap={6} wrap="nowrap">
                  <Text size="xs" c="dimmed" w={16}>{i + 1}</Text>
                  <Badge variant="light" color="gray" radius="sm">{seg}</Badge>
                </Group>
              ))}
            </Stack>
            <Text size="sm" c="dimmed">
              {hovered.count} {hovered.count === 1 ? "session" : "sessions"} took this path.
            </Text>
          </>
        ) : (
          <Text size="sm" c="dimmed" lh={1.6}>
            Each ring is one step further from the session start, and each arc
            is sized by how many sessions passed through it. Hover to trace a
            path from the centre out.
          </Text>
        )}
      </Stack>
    </Group>
  );
}
