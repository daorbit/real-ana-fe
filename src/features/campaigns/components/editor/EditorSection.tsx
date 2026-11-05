import type { ReactNode } from "react";
import classes from "./Editor.module.css";

interface Props {
  title: string;
  aside?: ReactNode;
  note?: string;
  children: ReactNode;
}

export function EditorSection({ title, aside, note, children }: Props) {
  return (
    <section className={classes.group}>
      <div className={classes.groupHead}>
        <h2 className={classes.groupTitle}>{title}</h2>
        {aside}
      </div>
      <div className={classes.panel}>{children}</div>
      {note && <p className={classes.groupNote}>{note}</p>}
    </section>
  );
}
