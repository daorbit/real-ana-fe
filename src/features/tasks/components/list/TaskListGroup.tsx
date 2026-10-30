import type { ReactNode } from "react";
import classes from "./TaskList.module.css";

export function TaskListGroup({
  title,
  count,
  tone,
  children,
}: {
  title: string;
  count?: number;
  tone?: "danger";
  children: ReactNode;
}) {
  return (
    <section className={classes.group}>
      <header className={classes.groupHead} data-tone={tone}>
        <span className={classes.groupTitle}>{title}</span>
        {count !== undefined && <span className={classes.groupCount}>{count}</span>}
      </header>
      <div className={classes.list}>{children}</div>
    </section>
  );
}
