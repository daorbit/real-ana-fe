import { forwardRef, useId, type ReactNode } from "react";
import type { LucideProps } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";

export const LeadMagnetIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ color = "currentColor", size = 24, strokeWidth = 1.8, ...props }, ref) => {
    const iconSize = typeof size === "number" && size === 17 ? 20 : size;

    return (
    <svg
      ref={ref}
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color={color}
      {...props}
    >
      <path d="M4 6.5C6 6.5 7.5 8 7.5 10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M4 3.5C7.8 3.5 10.5 6.5 10.5 10" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M6 17H14" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M11 14L14 17L11 20" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="17.5" cy="10" r="3.5" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="17.5" cy="10" r="1" fill="currentColor" />
    </svg>
    );
  },
);

LeadMagnetIcon.displayName = "LeadMagnetIcon";

const DETAILED_ICON_MIN_SIZE = 18;

export function detailedIconSize(size: LucideProps["size"]) {
  return typeof size === "number" ? Math.max(size, DETAILED_ICON_MIN_SIZE) : size;
}

const ICON_TONES = {
  red: { top: "#ff8073", bottom: "#e0352c" },
  yellow: { top: "#ffdc7a", bottom: "#f4a51c" },
  orange: { top: "#ffb56e", bottom: "#ec7418" },
  blue: { top: "#74baff", bottom: "#1d6fe8" },
  deepBlue: { top: "#2f7ff0", bottom: "#134fbd" },
  green: { top: "#62dfa0", bottom: "#14a35f" },
  deepGreen: { top: "#128a52", bottom: "#0c6f41" },
  purple: { top: "#ad9fff", bottom: "#6548ec" },
  deepPurple: { top: "#5f45dc", bottom: "#4730b4" },
  slate: { top: "#b8c4d6", bottom: "#62718a" },
  paper: { top: "#ffffff", bottom: "#dbe3f0" },
};

export type IconTone = keyof typeof ICON_TONES;

export function colorIcon(
  displayName: string,
  tones: IconTone[],
  renderShapes: (paint: (tone: IconTone) => string) => ReactNode,
) {
  const Icon = forwardRef<SVGSVGElement, LucideProps>(({ size = 24, ...props }, ref) => {
    const id = useId().replace(/[^a-zA-Z0-9]/g, "");
    const iconSize = detailedIconSize(size);
    return (
      <svg
        ref={ref}
        width={iconSize}
        height={iconSize}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <defs>
          {tones.map((tone) => (
            <linearGradient key={tone} id={`${id}${tone}`} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor={ICON_TONES[tone].top} />
              <stop offset="1" stopColor={ICON_TONES[tone].bottom} />
            </linearGradient>
          ))}
        </defs>
        {renderShapes((tone) => `url(#${id}${tone})`)}
      </svg>
    );
  });
  Icon.displayName = displayName;
  return Icon;
}

/**
 * Orbit's rail row uses the product's own mark, not a line glyph.
 *
 * It is the same artwork the assistant carries everywhere else, so the row is
 * recognisable as Orbit at a glance rather than as one more outline in a column
 * of outlines. The cost is that it cannot take the rail's active tint the way a
 * `currentColor` path does — worth it for a mark people already know.
 *
 * Typed as a Lucide icon because that is what the rail's `NavItem` expects, and
 * it is rendered as `<Icon size={17} />` like every other row.
 */
export const OrbitNavIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24 }, _ref) => <OrbitMark size={typeof size === "number" ? size : 17} />,
);

OrbitNavIcon.displayName = "OrbitNavIcon";
