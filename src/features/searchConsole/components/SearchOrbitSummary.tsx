import { Sparkles } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import classes from "./orbit.module.css";

export function SearchOrbitSummary({ onSummarize }: { onSummarize: () => void }) {
  return (
    <button type="button" className={classes.pill} onClick={onSummarize}>
      <OrbitMark size={16} />
      <span>Explain with Orbit</span>
      <Sparkles size={13} aria-hidden className={classes.pillSpark} />
    </button>
  );
}
