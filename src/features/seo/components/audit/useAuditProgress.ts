import { useEffect, useState } from "react";
import { AUDIT_PHASES } from "./auditPhases";

const TICK = 250;
const CHECK_EVERY = 1400;

function phaseAt(elapsed: number): number {
  let edge = 0;
  for (let i = 0; i < AUDIT_PHASES.length; i++) {
    edge += AUDIT_PHASES[i].duration;
    if (elapsed < edge) return i;
  }
  return AUDIT_PHASES.length - 1;
}

export function useAuditProgress(running: boolean) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    setElapsed(0);
    const started = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - started), TICK);
    return () => clearInterval(id);
  }, [running]);

  const phase = phaseAt(elapsed);
  const checks = AUDIT_PHASES[phase].checks;
  const check = checks[Math.floor(elapsed / CHECK_EVERY) % checks.length];
  const seconds = Math.floor(elapsed / 1000);
  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return { phase, check, clock, total: AUDIT_PHASES.length };
}
