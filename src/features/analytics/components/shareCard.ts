/**
 * The share card image, drawn with the 2D canvas API.
 *
 * Deliberately not a screenshot of the dashboard: html2canvas-style capture
 * pulls in a dependency, fails on cross-origin fonts, and produces something
 * unreadable at feed size. A purpose-built card is legible in a thumbnail,
 * renders identically in every browser, and — because it is drawn rather than
 * captured — can only ever contain the numbers we hand it, which matters when
 * the output is about to be posted publicly.
 *
 * Everything is drawn at 2x and the canvas is sized 1200x630 (the Open Graph
 * ratio every platform crops to), so the PNG stays sharp on retina feeds.
 */

export type ShareCardStats = {
  visitors: number;
  pageviews: number;
  /** Omitted from the card when null — an unpublished panel has no number. */
  live: number | null;
};

export type ShareCardInput = {
  workspace: string;
  /** Shown under the numbers so the card carries its own destination. */
  url: string;
  /** Human range label, e.g. "Last 30 days". */
  rangeLabel: string;
  stats: ShareCardStats;
  /** Wording for the three tiles and the footer, from the interface language. */
  labels: {
    visitors: string;
    pageviews: string;
    live: string;
    badge: string;
  };
};

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

/** Compact figures — a card with `1,482,904` on it reads as noise at feed size. */
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

/** Strip the scheme so the footer reads as a destination rather than a URL. */
function prettyLink(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** The brand mark, drawn as paths so the card needs no image asset. */
function drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const scale = size / 36;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const grad = ctx.createLinearGradient(4, 4, 32, 32);
  grad.addColorStop(0, "#34d399");
  grad.addColorStop(1, "#059669");
  ctx.fillStyle = grad;
  roundedRect(ctx, 1, 1, 34, 34, 11);
  ctx.fill();

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(8, 19);
  ctx.lineTo(12.2, 19);
  ctx.lineTo(14.5, 11.5);
  ctx.lineTo(18.5, 26.5);
  ctx.lineTo(21.1, 15.5);
  ctx.lineTo(22.8, 19);
  ctx.lineTo(28, 19);
  ctx.stroke();

  ctx.restore();
}

