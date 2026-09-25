import { Check } from "lucide-react";
import type { ReactNode } from "react";
import s from "./Onboarding.module.css";

export type StepDef = { label: string; hint: string };

/**
 * Progress across the top of setup: a count, the current step's name, and a
 * hairline riding the bar's bottom border.
 *
 * This replaced a row of eight dots joined by connector lines. Dots work at
 * three or four steps; at eight they are a row of circles, and the labels were
 * already being dropped below 62em — which is most laptops — leaving decoration
 * that named nothing. A counter says how far along you are exactly, the label
 * says what you are doing, and the rule carries the proportion at a glance.
 *
 * The rule is filled by completed steps, not by the current one: standing on
 * step 3 of 8, two are behind you. Filling to include the step in progress
 * would show the bar full on the last screen before it is finished.
 */
export function Stepper({ step, steps }: { step: number; steps: StepDef[] }) {
  const total = steps.length;
  const current = steps[step];
  const pct = total > 1 ? (step / (total - 1)) * 100 : 0;

  return (
    <div
      className={s.progress}
      role="group"
      // The visible text is fragmentary ("3 of 8", "Your site") and reads as
      // two unrelated strings to a screen reader; the label says it once,
      // whole.
      aria-label={`Step ${step + 1} of ${total}${current ? `: ${current.label}` : ""}`}
    >
      <span className={s.progressCount} aria-hidden="true">
        {step + 1} <span style={{ opacity: 0.5 }}>/</span> {total}
      </span>
      {current && (
        <span className={s.progressLabel} aria-hidden="true">
          {current.label}
        </span>
      )}
      {/* Phone only: one pill per step, the way app setup flows show it. The
          counter and hairline above stay for wider screens. */}
      <span className={s.segments} aria-hidden="true">
        {steps.map((_, i) => (
          <span key={i} className={s.segment} data-state={i < step ? "done" : i === step ? "current" : "todo"} />
        ))}
      </span>
      <span
        className={s.progressRule}
        style={{ width: `${pct}%` }}
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * The step list down the left edge on desktop.
 *
 * Eight steps are too many to hold in your head from "4 / 8" alone, so the
 * whole run is listed: what is done, where you are, and what is still to
 * come, each with its one-line hint. Display only — Back and Continue move
 * through the flow, because several steps create things (a workspace, a site)
 * and jumping around them would create duplicates.
 */
export function SetupRail({
  step,
  steps,
  onSkip,
  brand,
}: {
  step: number;
  steps: StepDef[];
  onSkip?: () => void;
  brand: ReactNode;
}) {
  return (
    <aside className={s.rail} aria-label="Setup progress">
      <div className={s.railBrand}>{brand}</div>

      <div className={s.railIntro}>
        <div className={s.railTitle}>Set up your account</div>
        <div className={s.railMeta}>
          Step {step + 1} of {steps.length}
        </div>
      </div>

      <ol className={s.railList}>
        {steps.map((def, i) => {
          const state = i < step ? "done" : i === step ? "current" : "todo";
          return (
            <li key={def.label} className={s.railItem} data-state={state} aria-current={state === "current" ? "step" : undefined}>
              <span className={s.railMarker} aria-hidden="true">
                {state === "done" ? <Check size={12} strokeWidth={3} /> : i + 1}
              </span>
              <span className={s.railText}>
                <span className={s.railLabel}>{def.label}</span>
                <span className={s.railHint}>{def.hint}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className={s.railFoot}>
        {onSkip && (
          <button type="button" className={s.railSkip} onClick={onSkip}>
            Skip setup for now
          </button>
        )}
        <span className={s.railNote}>You can change all of this later in Settings.</span>
      </div>
    </aside>
  );
}
