import dayjs from "dayjs";
import type { SearchWebVitals } from "@/shared/types";
import { VITALS, VITAL_RATING } from "@/features/seo/components/panels/performance/vitalMeta";
import { vitalsDeviceLabel } from "../../webVitals";
import classes from "../searchConsole.module.css";

const CORE_KEYS = ["lcp", "inp", "cls"] as const;

function failing(data: SearchWebVitals): string[] {
  return CORE_KEYS.flatMap((key) => {
    const vital = data.metrics[key];
    if (!vital || vital.rating === "good") return [];
    const name = VITALS.find((v) => v.key === key)?.name ?? key;
    return [`${name}: ${VITAL_RATING[vital.rating].label.toLowerCase()}`];
  });
}

export function VitalsHeadline({ data }: { data: SearchWebVitals }) {
  const where = vitalsDeviceLabel(data.device);
  const host = data.origin.replace(/^https?:\/\//, "");
  const last = data.periods[data.periods.length - 1];
  const problems = failing(data);

  return (
    <section className={classes.headline} aria-label="Core Web Vitals summary">
      <div className={classes.headlineText}>
        <p className={classes.headlineTitle}>
          {data.passing === null ? (
            <>
              Google doesn&apos;t have enough data to fully assess <b>{host}</b> {where}.
            </>
          ) : data.passing ? (
            <>
              <b>{host}</b> <span className={classes.headlineUp}>passes</span> Core Web Vitals {where}.
            </>
          ) : (
            <>
              <b>{host}</b> <span className={classes.headlineDown}>doesn&apos;t pass</span> Core Web Vitals {where} yet.
            </>
          )}
        </p>
        <p className={classes.headlineSub}>
          {problems.length > 0 && `${problems.join(" · ")}. `}
          Based on real Chrome visits over 28 days
          {last && ` ending ${dayjs(last).format("MMM D, YYYY")}`}. The date range above doesn&apos;t change it.
        </p>
      </div>
    </section>
  );
}
