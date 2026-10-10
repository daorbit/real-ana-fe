import { ScrollText } from "lucide-react";
import { CATEGORY_META, WORKSPACE_CATEGORIES } from "../lib/categories";
import classes from "./AuditEmpty.module.css";

export function AuditEmpty({ filtered, onClear }: { filtered: boolean; onClear: () => void }) {
  if (filtered) {
    return (
      <div className={classes.filtered}>
        <p className={classes.filteredTitle}>Nothing matches these filters</p>
        <p className={classes.text}>Try another area or person, or</p>
        <button type="button" className={classes.clear} onClick={onClear}>
          show everything
        </button>
      </div>
    );
  }

  return (
    <section className={classes.card}>
      <div className={classes.intro}>
        <span className={classes.mark} aria-hidden>
          <ScrollText size={22} strokeWidth={1.6} />
        </span>
        <h2 className={classes.title}>Your audit trail starts now</h2>
        <p className={classes.text}>
          From now on, every change anyone makes in this workspace is recorded here: who did it, what changed, and when and
          where it happened.
        </p>
      </div>

      <ul className={classes.areas}>
        {WORKSPACE_CATEGORIES.map((c) => {
          const { label, examples, icon: Icon } = CATEGORY_META[c];
          return (
            <li key={c} className={classes.area}>
              <span className={classes.areaIcon}>
                <Icon size={15} />
              </span>
              <span>
                <span className={classes.areaLabel}>{label}</span>
                <span className={classes.areaText}>{examples}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
