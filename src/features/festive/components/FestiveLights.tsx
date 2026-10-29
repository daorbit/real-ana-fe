import classes from "./Festive.module.css";

const TOP = 3;
const SAG = 21;
const STOPS = [0.14, 0.29, 0.43, 0.57, 0.71, 0.86];
const SEGMENTS: Array<[number, number]> = [
  [0, 140],
  [140, 280],
];
const BULB_TONES = [classes.bulbGold, classes.bulbMarigold, classes.bulbRose];

const WIRE = SEGMENTS.map(([from, to], i) => `${i === 0 ? `M${from} ${TOP}` : ""}Q${(from + to) / 2} ${SAG} ${to} ${TOP}`).join("");

const BULBS = SEGMENTS.flatMap(([from, to]) =>
  STOPS.map((t) => {
    const mid = (from + to) / 2;
    const x = (1 - t) ** 2 * from + 2 * (1 - t) * t * mid + t * t * to;
    const y = (1 - t) ** 2 * TOP + 2 * (1 - t) * t * SAG + t * t * TOP;
    return { x: +x.toFixed(1), y: +(y + 3.5).toFixed(1) };
  }),
);

export function FestiveLights() {
  return (
    <svg viewBox="0 0 280 30" className={classes.lights}>
      <path className={classes.wire} d={WIRE} />
      {BULBS.map(({ x, y }, i) => (
        <g key={i} className={BULB_TONES[i % BULB_TONES.length]}>
          <rect className={classes.socket} x={x - 0.9} y={y - 4.6} width={1.8} height={2} />
          <ellipse cx={x} cy={y} rx={2.2} ry={3} />
        </g>
      ))}
    </svg>
  );
}
