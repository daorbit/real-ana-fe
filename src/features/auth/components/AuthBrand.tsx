import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Zap, Search, Share2, ShieldCheck, TrendingUp, Check, PlayCircle, ArrowRight,
} from "lucide-react";
import { Wordmark } from "@/shared/ui/Brand";

const FEATURES = [
  { icon: Zap, text: "Real-time visitor tracking" },
  { icon: Search, text: "SEO audits with Lighthouse scores" },
  { icon: TrendingUp, text: "Funnels, goals and campaigns" },
  { icon: Share2, text: "Dashboards you can share" },
  { icon: ShieldCheck, text: "Privacy-friendly, no cookies" },
];

// Deliberately not user counts or star ratings — those would be invented. Each
// of these is a property of the product that the marketing copy already claims.
const PROOF = ["No credit card", "GDPR-friendly", "Cancel anytime"];

/** Mock traffic series, 0–100. Drawn as an area sparkline inside the card. */
const SERIES = [34, 48, 41, 57, 46, 52, 68, 59, 74, 63, 81, 72, 88, 79, 94];

/** Builds a smooth path through the series across a 100x40 viewBox. */
function sparkPath(points: number[], close: boolean) {
  const step = 100 / (points.length - 1);
  const y = (v: number) => 40 - (v / 100) * 34 - 3;
  // Catmull-Rom style midpoint smoothing: enough to lose the jagged polyline
  // without pulling the curve away from its own data points.
  let d = `M 0 ${y(points[0])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const x1 = i * step;
    const x2 = (i + 1) * step;
    const mid = (x1 + x2) / 2;
    d += ` C ${mid} ${y(points[i])}, ${mid} ${y(points[i + 1])}, ${x2} ${y(points[i + 1])}`;
  }
  return close ? `${d} L 100 40 L 0 40 Z` : d;
}

/**
 * The three chips used to float at scattered absolute positions, which read as
 * stray tooltips rather than product. They are one card now: a miniature of the
 * live dashboard the page is actually selling, which gives the panel a single
 * focal point instead of three competing ones.
 */
function LiveCard() {
  const reduce = useReducedMotion();
  // The headline figure ticks so the card looks live rather than a screenshot.
  // Numbers are illustrative, and the card says so — see the caption below.
  const [visitors, setVisitors] = useState(1284);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setVisitors((n) => {
        const next = n + Math.round((Math.random() - 0.45) * 24);
        // Keep it in a believable band so it never drifts to zero or runs away
        // during a long-lived tab sat on the login screen.
        return Math.min(1600, Math.max(1050, next));
      });
    }, 2600);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <motion.div
      className="ab-card"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="ab-card-head">
        <span className="ab-card-title">Visitors online</span>
        <span className="ab-live">
          <span className="ab-live-dot" />
          Live
        </span>
      </div>

      <div className="ab-card-figure">
        <span className="ab-card-value">{visitors.toLocaleString()}</span>
        <span className="ab-card-delta">
          <TrendingUp size={12} />
          12.4%
        </span>
      </div>

      <svg className="ab-spark" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="ab-spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.38" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={sparkPath(SERIES, true)}
          fill="url(#ab-spark-fill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        />
        <motion.path
          d={sparkPath(SERIES, false)}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1.8}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, delay: 0.55, ease: "easeInOut" }}
        />
      </svg>

      <div className="ab-card-foot">
        <div className="ab-stat">
          <span className="ab-stat-val">342</span>
          <span className="ab-stat-label">Pageviews / min</span>
        </div>
        <div className="ab-stat">
          <span className="ab-stat-val">47</span>
          <span className="ab-stat-label">Countries</span>
        </div>
        <div className="ab-stat">
          <span className="ab-stat-val">1.4s</span>
          <span className="ab-stat-label">Avg. load</span>
        </div>
        {/* Inside the card, not floating under it — as a caption outside the
            border it read as body copy belonging to the page. */}
        <span className="ab-card-note">Sample data</span>
      </div>
    </motion.div>
  );
}

type Props = {
  /** Omitted on pages with no demo affordance, e.g. the verify-email step. */
  onDemo?: () => void;
  demoBusy?: boolean;
};

export function AuthBrand({ onDemo, demoBusy = false }: Props) {
  return (
    <div className="auth-brand">
      {/* animated grid + orbs */}
      <div className="ab-grid" />
      <motion.div className="ab-orb ab-orb-1" animate={{ y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="ab-orb ab-orb-2" animate={{ y: [0, 24, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />

      <div className="ab-content">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Wordmark />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          Real-time analytics for every app you ship.
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          One script tag for live traffic, plus SEO audits and shareable reports —
          without a cookie banner.
        </motion.p>

        {/* Card and demo CTA share a row on a wide panel — stacked, they left a
            wide empty band down the right. Collapses to one column when the
            panel is too narrow to carry both. */}
        <div className="ab-showcase">
          <LiveCard />

          {/* The demo lives here rather than under each form: it belongs with
              the product pitch, not with the credential fields, and on the
              brand side it can be a real invitation instead of the subtle grey
              button it had to be while it sat competing with Log in. */}
          {onDemo && (
            <motion.button
              type="button"
              className="ab-demo"
              onClick={onDemo}
              disabled={demoBusy}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.7 }}
            >
              <span className="ab-demo-ic"><PlayCircle size={16} /></span>
              <span className="ab-demo-text">
                <span className="ab-demo-title">
                  {demoBusy ? "Starting demo…" : "Explore the live demo"}
                </span>
                <span className="ab-demo-sub">Real dashboard, no signup</span>
              </span>
              <ArrowRight className="ab-demo-arrow" size={15} />
            </motion.button>
          )}
        </div>

        <div className="ab-features">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.text}
              className="ab-feature"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.75 + i * 0.07 }}
            >
              <span className="ab-feature-ic"><f.icon size={16} /></span>
              {f.text}
            </motion.div>
          ))}
        </div>

        {/* The panel bottom was empty below the feature list, which left the
            composition top-heavy. These are the reassurances that matter at the
            moment of handing over an email. */}
        <motion.div
          className="ab-proof"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.15 }}
        >
          {PROOF.map((p) => (
            <span key={p} className="ab-proof-item">
              <Check size={13} />
              {p}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
