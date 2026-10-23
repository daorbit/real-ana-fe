import { forwardRef } from "react";
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

function outlineIcon(displayName: string, paths: string[]) {
  const Icon = forwardRef<SVGSVGElement, LucideProps>(
    ({ color = "currentColor", size = 24, strokeWidth = 2, ...props }, ref) => (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        {paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    ),
  );
  Icon.displayName = displayName;
  return Icon;
}

export const SearchVisibilityIcon = outlineIcon("SearchVisibilityIcon", [
  "M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0",
  "M12 18c-.328 0 -.652 -.017 -.97 -.05c-3.172 -.332 -5.85 -2.315 -8.03 -5.95c2.4 -4 5.4 -6 9 -6c3.465 0 6.374 1.853 8.727 5.558",
  "M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
  "M20.2 20.2l1.8 1.8",
]);

export const SeoIcon = outlineIcon("SeoIcon", [
  "M21 12a9 9 0 1 0 -9 9",
  "M3.6 9h16.8",
  "M3.6 15h7.9",
  "M11.5 3a17 17 0 0 0 0 18",
  "M12.5 3a16.984 16.984 0 0 1 2.574 8.62",
  "M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0",
  "M20.2 20.2l1.8 1.8",
]);

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