/** A decorative sparkline. Shape only — no real series is published here. */
function drawSparkline(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const points = [0.22, 0.45, 0.3, 0.62, 0.5, 0.78, 0.66, 0.92, 0.8, 1];
  const step = w / (points.length - 1);
  const at = (i: number) => ({ px: x + i * step, py: y + h - points[i] * h });

  const line = ctx.createLinearGradient(x, 0, x + w, 0);
  line.addColorStop(0, "#34d399");
  line.addColorStop(1, "#6ee7b7");

  ctx.beginPath();
  ctx.moveTo(at(0).px, at(0).py);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(at(i).px, at(i).py);

  const fillPath = new Path2D();
  fillPath.moveTo(at(0).px, at(0).py);
  for (let i = 1; i < points.length; i += 1) fillPath.lineTo(at(i).px, at(i).py);
  fillPath.lineTo(x + w, y + h);
  fillPath.lineTo(x, y + h);
  fillPath.closePath();

  const area = ctx.createLinearGradient(0, y, 0, y + h);
  area.addColorStop(0, "rgba(52, 211, 153, 0.35)");
  area.addColorStop(1, "rgba(52, 211, 153, 0)");
  ctx.fillStyle = area;
  ctx.fill(fillPath);

  ctx.strokeStyle = line;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

/** Truncate to fit a width, measuring in the font already set on the context. */
function fit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && ctx.measureText(`${out}…`).width > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out}…`;
}

/**
 * Draw the card and hand back a data URL.
 *
 * Synchronous by design: the only font used is the system UI stack, so there is
 * nothing to wait on and the preview can re-render on every keystroke without
 * scheduling.
 */
export function renderShareCard(input: ShareCardInput): string {
  const dpr = 2;
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH * dpr;
  canvas.height = CARD_HEIGHT * dpr;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.scale(dpr, dpr);

  // Background — a dark slab, so the card reads the same whether the feed
  // around it is light or dark.
  const bg = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  bg.addColorStop(0, "#121317");
  bg.addColorStop(1, "#0b1a16");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // A soft emerald glow bottom-right, mirroring the app's own surfaces.
  const glow = ctx.createRadialGradient(1050, 560, 40, 1050, 560, 520);
  glow.addColorStop(0, "rgba(16, 185, 129, 0.28)");
  glow.addColorStop(1, "rgba(16, 185, 129, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const font = (weight: number, size: number) =>
    `${weight} ${size}px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;

  // Header: mark, wordmark, and the "public dashboard" badge.
  drawLogo(ctx, 72, 64, 56);
  ctx.fillStyle = "#f4f6f8";
  ctx.font = font(700, 30);
  ctx.textBaseline = "middle";
  ctx.fillText("Quantalog", 146, 93);

  ctx.font = font(600, 20);
  const badge = input.labels.badge.toUpperCase();
  const badgeWidth = ctx.measureText(badge).width + 44;
  ctx.fillStyle = "rgba(52, 211, 153, 0.14)";
  roundedRect(ctx, CARD_WIDTH - 72 - badgeWidth, 74, badgeWidth, 40, 20);
  ctx.fill();
  ctx.fillStyle = "#6ee7b7";
  ctx.textAlign = "center";
  ctx.fillText(badge, CARD_WIDTH - 72 - badgeWidth / 2, 95);
  ctx.textAlign = "left";

  // Workspace name — the headline of the card.
  ctx.fillStyle = "#ffffff";
  ctx.font = font(800, 64);
  ctx.fillText(fit(ctx, input.workspace, CARD_WIDTH - 144), 72, 214);

  ctx.fillStyle = "#8d94a5";
  ctx.font = font(500, 26);
  ctx.fillText(input.rangeLabel, 72, 266);

  // Stat tiles. `live` drops out when the owner has not published totals, and
  // the remaining tiles widen to fill the row rather than leaving a hole.
  const tiles = [
    { label: input.labels.visitors, value: compact(input.stats.visitors), accent: "#34d399" },
    { label: input.labels.pageviews, value: compact(input.stats.pageviews), accent: "#f4f6f8" },
    ...(input.stats.live === null
      ? []
      : [{ label: input.labels.live, value: compact(input.stats.live), accent: "#34d399" }]),
  ];

  const gap = 24;
  const tileWidth = (CARD_WIDTH - 144 - gap * (tiles.length - 1)) / tiles.length;
  const tileY = 312;
  const tileHeight = 148;

  tiles.forEach((tile, i) => {
    const x = 72 + i * (tileWidth + gap);
    ctx.fillStyle = "rgba(255, 255, 255, 0.045)";
    roundedRect(ctx, x, tileY, tileWidth, tileHeight, 22);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = tile.accent;
    ctx.font = font(800, 56);
    ctx.fillText(fit(ctx, tile.value, tileWidth - 56), x + 28, tileY + 60);

    ctx.fillStyle = "#8d94a5";
    ctx.font = font(600, 22);
    ctx.fillText(fit(ctx, tile.label, tileWidth - 56), x + 28, tileY + 110);
  });

  drawSparkline(ctx, 72, 494, CARD_WIDTH - 144, 62);

  // Footer: the link, so a screenshot of the card is still actionable.
  ctx.fillStyle = "#6b7280";
  ctx.font = font(500, 22);
  ctx.fillText(fit(ctx, prettyLink(input.url), CARD_WIDTH - 144), 72, 590);

  return canvas.toDataURL("image/png");
}

/**
 * Save a rendered card.
 *
 * A data URL on an `<a download>` rather than a blob: the image is at most a
 * few hundred kilobytes, and this avoids an object URL that has to be revoked
 * on a path where the click may never fire.
 */
export function downloadShareCard(dataUrl: string, workspace: string) {
  const slug = workspace.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "dashboard";
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${slug}-analytics.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
