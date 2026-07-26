// Inline SVG plan marks — self-contained, no external images (survive strict
// CSP), same convention as Brand.tsx's Logo. Flat rounded-square badge, one
// bold recognizable glyph per tier — the common SaaS pricing-badge pattern
// (Stripe/Vercel/Linear): a single flat colour, no gradients, no shine, so it
// reads clean at 20-30px instead of competing for attention.
//
// Shared between the dashboard and the landing page — this file is
// duplicated at quantalog-lp/src/components/PlanIcons.tsx since the two are
// separate builds with no shared package; keep them in sync by hand.

const COLORS: Record<string, string> = {
  free: "#64748b", // slate — plain, no charge
  starter: "#059669", // the app's own emerald, same as Logo
  pro: "#d97706", // amber — the tier worth calling out
};

/** Flat rounded-square tile, tinted background + solid-colour glyph on top. */
function Tile({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <>
      <rect x="1" y="1" width="34" height="34" rx="9" fill={color} fillOpacity="0.12" />
      {children}
    </>
  );
}

/** A leaf — Free costs nothing, so the mark is the simplest and most organic of the three. */
export function FreePlanIcon({ size = 24 }: { size?: number; uid?: string }) {
  const color = COLORS.free;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <Tile color={color}>
        <path
          d="M12 24c-1.5-5.5 1-11.5 8-13.5 5-1.4 8 .3 8 .3s-.3 5.5-4 9c-3.2 3-7.2 3.5-9 3.5-1 0-2.3-.1-3-.6Z"
          stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"
        />
        <path d="M12 24c2-3 5-6 9.5-9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </Tile>
    </svg>
  );
}

/** A rocket — Starter is the first paid step, the one that gets you moving. */
export function StarterPlanIcon({ size = 24 }: { size?: number; uid?: string }) {
  const color = COLORS.starter;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <Tile color={color}>
        <path
          d="M18 9c3 1.6 5 5 5 9.5 0 1.9-.4 3.5-.9 4.6l-4.1 2.4-4.1-2.4c-.5-1.1-.9-2.7-.9-4.6C13 14 15 10.6 18 9Z"
          fill={color}
        />
        <circle cx="18" cy="17" r="1.8" fill="white" />
        <path d="M13.5 20.5 10 22.5l1-4.3 2.5.3" fill={color} />
        <path d="M22.5 20.5 26 22.5l-1-4.3-2.5.3" fill={color} />
        <path d="M16.3 26 18 28.5 19.7 26" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Tile>
    </svg>
  );
}

/** A crown — Pro is the top tier, marked the way a top tier usually is. */
export function ProPlanIcon({ size = 24 }: { size?: number; uid?: string }) {
  const color = COLORS.pro;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <Tile color={color}>
        <path
          d="M10 23.5 8.5 14l4.8 3.6L18 11l4.7 6.6 4.8-3.6-1.5 9.5H10Z"
          fill={color}
        />
        <rect x="10" y="24.5" width="16" height="2.2" rx="1.1" fill={color} />
      </Tile>
    </svg>
  );
}

export type PlanSlug = "free" | "starter" | "pro";

const ICONS: Record<PlanSlug, typeof FreePlanIcon> = {
  free: FreePlanIcon,
  starter: StarterPlanIcon,
  pro: ProPlanIcon,
};

/** Pick the right badge by plan slug, falling back to the Starter mark for any tier added later. */
export function PlanIcon({ slug, size = 24 }: { slug: string; size?: number; uid?: string }) {
  const Icon = ICONS[slug as PlanSlug] ?? StarterPlanIcon;
  return <Icon size={size} />;
}
