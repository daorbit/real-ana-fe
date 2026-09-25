import classes from "./Developers.module.css";

const WIDTH = 72;
const HEIGHT = 22;

export function KeySparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;

  const max = Math.max(...values);
  const step = WIDTH / (values.length - 1);
  const points = values
    .map((v, i) => {
      const y = max ? HEIGHT - 2 - (v / max) * (HEIGHT - 4) : HEIGHT - 2;
      return `${(i * step).toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      className={classes.spark}
      data-empty={!max || undefined}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      aria-hidden
    >
      <polyline points={points} />
    </svg>
  );
}
