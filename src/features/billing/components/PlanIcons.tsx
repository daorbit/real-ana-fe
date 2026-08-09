// Inline SVG plan marks — self-contained, no external images (survive strict
// CSP), same convention as Brand.tsx's Logo.
//
// One glyph across all three tiers, recoloured per plan. A different shape per
// tier made each badge its own puzzle; a single diamond that changes colour
// reads as one scale, and colour alone carries the ranking — slate, green,
// gold — the way tier badges usually do.
//
// Traced from public/proPlanIcon.svg. If that asset is replaced, re-trace
// rather than hand-editing the paths below.

/**
 * Free's gradient: deep red through a warm bright band and back.
 *
 * Built like Pro's — three stops with the highlight off-centre — so the free
 * mark reads as the same family of object rather than a lesser one. The stops
 * stay dark enough that the white glyph on top holds its contrast.
 */
const FREE_GRADIENT = ["#b91c1c", "#f87171", "#dc2626"] as const;

/** Starter's gradient, violet through to indigo. */
const STARTER_GRADIENT = ["#a855f7", "#6366f1"] as const;

/**
 * Pro's gradient: deep amber, a bright band, then amber again.
 *
 * Three stops rather than two — a flat two-colour ramp reads as a tint, while a
 * light stop partway across reads as a highlight catching the facets. The
 * bright stop sits at 45% rather than dead centre so the shine falls off-axis,
 * which is where a real one would be.
 */
const PRO_GRADIENT = ["#b45309", "#fcd34d", "#d97706"] as const;

/**
 * One solid colour per tier, for anything that sits beside the icon — a
 * ribbon, a border, a highlight.
 *
 * Exported so those never drift from the marks themselves. Deliberately not
 * the app's emerald: emerald is the accent for *state* (active, current,
 * yours), and reusing it for tier identity makes every plan look equally
 * endorsed and leaves nothing to distinguish the recommended one.
 */
export const PLAN_ACCENTS: Record<string, string> = {
  free: "#dc2626", // red, the midpoint of the Free gradient
  starter: "#8b5cf6", // violet, the midpoint of the Starter gradient
  pro: "#d9a441", // gold
};

/**
 * The same ramps as the icons, as CSS gradients.
 *
 * For surfaces beside the mark — a ribbon, a button — so a Pro flag catches the
 * light the way the Pro diamond does instead of sitting next to it as a flat
 * swatch. Angled at 135° to match the icons' top-left-to-bottom-right fill.
 *
 * Callers fall back to `PLAN_ACCENTS` when a slug is missing here.
 */
export const PLAN_GRADIENTS: Record<string, string> = {
  // Not the icon's ramp. Same trap Pro documents: the icon's highlight
  // (#f87171) gives white text only 2.77:1, under the 3.0 floor for bold text.
  // Every stop here clears it — 4.83, 3.76, 3.82 — so the label stays legible
  // wherever it falls across the ribbon.
  free: "linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #e05252 100%)",
  starter: `linear-gradient(135deg, ${STARTER_GRADIENT[0]}, ${STARTER_GRADIENT[1]})`,
  // Pro's surface ramp is lighter than the icon's. The icon carries no text, so
  // it can run down to a deep amber; a ribbon has a label on top, and dark text
  // on that same amber measures 2.88:1 — under the 3.0 floor for bold text.
  // Starting at #d97706 keeps every point of the ramp above it.
  pro: "linear-gradient(135deg, #d97706 0%, #fcd34d 50%, #e59819 100%)",
};

/**
 * Text colour to put on top of each tier's fill.
 *
 * Not always white. Pro's ramp runs through a bright band (`#fcd34d`) that
 * white text disappears into — legibility has to follow the fill rather than
 * assume a dark one, so the gold tiers take near-black instead.
 */
export const PLAN_ON_ACCENT: Record<string, string> = {
  free: "#ffffff",
  starter: "#ffffff",
  pro: "#3b2503",
};

/**
 * The diamond, as seven flat facets.
 *
 * Traced from public/proPlanIcon.svg on a 512 grid and carried here verbatim so
 * the mark cannot drift from the asset. Every path inherits `fill` from the
 * `<g>`, which is what lets one shape serve three tiers.
 */
