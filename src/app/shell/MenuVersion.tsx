import { dateTime } from "@/shared/lib";
import { BUILD } from "@/shared/lib/buildInfo";
import classes from "./MenuVersion.module.css";

export function MenuVersion() {
  return (
    <footer className={classes.root} aria-label="App version">
      <div className={classes.top}>
        <span className={classes.name}>Quantalog {BUILD.version}</span>
        {BUILD.env !== "production" && <span className={classes.env}>{BUILD.env}</span>}
      </div>
      <span className={classes.meta}>Updated {dateTime(BUILD.builtAt)}</span>
    </footer>
  );
}
