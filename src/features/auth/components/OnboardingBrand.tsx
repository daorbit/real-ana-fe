import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Wordmark } from "@/shared/ui/Brand";

// Not the signup strip's claims — "No credit card" is answering a question this
// person already got past. These are about the setup itself.
const PROOF = ["Takes two minutes", "Skip and return later", "One script tag"];

/** Where the pings sit on the radar, as percentages of the box. */
const PINGS = [
  { x: 30, y: 32, d: 0 },
  { x: 68, y: 24, d: 1.1 },
  { x: 78, y: 58, d: 2.2 },
  { x: 24, y: 66, d: 0.6 },
  { x: 52, y: 78, d: 1.7 },
  { x: 46, y: 46, d: 2.8 },
];

/**
 * A radar sweeping over visitor pings — the product's own idea (traffic
 * arriving live from everywhere) rather than a decorative shape, and it gives
 * the panel something to look at while the form is being filled in.
 *
 * Pure CSS/SVG animation: no state, so it costs nothing per frame in React.
 */
function OnboardingVisual() {
  return (
    <div className="onb-visual" aria-hidden="true">
      <div className="onb-radar">
        <span className="onb-ring onb-ring-1" />
        <span className="onb-ring onb-ring-2" />
        <span className="onb-ring onb-ring-3" />
        <span className="onb-sweep" />
        {PINGS.map((p) => (
          <span
            key={`${p.x}-${p.y}`}
            className="onb-ping"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.d}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The left panel during first-run setup.
 *
 * Deliberately the same treatment as the auth screens — someone arriving here
 * straight from signup should feel they are still in the same flow, not
 * dropped into a different product.
 *
 * The step list lives here rather than above the form so progress stays on
 * screen the whole time, and the form column is left to hold one thing.
 */
export function OnboardingBrand({
  step,
  steps,
}: {
  step: number;
  steps: { label: string; hint: string }[];
}) {
  return (
    <div className="auth-brand">
      <div className="ab-grid" />
      <motion.div
        className="ab-orb ab-orb-1"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="ab-orb ab-orb-2"
        animate={{ y: [0, 24, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="ab-content">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Wordmark />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Let&apos;s get you tracking.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Three short steps and your first visitor shows up live. You can skip
          any of it and come back later.
        </motion.p>

        {/* Above the visual, directly under the copy — progress is the thing
            someone checks most often here, so it sits highest. */}
        <div className="onb-steps">
          {steps.map((s, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <motion.div
                key={s.label}
                className="onb-step"
                data-state={done ? "done" : current ? "current" : "todo"}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.09 }}
              >
                <span className="onb-step-ic">
                  {done ? <Check size={14} strokeWidth={3} /> : i + 1}
                </span>
                <span className="onb-step-text">
                  <span className="onb-step-label">{s.label}</span>
                  <span className="onb-step-hint">{s.hint}</span>
                </span>
              </motion.div>
            );
          })}
        </div>

        <OnboardingVisual />

        {/* Same strip as the auth panel — keeps the two screens feeling like
            one flow, and fills the space left under a three-item list. */}
        <motion.div
          className="ab-proof"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
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