function DiamondPaths() {
  return (
    <>
      <path d="M0 0 C69.3 0 138.6 0 210 0 C208.05 7.17 206.03 14.12 203.59 21.11 C203.26 22.05 202.93 22.99 202.6 23.96 C201.53 27.03 200.45 30.11 199.38 33.19 C198.61 35.38 197.85 37.57 197.09 39.76 C191.66 55.32 186.16 70.85 180.64 86.37 C174.22 104.45 167.95 122.58 161.72 140.73 C155.73 158.14 149.65 175.53 143.48 192.88 C136.55 212.32 129.82 231.83 123.13 251.36 C117.55 267.62 111.82 283.82 106 300 C105.34 300 104.68 300 104 300 C103.82 299.47 103.64 298.95 103.45 298.41 C91.89 265.03 91.89 265.03 80.25 231.69 C79.98 230.91 79.71 230.14 79.43 229.34 C77.96 225.14 76.49 220.95 75.02 216.76 C71.13 205.68 67.25 194.6 63.37 183.51 C62.91 182.21 62.46 180.91 62.01 179.61 C55.37 160.67 48.77 141.71 42.21 122.74 C37.06 107.87 31.83 93.02 26.56 78.19 C20.7 61.7 14.9 45.19 9.16 28.66 C8.35 26.31 7.54 23.97 6.72 21.63 C5.59 18.38 4.46 15.13 3.34 11.88 C3 10.91 2.66 9.93 2.31 8.93 C2 8.04 1.7 7.15 1.38 6.24 C1.11 5.46 0.85 4.69 0.57 3.89 C0 2 0 2 0 0 Z" transform="translate(143,169)" />
      <path d="M0 0 C39.27 0 78.54 0 119 0 C128.63 27.56 128.63 27.56 133.3 40.94 C137.55 53.12 141.8 65.3 146.06 77.48 C148.14 83.44 150.23 89.41 152.31 95.38 C152.54 96.03 152.77 96.68 153 97.36 C159.36 115.54 165.69 133.74 172 151.94 C176.84 165.89 181.68 179.84 186.55 193.78 C187.14 195.45 187.72 197.12 188.3 198.79 C191.19 207.07 194.11 215.33 197.13 223.56 C197.61 224.88 198.09 226.2 198.57 227.52 C199.45 229.93 200.34 232.33 201.25 234.73 C201.63 235.77 202.01 236.82 202.4 237.89 C202.9 239.24 202.9 239.24 203.42 240.61 C204.04 243.18 203.88 244.54 203 247 C197.79 240.87 192.58 234.74 187.5 228.5 C184.21 224.46 180.87 220.47 177.5 216.5 C173.38 211.65 169.33 206.75 165.32 201.82 C162.72 198.66 160.08 195.55 157.44 192.44 C153.57 187.89 149.8 183.27 146.09 178.59 C143.17 174.97 140.15 171.43 137.14 167.89 C134.22 164.45 131.34 160.99 128.5 157.5 C125.21 153.46 121.87 149.47 118.5 145.5 C112.85 138.85 107.33 132.1 101.83 125.33 C97.31 119.78 92.72 114.29 88.09 108.84 C84.44 104.54 80.87 100.18 77.31 95.81 C74.74 92.68 72.12 89.59 69.5 86.5 C63.85 79.85 58.33 73.1 52.83 66.33 C48.31 60.78 43.72 55.29 39.09 49.84 C35.44 45.54 31.87 41.18 28.31 36.81 C25.74 33.68 23.12 30.59 20.5 27.5 C0 3.35 0 3.35 0 0 Z" transform="translate(0,169)" />
      <path d="M0 0 C39.27 0 78.54 0 119 0 C118.07 3.72 117.75 4.64 115.38 7.29 C114.57 8.2 114.57 8.2 113.75 9.13 C112.88 10.08 112.88 10.08 112 11.06 C110.8 12.41 109.61 13.77 108.41 15.12 C107.83 15.78 107.24 16.45 106.64 17.13 C104.49 19.58 102.43 22.09 100.38 24.63 C97.13 28.63 93.84 32.58 90.5 36.5 C86.45 41.27 82.46 46.08 78.5 50.93 C70.69 60.51 62.84 70.05 54.83 79.47 C51.27 83.66 47.79 87.92 44.31 92.19 C41.74 95.32 39.12 98.41 36.5 101.5 C31.59 107.28 26.78 113.12 22 119 C16.76 125.45 11.46 131.83 6.09 138.16 C3.19 141.58 0.33 145.02 -2.5 148.5 C-5.79 152.54 -9.13 156.53 -12.5 160.5 C-17.41 166.28 -22.22 172.12 -27 178 C-32.24 184.45 -37.54 190.83 -42.91 197.16 C-45.81 200.58 -48.67 204.02 -51.5 207.5 C-54.79 211.54 -58.13 215.53 -61.5 219.5 C-69.17 228.53 -76.62 237.73 -84 247 C-85.27 243.42 -84.72 241.35 -83.46 237.82 C-82.91 236.25 -82.91 236.25 -82.35 234.65 C-81.94 233.51 -81.52 232.38 -81.1 231.21 C-80.46 229.38 -79.81 227.55 -79.16 225.72 C-78.47 223.77 -77.77 221.81 -77.07 219.86 C-75.61 215.78 -74.16 211.69 -72.72 207.6 C-71.24 203.43 -69.76 199.26 -68.28 195.09 C-64.22 183.65 -60.23 172.19 -56.28 160.72 C-50.16 142.99 -43.93 125.3 -37.65 107.63 C-30.31 87.01 -23.18 66.31 -16.08 45.6 C-10.84 30.35 -5.43 15.19 0 0 Z" transform="translate(377,169)" />
      <path d="M0 0 C4.33 1.58 6.73 4.93 9.56 8.38 C10.63 9.65 11.7 10.93 12.77 12.2 C13.31 12.84 13.85 13.48 14.41 14.14 C16.76 16.89 19.22 19.54 21.69 22.19 C25.06 25.81 28.28 29.51 31.38 33.38 C35.43 38.41 39.77 43.1 44.2 47.81 C48.22 52.1 51.95 56.56 55.63 61.16 C58.46 64.56 61.46 67.78 64.5 71 C69.14 75.92 73.5 80.97 77.72 86.25 C80.84 90.02 84.17 93.58 87.55 97.12 C91 100.79 91 100.79 91 103 C31.6 103 -27.8 103 -89 103 C-87.08 99.15 -85.22 96.87 -82.31 93.75 C-81.4 92.76 -80.49 91.77 -79.57 90.79 C-78.72 89.87 -77.88 88.95 -77 88 C-73.7 84.31 -70.47 80.55 -67.25 76.78 C-61.67 70.24 -56.03 63.78 -50.22 57.43 C-46.14 52.96 -42.18 48.39 -38.25 43.78 C-32.67 37.24 -27.03 30.78 -21.22 24.43 C-13.95 16.47 -7.01 8.2 0 0 Z" transform="translate(247,43)" />
      <path d="M0 0 C38.61 0 77.22 0 117 0 C115.01 7.31 112.94 14.4 110.45 21.53 C110.11 22.5 109.77 23.48 109.42 24.48 C108.33 27.64 107.23 30.79 106.13 33.94 C105.37 36.12 104.61 38.3 103.85 40.48 C97.38 59.04 90.75 77.54 84 96 C79.22 92.12 75.1 88.05 71.19 83.31 C70.15 82.08 69.11 80.84 68.06 79.61 C67.55 79 67.04 78.39 66.51 77.76 C63.5 74.24 60.35 70.85 57.22 67.43 C53.14 62.96 49.18 58.39 45.25 53.78 C39.67 47.24 34.03 40.78 28.22 34.43 C22.48 28.14 16.96 21.64 11.43 15.16 C8.05 11.2 4.62 7.3 1.11 3.45 C0 2 0 2 0 0 Z" transform="translate(280,43)" />
      <path d="M0 0 C38.61 0 77.22 0 117 0 C114.96 4.08 112.47 7.16 109.5 10.56 C108.97 11.18 108.43 11.8 107.88 12.43 C103.73 17.21 99.5 21.9 95.22 26.57 C91.14 31.04 87.18 35.61 83.25 40.22 C77.67 46.76 72.03 53.22 66.22 59.57 C62.15 64.02 58.2 68.58 54.29 73.18 C47.68 80.94 40.94 88.54 34 96 C31.75 93.75 31.25 92.29 30.24 89.31 C29.73 87.84 29.73 87.84 29.21 86.33 C28.84 85.26 28.48 84.18 28.11 83.07 C27.72 81.96 27.34 80.84 26.94 79.68 C25.68 76.02 24.44 72.35 23.19 68.69 C21.47 63.67 19.75 58.65 18.02 53.63 C17.59 52.36 17.16 51.1 16.73 49.84 C14.13 42.28 11.51 34.73 8.85 27.19 C8.54 26.32 8.24 25.44 7.92 24.54 C6.77 21.3 5.62 18.06 4.47 14.83 C3.7 12.67 2.94 10.51 2.18 8.36 C1.75 7.17 1.33 5.98 0.89 4.75 C0 2 0 2 0 0 Z" transform="translate(99,43)" />
      <path d="M0 0 C0.66 0 1.32 0 2 0 C9.21 19.95 16.18 39.98 23.11 60.03 C23.47 61.06 23.83 62.1 24.2 63.17 C24.87 65.11 25.54 67.05 26.21 69 C28.15 74.59 30.16 80.15 32.26 85.68 C33 88 33 88 33 91 C-3.3 91 -39.6 91 -77 91 C-74.29 86.94 -72.05 83.79 -68.81 80.31 C-65.61 76.81 -62.54 73.26 -59.56 69.56 C-55.7 64.79 -51.63 60.27 -47.47 55.75 C-45.06 53.06 -42.77 50.31 -40.5 47.5 C-36.66 42.74 -32.61 38.24 -28.47 33.75 C-25.27 30.19 -22.29 26.48 -19.29 22.76 C-16.11 18.93 -12.74 15.31 -9.37 11.66 C-6.5 8.44 -3.91 5.06 -1.38 1.58 C-0.92 1.06 -0.47 0.54 0 0 Z" transform="translate(77,55)" />
      <path d="M0 0 C0.66 0 1.32 0 2 0 C3.39 1.55 4.71 3.17 6 4.81 C9.22 8.84 12.5 12.71 16 16.5 C20.09 20.95 23.92 25.55 27.72 30.25 C30.07 33.08 32.51 35.79 35 38.5 C39.11 42.97 42.97 47.59 46.79 52.32 C48.96 54.95 51.2 57.48 53.5 60 C57.39 64.27 61.03 68.69 64.66 73.19 C67.94 77.13 71.42 80.86 74.93 84.59 C77 87 77 87 79 91 C42.7 91 6.4 91 -31 91 C-29.62 84.78 -28.13 79.04 -26.02 73.09 C-25.58 71.83 -25.58 71.83 -25.13 70.55 C-24.17 67.82 -23.21 65.1 -22.25 62.38 C-21.58 60.48 -20.92 58.58 -20.25 56.68 C-13.6 37.75 -6.82 18.87 0 0 Z" transform="translate(417,55)" />
    </>
  );
}

