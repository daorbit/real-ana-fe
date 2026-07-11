import type { WidgetKind } from "../hooks";

/**
 * Tiny animated previews shown in the "Customize" picker so the user can see
 * what a widget looks like before enabling it. Pure SVG + CSS/SMIL — no assets.
 */
export function WidgetPreview({ kind, active }: { kind: WidgetKind; active: boolean }) {
  const stroke = active ? "#34d399" : "var(--muted)";
  const fill = active ? "rgba(16,185,129,0.18)" : "var(--border)";
  const solid = active ? "#10b981" : "var(--border-strong)";

  return (
    <div className={active ? "wp active" : "wp"}>
      <svg viewBox="0 0 120 60" className="wp-svg" aria-hidden="true">
        {kind === "metric" && (
          <>
            <rect x="10" y="10" width="18" height="18" rx="5" fill={fill} />
            <rect x="10" y="34" width="42" height="10" rx="3" fill={solid} opacity={0.9}>
              <animate attributeName="width" values="0;42" dur="0.6s" fill="freeze" />
            </rect>
            <rect x="10" y="48" width="26" height="5" rx="2" fill="var(--border-strong)" />
            <rect x="86" y="12" width="24" height="12" rx="6" fill={fill} />
          </>
        )}

        {kind === "chart" && (
          <>
            <path
              d="M8 46 L28 34 L48 40 L68 22 L88 30 L112 14 L112 54 L8 54 Z"
              fill={fill}
              opacity="0"
            >
              <animate attributeName="opacity" from="0" to="1" dur="0.7s" begin="0.3s" fill="freeze" />
            </path>
            <path
              d="M8 46 L28 34 L48 40 L68 22 L88 30 L112 14"
              fill="none"
              stroke={stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="150"
              strokeDashoffset="150"
            >
              <animate attributeName="stroke-dashoffset" from="150" to="0" dur="1s" fill="freeze" />
            </path>
          </>
        )}

        {kind === "list" &&
          [0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x="10" y={10 + i * 12} width="34" height="5" rx="2" fill="var(--border-strong)" />
              <rect x="50" y={10 + i * 12} width={0} height="5" rx="2" fill={solid} opacity={0.9 - i * 0.15}>
                <animate
                  attributeName="width"
                  from="0"
                  to={String(58 - i * 13)}
                  dur="0.7s"
                  begin={`${i * 0.08}s`}
                  fill="freeze"
                />
              </rect>
            </g>
          ))}

        {kind === "map" && (
          <>
            {/* abstract continents */}
            <ellipse cx="30" cy="26" rx="16" ry="10" fill={fill} />
            <ellipse cx="62" cy="36" rx="12" ry="8" fill={solid} opacity={0.55} />
            <ellipse cx="88" cy="22" rx="18" ry="11" fill={fill} />
            <ellipse cx="48" cy="46" rx="9" ry="6" fill={solid} opacity={0.35} />
            {[30, 62, 88].map((cx, i) => (
              <circle key={cx} cx={cx} cy={i === 1 ? 36 : i === 0 ? 26 : 22} r="2.5" fill={stroke}>
                <animate
                  attributeName="r"
                  values="2.5;5;2.5"
                  dur="1.8s"
                  begin={`${i * 0.4}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="1;0.2;1"
                  dur="1.8s"
                  begin={`${i * 0.4}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </>
        )}

        {kind === "live" && (
          <>
            <circle cx="20" cy="18" r="5" fill={stroke}>
              <animate attributeName="opacity" values="1;0.25;1" dur="1.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="20" cy="18" r="5" fill="none" stroke={stroke} strokeWidth="1.5" opacity="0.6">
              <animate attributeName="r" values="5;13" dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0" dur="1.6s" repeatCount="indefinite" />
            </circle>
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <rect x="36" y={12 + i * 14} width="46" height="5" rx="2" fill="var(--border-strong)" />
                <rect x="92" y={12 + i * 14} width="18" height="5" rx="2" fill={solid} opacity={0.85 - i * 0.2} />
              </g>
            ))}
          </>
        )}
      </svg>
    </div>
  );
}
