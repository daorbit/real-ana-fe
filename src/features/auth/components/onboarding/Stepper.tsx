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
      <span
        className={s.progressRule}
        style={{ width: `${pct}%` }}
        aria-hidden="true"
      />
    </div>
  );
}
