import { RingProgress } from "@mantine/core";
import { Check, Minus } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { SECURITY_ROW_IDS } from "./securityRows";
import classes from "./Security.module.css";

function jumpTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function SecurityOverview() {
  const { user } = useAuth();
  if (!user) return null;

  const checks = [
    { id: SECURITY_ROW_IDS.password, label: "Password", on: Boolean(user.hasPassword) },
    { id: SECURITY_ROW_IDS.twoFactor, label: "Two-factor", on: Boolean(user.totpEnabled) },
    { id: SECURITY_ROW_IDS.screenLock, label: "Screen lock", on: Boolean(user.screenLockEnabled) },
  ];
  const done = checks.filter((c) => c.on).length;
  const left = checks.length - done;
  const allDone = left === 0;

  return (
    <section className={`${classes.overview} tone-tile`} data-tone={allDone ? "teal" : "amber"}>
      <div className={classes.summary}>
        <RingProgress
          size={76}
          thickness={6}
          roundCaps
          rootColor="var(--surface-2)"
          sections={[{ value: (done / checks.length) * 100, color: "var(--tone)" }]}
          label={
            <span className={classes.ringLabel}>
              {done}
              <span className={classes.ringOf}>/{checks.length}</span>
            </span>
          }
        />
        <div className={classes.summaryText}>
          <span className={classes.eyebrow}>Security checkup</span>
          <h2 className={classes.headline}>
            {allDone
              ? "Your account is well protected"
              : `${left} protection${left === 1 ? "" : "s"} left to turn on`}
          </h2>
          <p className={classes.sub}>
            {allDone
              ? "Password, two-factor and screen lock are all on."
              : "Each one closes a different way into your account."}
          </p>
        </div>
      </div>

      <div className={classes.chips}>
        {checks.map((c) => (
          <button key={c.id} type="button" className={classes.chip} onClick={() => jumpTo(c.id)}>
            <span className={classes.chipIcon} data-on={c.on || undefined}>
              {c.on ? <Check size={12} strokeWidth={3} /> : <Minus size={12} strokeWidth={3} />}
            </span>
            {c.label}
          </button>
        ))}
      </div>
    </section>
  );
}
