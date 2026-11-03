import type { ReactNode } from "react";
import { BrandMark } from "../logos/BrandMarks";
import classes from "./StudioPageHero.module.css";

interface Props {
  brand: string;
  name: string;
  tagline?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
}

export function StudioPageHero({ brand, name, tagline, badge, actions }: Props) {
  return (
    <section className={classes.hero}>
      <span className={classes.icon} aria-hidden>
        <BrandMark id={brand} size={112} />
      </span>
      <div className={classes.text}>
        <div className={classes.nameRow}>
          <h1 className={classes.name}>{name}</h1>
          {badge}
        </div>
        {tagline && <p className={classes.tagline}>{tagline}</p>}
        {actions && <div className={classes.actions}>{actions}</div>}
      </div>
    </section>
  );
}
