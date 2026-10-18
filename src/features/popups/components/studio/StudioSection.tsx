import type { ReactNode } from "react";
import classes from "@/features/popups/components/studio/PopupStudio.module.css";

export function StudioSection({
  step,
  title,
  description,
  done,
  children,
}: {
  step: number;
  title: string;
  description: string;
  done?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={classes.section}>
      <header className={classes.sectionHead}>
        <span className={classes.step} data-done={done || undefined}>
          {step}
        </span>
        <div>
          <h3 className={classes.sectionTitle}>{title}</h3>
          <p className={classes.sectionText}>{description}</p>
        </div>
      </header>
      <div className={classes.sectionBody}>{children}</div>
    </section>
  );
}
