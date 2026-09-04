import { motion } from "framer-motion";
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

type Props = {
  /** Omitted on pages with no demo affordance, e.g. the verify-email step. */
  onDemo?: () => void;
  demoBusy?: boolean;
};

export function AuthBrand({ onDemo, demoBusy = false }: Props) {
  return (
    <div className="auth-brand">
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

        <div className="ab-showcase">
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
