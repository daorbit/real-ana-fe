import classes from "./AuditCrawl.module.css";

const LEGS_A = [
  "M27 27 L18 17 L11 19",
  "M26 36 L15 38 L8 45",
  "M38 31 L49 26 L57 30",
  "M37 41 L46 47 L51 56",
];

const LEGS_B = [
  "M26 31 L15 26 L7 30",
  "M27 41 L18 47 L13 56",
  "M37 27 L46 17 L53 19",
  "M38 36 L49 38 L56 45",
];

export function CrawlerSpider() {
  return (
    <svg viewBox="0 0 64 64" className={classes.spider} aria-hidden>
      <g className={classes.legsA}>
        {LEGS_A.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g className={classes.legsB}>
        {LEGS_B.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path className={classes.antenna} d="M32 16 L32 10" />
      <circle className={classes.eye} cx="32" cy="9" r="1.8" />
      <ellipse className={classes.body} cx="32" cy="39" rx="8" ry="10" />
      <circle className={classes.body} cx="32" cy="23" r="6.5" />
      <circle className={classes.eye} cx="29.5" cy="22" r="1.6" />
      <circle className={classes.eye} cx="34.5" cy="22" r="1.6" />
    </svg>
  );
}
