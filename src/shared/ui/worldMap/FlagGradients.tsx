import { FLAG_PALETTES, GRADIENT_VECTOR } from "./flagPalette";

export const flagGradientId = (code: string) => `wm-flag-${code}`;

export function FlagGradients({ codes }: { codes: string[] }) {
  return (
    <defs>
      {codes.map((code) => {
        const palette = FLAG_PALETTES[code];
        if (!palette) return null;
        const { x2, y2 } = GRADIENT_VECTOR[palette.dir];
        const last = palette.colors.length - 1;
        return (
          <linearGradient key={code} id={flagGradientId(code)} x1={0} y1={0} x2={x2} y2={y2}>
            {palette.colors.map((color, i) => (
              <stop key={i} offset={last === 0 ? 0 : i / last} stopColor={color} />
            ))}
          </linearGradient>
        );
      })}
    </defs>
  );
}
