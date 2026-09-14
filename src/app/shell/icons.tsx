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