/**
 * The mark at a given size and colour.
 *
 * The 512 viewBox is the asset's own grid — scaling happens through `width`
 * and `height` rather than by rewriting coordinates, so the paths stay
 * comparable to the source file.
 */
function Diamond({
  size,
  color,
  gradient,
  uid,
}: {
  size: number;
  /** Flat fill. Ignored when `gradient` is given. */
  color?: string;
  /**
   * Colour stops, drawn top-left to bottom-right. Two ramps evenly; three puts
   * the middle stop at 45%, off-centre, so a highlight reads as a highlight
   * rather than a stripe.
   */
  gradient?: readonly string[];
  /**
   * Disambiguates the gradient's element id.
   *
   * SVG gradient ids are global to the document, so two icons rendering
   * `<linearGradient id="starter">` would leave the second one referencing the
   * first's definition. Every call site that can appear more than once on a
   * page passes its own `uid`.
   */
  uid?: string;
}) {
  const gradientId = gradient ? `plan-grad-${uid ?? "default"}` : null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      {gradient && gradientId && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            {gradient.map((stop, i) => (
              <stop
                key={i}
                // Three stops put the highlight at 45%; anything else spaces
                // evenly across the ramp.
                offset={
                  gradient.length === 3 && i === 1
                    ? "45%"
                    : `${(i / (gradient.length - 1)) * 100}%`
                }
                stopColor={stop}
              />
            ))}
          </linearGradient>
        </defs>
      )}
      <g fill={gradientId ? `url(#${gradientId})` : color}>
        <DiamondPaths />
      </g>
    </svg>
  );
}

