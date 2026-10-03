import { Check } from "lucide-react";

export function RunningSteps({ steps, active }: { steps: string[]; active: number }) {
  return (
    <ol className="running-steps">
      {steps.map((label, i) => {
        const state = i < active ? "done" : i === active ? "active" : "pending";
        return (
          <li key={label} className="running-steps__item" data-state={state}>
            <span className="running-steps__mark">
              {state === "done" && <Check size={9} strokeWidth={3.5} />}
            </span>
            <span className="running-steps__label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
