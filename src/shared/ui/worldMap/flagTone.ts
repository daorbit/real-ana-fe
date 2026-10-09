import { FLAG_PALETTES } from "./flagPalette";

function hsl(hex: string): { s: number; l: number } {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { s, l };
}

export function flagAccent(code: string): string | null {
  const palette = FLAG_PALETTES[code];
  if (!palette) return null;
  let best: string | null = null;
  let bestScore = 0;
  for (const color of palette.colors) {
    const { s, l } = hsl(color);
    if (l < 0.25 || l > 0.85) continue;
    const score = s * (1 - Math.abs(l - 0.5));
    if (score > bestScore) {
      bestScore = score;
      best = color;
    }
  }
  return best;
}
