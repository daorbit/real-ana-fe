import { timeAgo } from "@/shared/lib/format";
import { CHECK_STATE } from "../../status/labels";
import type { LiveCheck } from "../../status/types";
import classes from "./Status.module.css";

function subtitle(check: LiveCheck): string {
  const when = check.lastCheckedAt ? `checked ${timeAgo(check.lastCheckedAt)}` : "";
  return [check.message, when].filter(Boolean).join(" · ");
}

export function LiveChecks({ checks }: { checks: LiveCheck[] }) {
  return (
    <section className={classes.section}>
      <div className={classes.sectionHead}>
        <h3 className={classes.sectionTitle}>Live checks</h3>
        <span className={classes.sectionNote}>Every 5 minutes. Two failures in a row count as down.</span>
      </div>
      <div className={classes.group}>
        {checks.map((check) => {
          const state = CHECK_STATE[check.state];
          return (
            <div key={check.id} className={classes.row}>
              <span className={classes.main}>
                <span className={classes.title}>{check.name}</span>
                <span className={classes.subtitle}>{subtitle(check)}</span>
              </span>
              <span className={classes.trailing}>
                <span className={classes.dot} data-tone={state.tone} aria-hidden />
                {state.label}
                {check.latencyMs !== null && ` · ${check.latencyMs} ms`}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