/** Free — a red gradient with a highlight band, the entry tier. */
export function FreePlanIcon({ size = 24, uid }: { size?: number; uid?: string }) {
  return <Diamond size={size} gradient={FREE_GRADIENT} uid={uid ?? "free"} />;
}

/** Starter — a violet-to-indigo gradient, the first paid step. */
export function StarterPlanIcon({ size = 24, uid }: { size?: number; uid?: string }) {
  return <Diamond size={size} gradient={STARTER_GRADIENT} uid={uid ?? "starter"} />;
}

/** Pro — a gold gradient with a highlight band, the top tier. */
export function ProPlanIcon({ size = 24, uid }: { size?: number; uid?: string }) {
  return <Diamond size={size} gradient={PRO_GRADIENT} uid={uid ?? "pro"} />;
}

export type PlanSlug = "free" | "starter" | "pro";

const ICONS: Record<PlanSlug, typeof FreePlanIcon> = {
  free: FreePlanIcon,
  starter: StarterPlanIcon,
  pro: ProPlanIcon,
};

/**
 * Pick the right badge by plan slug, falling back to the Starter mark for any
 * tier added later.
 *
 * `uid` is passed through, not swallowed: the gradient tiers define an SVG
 * gradient by id, and the same plan rendered twice on one page (a card and a
 * checkout dialog, say) would otherwise emit the same id twice.
 */
export function PlanIcon({
  slug,
  size = 24,
  uid,
}: {
  slug: string;
  size?: number;
  uid?: string;
}) {
  const Icon = ICONS[slug as PlanSlug] ?? StarterPlanIcon;
  return <Icon size={size} uid={uid ? `${slug}-${uid}` : slug} />;
}
