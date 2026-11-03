import type { ReactNode } from "react";
import classes from "./searchConsole.module.css";

export function SearchSectionHead({
  title,
  description,
  right,
  large = false,
}: {
  title: ReactNode;
  description?: ReactNode;
  right?: ReactNode;
  large?: boolean;
}) {
  return (
    <header className={classes.groupHead}>
      <div className={classes.groupHeadText}>
        <h2 className={large ? classes.groupTitleLarge : classes.groupTitle}>{title}</h2>
        {description && <p className={classes.groupDesc}>{description}</p>}
      </div>
      {right}
    </header>
  );
}

export function SearchCardHead({
  title,
  description,
  right,
}: {
  title: ReactNode;
  description?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header className={classes.cardHead}>
      <div className={classes.groupHeadText}>
        <h3 className={classes.cardTitle}>{title}</h3>
        {description && <p className={classes.cardDesc}>{description}</p>}
      </div>
      {right}
    </header>
  );
}
