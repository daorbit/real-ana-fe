import type { ArtMotif } from "./templateTypes";

const INK = "rgba(255,255,255,0.88)";
const SOFT = "rgba(255,255,255,0.32)";

const MOTIFS: Record<ArtMotif, string> = {
  disc: `<circle cx="200" cy="200" r="120" fill="none" stroke="${SOFT}" stroke-width="2"/><circle cx="200" cy="200" r="90" fill="none" stroke="${SOFT}" stroke-width="2"/><circle cx="200" cy="200" r="60" fill="${INK}"/><circle cx="200" cy="200" r="10" fill="rgba(0,0,0,0.35)"/>`,
  sun: `<circle cx="200" cy="180" r="84" fill="${INK}"/><rect x="0" y="250" width="400" height="150" fill="rgba(0,0,0,0.28)"/><rect x="60" y="262" width="280" height="6" rx="3" fill="${SOFT}"/><rect x="110" y="282" width="180" height="6" rx="3" fill="${SOFT}"/>`,
  wave: `<path d="M0 220 C 60 160, 120 160, 180 220 S 300 280, 400 200" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M0 270 C 60 210, 120 210, 180 270 S 300 330, 400 250" fill="none" stroke="${SOFT}" stroke-width="10" stroke-linecap="round"/>`,
  bars: [70, 140, 210, 110, 180, 90, 150]
    .map((h, i) => `<rect x="${52 + i * 44}" y="${300 - h}" width="28" height="${h}" rx="6" fill="${i % 2 ? SOFT : INK}"/>`)
    .join(""),
  grid: [0, 1, 2]
    .flatMap((r) => [0, 1, 2].map((c) => `<rect x="${80 + c * 84}" y="${80 + r * 84}" width="72" height="72" rx="14" fill="${(r + c) % 2 ? SOFT : INK}"/>`))
    .join(""),
  person: `<circle cx="200" cy="160" r="64" fill="${INK}"/><path d="M90 340 C 100 260, 300 260, 310 340 Z" fill="${INK}"/>`,
  plate: `<circle cx="200" cy="200" r="118" fill="${SOFT}"/><circle cx="200" cy="200" r="84" fill="${INK}"/><rect x="58" y="110" width="10" height="180" rx="5" fill="${INK}"/><rect x="332" y="110" width="10" height="180" rx="5" fill="${INK}"/>`,
  house: `<path d="M200 90 L320 190 V310 H80 V190 Z" fill="${INK}"/><rect x="176" y="236" width="48" height="74" rx="6" fill="rgba(0,0,0,0.3)"/>`,
};

export function sampleArt(color: string, motif: ArtMotif): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="${color}"/>${MOTIFS[motif]}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
