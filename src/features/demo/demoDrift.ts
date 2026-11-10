const TAU = Math.PI * 2;

export function demoDrift(seed: number, amplitude: number, periodMs = 6 * 60_000, now = Date.now()): number {
  const t = now / periodMs;
  const wave = Math.sin(t * TAU + seed) * 0.6 + Math.sin(t * TAU * 2.7 + seed * 1.7) * 0.4;
  return 1 + amplitude * wave;
}

export function roundTo(value: number, digits = 1): number {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

export function changePct(current: number, previous: number): number {
  return previous ? roundTo(((current - previous) / previous) * 100) : 0;
}
