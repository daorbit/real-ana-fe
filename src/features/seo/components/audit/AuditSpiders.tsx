import { CrawlerSpider } from "./CrawlerSpider";
import classes from "./AuditCrawl.module.css";

const WALKERS = [
  { route: "a", tone: "blue", lag: false },
  { route: "b", tone: "violet", lag: false },
  { route: "c", tone: "orange", lag: false },
  { route: "d", tone: "teal", lag: false },
  { route: "a", tone: "pink", lag: true },
  { route: "b", tone: "green", lag: true },
  { route: "c", tone: "red", lag: true },
  { route: "d", tone: "indigo", lag: true },
] as const;

export function AuditSpiders({ check }: { check: string }) {
  return (
    <div className={classes.spiders} aria-hidden>
      {WALKERS.map(({ route, tone, lag }, i) => (
        <span
          key={`${route}-${tone}`}
          className={classes.walker}
          data-route={route}
          data-tone={tone}
          data-lag={lag || undefined}
        >
          <span className={classes.ring} />
          <span className={classes.turn}>
            <CrawlerSpider />
          </span>
          {i === 0 && (
            <span key={check} className={classes.chip}>
              {check}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
