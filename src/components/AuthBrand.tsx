import { motion } from "framer-motion";
import { Zap, Globe, ShieldCheck, TrendingUp } from "lucide-react";
import { Wordmark } from "./Brand";

const FEATURES = [
  { icon: Zap, text: "Real-time visitor tracking" },
  { icon: Globe, text: "Works with any framework" },
  { icon: TrendingUp, text: "Devices, referrers, campaigns" },
  { icon: ShieldCheck, text: "Privacy-friendly, no cookies" },
];

// Animated live-metric chips that float on the brand panel.
const CHIPS = [
  { label: "Live visitors", value: "1,284", top: "12%", right: "10%", d: 0.2 },
  { label: "Pageviews / min", value: "342", top: "44%", right: "8%", d: 0.4 },
  { label: "Countries", value: "47", top: "72%", right: "16%", d: 0.6 },
];

export function AuthBrand() {
  return (
    <div className="auth-brand">
      {/* animated grid + orbs */}
      <div className="ab-grid" />
      <motion.div className="ab-orb ab-orb-1" animate={{ y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="ab-orb ab-orb-2" animate={{ y: [0, 24, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />

      {/* floating metric chips */}
      {CHIPS.map((c) => (
        <motion.div
          key={c.label}
          className="ab-chip"
          style={{ top: c.top, right: c.right }}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
          transition={{ opacity: { delay: c.d, duration: 0.5 }, scale: { delay: c.d, duration: 0.5 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: c.d } }}
        >
          <span className="ab-chip-val">{c.value}</span>
          <span className="ab-chip-label">{c.label}</span>
        </motion.div>
      ))}

      <div className="ab-content">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Wordmark />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          Real-time analytics for<br />every app you ship.
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          Drop in one script tag and watch visitors, pageviews and campaigns stream live.
        </motion.p>
        <div className="ab-features">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.text}
              className="ab-feature"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.35 + i * 0.09 }}
            >
              <span className="ab-feature-ic"><f.icon size={16} /></span>
              {f.text}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
