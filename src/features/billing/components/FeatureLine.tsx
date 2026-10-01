import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import classes from "./plans/Plans.module.css";

export function FeatureLine({ text, color }: { text: string; color?: string }) {
  return (
    <li className={classes.feature} style={color ? ({ "--check": color } as CSSProperties) : undefined}>
      <span className={classes.check} aria-hidden>
        <Check size={11} strokeWidth={3.5} />
      </span>
      {text}
    </li>
  );
}
