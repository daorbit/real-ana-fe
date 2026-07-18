import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Wordmark } from "./Brand";

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
          Let&apos;s get you
          <br />
          tracking.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Three short steps and your first visitor shows up live. You can skip
          any of it and come back later.
        </motion.p>

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
      </div>
    </div>
  );
}
