// Inline SVG plan marks — self-contained, no external images (survive strict
// CSP), same convention as Brand.tsx's Logo. Solid rounded-square app-icon
// style: a filled gradient tile with a white glyph and a soft top highlight,
// like a home-screen icon — not a flat line badge. One glyph per tier so
// Free/Starter/Pro read as distinct marks at a glance.
//
// Shared between the dashboard and the landing page — this file is
// duplicated at quantalog-lp/src/components/PlanIcons.tsx since the two are
// separate builds with no shared package; keep them in sync by hand.

const GRADIENTS: Record<string, [string, string]> = {
  free: ["#94a3b8", "#64748b"], // slate — plain, no charge
  starter: ["#34d399", "#059669"], // the app's own emerald, same as Logo
  pro: ["#fb923c", "#ea580c"], // orange — the tier worth calling out
};

function ids(slug: string, uid: string) {
  return { fill: `plan-fill-${slug}-${uid}`, shine: `plan-shine-${slug}-${uid}` };
}

/** Shared tile background: rounded square, gradient fill, soft glass highlight across the top. */
function Tile({
  id,
  shineId,
  from,
  to,
  children,
}: {
  id: string;
  shineId: string;
  from: string;
  to: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <linearGradient id={shineId} x1="18" y1="2" x2="18" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="33" height="33" rx="10" fill={`url(#${id})`} />
      <rect x="1.5" y="1.5" width="33" height="15" rx="10" fill={`url(#${shineId})`} />
      {children}
    </>
  );
}

/** A ring — Free costs nothing and asks nothing, so the mark is the plainest of the three: an open circle. */
export function FreePlanIcon({ size = 24, uid = "a" }: { size?: number; uid?: string }) {
  const { fill, shine } = ids("free", uid);
  const [from, to] = GRADIENTS.free;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <Tile id={fill} shineId={shine} from={from} to={to}>
        <circle cx="18" cy="18" r="7.5" stroke="#fff" strokeWidth="2.6" fill="none" />
      </Tile>
    </svg>
  );
}

/** An upward chevron with a shaft — Starter is the first paid step, so the mark points up and out. */
export function StarterPlanIcon({ size = 24, uid = "a" }: { size?: number; uid?: string }) {
  const { fill, shine } = ids("starter", uid);
  const [from, to] = GRADIENTS.starter;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <Tile id={fill} shineId={shine} from={from} to={to}>
        <path
          d="M11 21.5 L18 13 L25 21.5"
          stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none"
        />
        <path d="M18 13 L18 25" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      </Tile>
    </svg>
  );
}

/** A faceted gem — Pro is the top tier, drawn like a cut stone rather than a plain shape. */
export function ProPlanIcon({ size = 24, uid = "a" }: { size?: number; uid?: string }) {
  const { fill, shine } = ids("pro", uid);
  const [from, to] = GRADIENTS.pro;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <Tile id={fill} shineId={shine} from={from} to={to}>
        <path
          d="M12 13.5 L24 13.5 L27.5 17.5 L18 27 L8.5 17.5 Z"
          fill="#fff" opacity="0.95"
        />
        <path
          d="M12 13.5 L24 13.5 M18 13.5 L14 17.5 L18 27 L22 17.5 Z M8.5 17.5 L27.5 17.5"
          stroke={to} strokeWidth="1" strokeLinejoin="round" opacity="0.35" fill="none"
        />
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
export function PlanIcon({ slug, size = 24, uid = "a" }: { slug: string; size?: number; uid?: string }) {
  const Icon = ICONS[slug as PlanSlug] ?? StarterPlanIcon;
  return <Icon size={size} uid={uid} />;
}
