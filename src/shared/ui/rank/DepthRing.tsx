import classes from "./Rank.module.css";

const RADIUS = 11;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function DepthRing({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <svg className={classes.ring} viewBox="0 0 28 28" aria-hidden>
      <circle className={classes.ringTrack} cx="14" cy="14" r={RADIUS} />
      <circle
        className={classes.ringFill}
        cx="14"
        cy="14"
        r={RADIUS}
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE * (1 - clamped / 100)}
      />
    </svg>
  );
}
