import { countryShortName } from "@/shared/lib/countries";
import { MAP_HEIGHT, MAP_WIDTH, type CountryShape } from "./useWorldPaths";
import { flagAccent } from "./flagTone";

export const CALLOUT = { height: 40, padLeft: 22, radius: 7 };

const PAD_RIGHT = 12;
const MIN_TEXT = 34;
const CHAR_WIDTH = 6.1;
const MAX_NAME = 16;
const MARGIN = 8;
const GAP = 8;
const KNEE = 14;
const ANCHOR_BOX = 7;
const SIDE_OFFSETS = [36, 64, 96, 136, 184];
const SHIFTS = [0, -26, 26, -52, 52, -84, 84, -120, 120];
const STACK_OFFSETS = [30, 56, 86];
const LINE_HIT = 400;
const ANCHOR_COVER = 4000;
const ANCHOR_CROSS = 40;
const COUNTRY_HIT = 0.03;

export type SpotlightTone = { from: string; to: string };

export const SPOTLIGHT_TONES: SpotlightTone[] = [
  { from: "#fcd34d", to: "#f59e0b" },
  { from: "#38bdf8", to: "#2563eb" },
  { from: "#a78bfa", to: "#6d28d9" },
  { from: "#6ee7b7", to: "#059669" },
  { from: "#f9a8d4", to: "#e11d48" },
  { from: "#67e8f9", to: "#0891b2" },
];

const toneFor = (code: string, index: number): SpotlightTone => {
  const accent = flagAccent(code);
  return accent ? { from: accent, to: accent } : SPOTLIGHT_TONES[index];
};

export type Spotlight = {
  shape: CountryShape;
  label: string;
  fullName: string;
  count: number;
  share: number;
  tone: SpotlightTone;
  x: number;
  y: number;
  width: number;
  unit: number;
  leader: string;
};

type Rect = { x: number; y: number; w: number; h: number };
type Point = [number, number];

const overlapArea = (a: Rect, b: Rect) => {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
};

const grow = (r: Rect, by: number): Rect => ({ x: r.x - by, y: r.y - by, w: r.w + by * 2, h: r.h + by * 2 });

const contains = (r: Rect, [x, y]: Point) => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;

const fit = (name: string) => (name.length > MAX_NAME ? `${name.slice(0, MAX_NAME - 1)}…` : name);

const shapeRect = ({ bounds: [[x0, y0], [x1, y1]] }: CountryShape): Rect => ({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 });

function sample(points: Point[]): Point[] {
  const out: Point[] = [];
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    for (let t = 0; t <= 1; t += 0.1) out.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
  }
  return out;
}

function leaderPoints([ax, ay]: Point, r: Rect, knee: number): Point[] {
  if (r.x >= ax || r.x + r.w <= ax) {
    const left = r.x + r.w <= ax;
    const edgeX = left ? r.x + r.w : r.x;
    const edgeY = r.y + r.h / 2;
    return [[ax, ay], [left ? edgeX + knee : edgeX - knee, edgeY], [edgeX, edgeY]];
  }
  return [[ax, ay], [ax, r.y >= ay ? r.y : r.y + r.h]];
}

type Layout = {
  unit: number;
  placed: Rect[];
  lines: Point[][];
  countries: Rect[];
  anchors: Rect[];
};

function candidates([ax, ay]: Point, w: number, h: number, unit: number): Rect[] {
  const out: Rect[] = [];
  for (const offset of SIDE_OFFSETS) {
    for (const shift of SHIFTS) {
      const y = ay - h / 2 + shift * unit;
      out.push({ x: ax + offset * unit, y, w, h }, { x: ax - offset * unit - w, y, w, h });
    }
  }
  for (const offset of STACK_OFFSETS) {
    out.push({ x: ax - w / 2, y: ay - offset * unit - h, w, h }, { x: ax - w / 2, y: ay + offset * unit, w, h });
  }
  return out;
}

