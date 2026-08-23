import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";

export const LeadMagnetIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ color = "currentColor", size = 24, strokeWidth = 1.8, ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
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
  ),
);

LeadMagnetIcon.displayName = "LeadMagnetIcon";
