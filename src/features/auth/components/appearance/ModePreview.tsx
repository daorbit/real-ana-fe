import type { ThemeMode } from "@/shared/lib/theme";
import classes from "./ModePicker.module.css";

function MiniDashboard({ tone }: { tone: "light" | "dark" }) {
  return (
    <div className={classes.mini} data-tone={tone}>
      <div className={classes.miniBar} />
      <div className={classes.miniBody}>
        <div className={classes.miniSide}>
          <span className={classes.miniActive} />
          <span className={classes.miniLine} />
          <span className={classes.miniLine} />
          <span className={classes.miniLine} />
        </div>
        <div className={classes.miniMain}>
          <span className={classes.miniTitle}>Your Dashboard</span>
          <span className={classes.miniBlock} />
        </div>
      </div>
    </div>
  );
}

export function ModePreview({ mode }: { mode: ThemeMode }) {
  if (mode === "system") {
    return (
      <div className={classes.preview} aria-hidden>
        <div className={classes.splitLight}>
          <MiniDashboard tone="light" />
        </div>
        <div className={classes.splitDark}>
          <MiniDashboard tone="dark" />
        </div>
      </div>
    );
  }

  return (
    <div className={classes.preview} aria-hidden>
      <MiniDashboard tone={mode} />
    </div>
  );
}
