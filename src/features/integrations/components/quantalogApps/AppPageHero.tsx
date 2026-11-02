import type { ReactNode } from "react";
import { BrandMark } from "../logos/BrandMarks";
import type { WorkspaceAppInfo } from "../../lib/quantalogApps";
import classes from "./QuantalogApp.module.css";

export function AppPageHero({ info, actions }: { info: WorkspaceAppInfo; actions: ReactNode }) {
  return (
    <section className={classes.hero}>
      <span className={classes.heroIcon} aria-hidden>
        <BrandMark id={info.tileId} size={112} />
      </span>
      <div className={classes.heroText}>
        <h1 className={classes.heroName}>{info.name}</h1>
        <p className={classes.heroTagline}>{info.tagline}</p>
        <div className={classes.heroActions}>{actions}</div>
      </div>
    </section>
  );
}
