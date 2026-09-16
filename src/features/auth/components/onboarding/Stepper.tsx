import { Check } from "lucide-react";
import s from "./Onboarding.module.css";

export type StepDef = { label: string; hint: string };

/**
 * Horizontal progress across the top of setup.
 *
 * Horizontal rather than the vertical list this replaced: the steps are a
 * header, not content, and a column of them beside the form took half the
 * screen to say one thing. Below `62em` the labels drop and the dots carry it
 * alone — see `Onboarding.module.css`.
 */
export function Stepper({ step, steps }: { step: number; steps: StepDef[] }) {
  return (
    <ol className={s.steps}>
      {steps.map((def, i) => {
        const done = i < step;
        const current = i === step;
        const state = done ? "done" : current ? "current" : "todo";
        return (
          <li key={def.label} className={s.step} data-state={state}>
            <span className={s.stepDot}>
              {done ? <Check size={13} strokeWidth={3} /> : i + 1}
            </span>
            <span className={s.stepLabel}>{def.label}</span>
            {i < steps.length - 1 && (
              <span
                className={s.stepLine}
                data-done={done || undefined}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
