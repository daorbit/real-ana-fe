export type MetricTileChange = { text: string; good: boolean; flat: boolean };

export function percentChange(delta: number | null | undefined, inverse = false): MetricTileChange | null {
  if (delta === null || delta === undefined || !Number.isFinite(delta)) return null;
  const abs = Math.abs(delta);
  if (abs < 0.5) return { text: "±0%", good: true, flat: true };
  const up = delta > 0;
  return {
    text: `${up ? "+" : "−"}${abs.toFixed(abs < 10 ? 1 : 0)}%`,
    good: inverse ? !up : up,
    flat: false,
  };
}