function place(anchor: Point, own: number, w: number, layout: Layout): { rect: Rect; line: Point[] } {
  const { unit, placed, lines, countries, anchors } = layout;
  const h = CALLOUT.height * unit;
  const margin = MARGIN * unit;
  const gap = GAP * unit;
  const inBounds = (r: Rect) =>
    r.x >= margin && r.y >= margin && r.x + r.w <= MAP_WIDTH - margin && r.y + r.h <= MAP_HEIGHT - margin;

  let best: { rect: Rect; line: Point[] } | null = null;
  let bestCost = Infinity;
  for (const r of candidates(anchor, w, h, unit)) {
    if (!inBounds(r)) continue;
    if (placed.some((p) => overlapArea(grow(p, gap), r) > 0)) continue;
    const line = leaderPoints(anchor, r, KNEE * unit);
    const ownSamples = sample(line);
    let cost = Math.hypot(r.x + r.w / 2 - anchor[0], r.y + r.h / 2 - anchor[1]) / unit;
    for (const c of countries) cost += (overlapArea(r, c) / (unit * unit)) * COUNTRY_HIT;
    anchors.forEach((a, i) => {
      if (i === own) return;
      if (overlapArea(r, a) > 0) cost += ANCHOR_COVER;
      if (ownSamples.some((p) => contains(a, p))) cost += ANCHOR_CROSS;
    });
    for (const p of placed) if (ownSamples.some((pt) => contains(grow(p, gap / 2), pt))) cost += LINE_HIT;
    for (const l of lines) if (sample(l).some((pt) => contains(grow(r, gap / 2), pt))) cost += LINE_HIT;
    if (cost < bestCost) {
      bestCost = cost;
      best = { rect: r, line };
    }
  }
  if (best) return best;
  const rect = { x: Math.min(anchor[0] + SIDE_OFFSETS[0] * unit, MAP_WIDTH - margin - w), y: anchor[1] - h / 2, w, h };
  return { rect, line: leaderPoints(anchor, rect, KNEE * unit) };
}

export function buildSpotlights(
  shapes: CountryShape[],
  byName: Map<string, number>,
  limit: number,
  scale: number,
): Spotlight[] {
  const total = [...byName.values()].reduce((s, v) => s + v, 0);
  if (!total || scale <= 0) return [];

  const unit = 1 / scale;
  const ranked = shapes
    .filter((s) => s.code && (byName.get(s.name) ?? 0) > 0)
    .sort((a, b) => (byName.get(b.name) ?? 0) - (byName.get(a.name) ?? 0))
    .slice(0, Math.min(limit, SPOTLIGHT_TONES.length))
    .filter(({ anchor: [x, y] }) => x >= 0 && x <= MAP_WIDTH && y >= 0 && y <= MAP_HEIGHT);

  const layout: Layout = {
    unit,
    placed: [],
    lines: [],
    countries: ranked.map((s) => grow(shapeRect(s), 2 * unit)),
    anchors: ranked.map(({ anchor: [x, y] }) => {
      const b = ANCHOR_BOX * unit;
      return { x: x - b, y: y - b, w: b * 2, h: b * 2 };
    }),
  };

  return ranked.map((shape, index) => {
    const count = byName.get(shape.name) ?? 0;
    const fullName = countryShortName(shape.code as string);
    const label = fit(fullName);
    const width = Math.ceil(CALLOUT.padLeft + Math.max(MIN_TEXT, label.length * CHAR_WIDTH) + PAD_RIGHT);
    const { rect, line } = place(shape.anchor, index, width * unit, layout);
    layout.placed.push(rect);
    layout.lines.push(line);
    return {
      shape,
      label,
      fullName,
      count,
      share: count / total,
      tone: toneFor(shape.code as string, index),
      x: rect.x,
      y: rect.y,
      width,
      unit,
      leader: line.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" "),
    };
  });
}

export function formatShare(share: number): string {
  const pct = share * 100;
  if (pct > 0 && pct < 1) return "<1%";
  return `${Math.round(pct)}%`;
}
