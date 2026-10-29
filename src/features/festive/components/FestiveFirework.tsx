import classes from "./Festive.module.css";

const RAYS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const point = (r: number) => ({ x: +(Math.cos(angle) * r).toFixed(2), y: +(Math.sin(angle) * r).toFixed(2) });
  return { from: point(5), to: point(12.5), tip: point(15.5) };
});

const TONES = {
  gold: classes.toneGold,
  rose: classes.toneRose,
  marigold: classes.toneMarigold,
} as const;

export function FestiveFirework({
  tone,
  className,
}: {
  tone: keyof typeof TONES;
  className: string;
}) {
  return (
    <svg viewBox="-20 -20 40 40" className={`${classes.firework} ${TONES[tone]} ${className}`}>
      <path className={classes.trail} d="M0 8v8" />
      <g className={classes.burst}>
        {RAYS.map(({ from, to, tip }, i) => (
          <g key={i}>
            <path className={classes.ray} d={`M${from.x} ${from.y}L${to.x} ${to.y}`} />
            <circle className={classes.spark} cx={tip.x} cy={tip.y} r={1.1} />
          </g>
        ))}
        <circle className={classes.core} r={1.8} />
      </g>
    </svg>
  );
}
