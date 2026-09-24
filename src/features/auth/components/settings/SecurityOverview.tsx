import { Box, RingProgress, Text } from "@mantine/core";
import { Check, Minus } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import classes from "./Security.module.css";

export function SecurityOverview() {
  const { user } = useAuth();
  if (!user) return null;

  const checks = [
    { label: "Password", on: Boolean(user.hasPassword), onText: "Set", offText: "Not set" },
    { label: "Two-factor", on: Boolean(user.totpEnabled), onText: "On", offText: "Off" },
    { label: "Screen lock", on: Boolean(user.screenLockEnabled), onText: "On", offText: "Off" },
  ];
  const done = checks.filter((c) => c.on).length;
  const allDone = done === checks.length;

  return (
    <Box className={classes.overview}>
      <Box className={classes.score}>
        <RingProgress
          size={56}
          thickness={5}
          roundCaps
          sections={[{ value: (done / checks.length) * 100, color: allDone ? "green" : "yellow" }]}
          label={
            <Text ta="center" fw={700} size="sm">
              {done}/{checks.length}
            </Text>
          }
        />
        <Box>
          <Text fw={650} size="sm">
            {allDone ? "Your account is well protected" : "Security checkup"}
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {allDone
              ? "Every protection is turned on."
              : `${done} of ${checks.length} protections on. Turn on the rest below.`}
          </Text>
        </Box>
      </Box>

      {checks.map((c) => (
        <Box key={c.label} className={classes.check}>
          <span className={classes.checkIcon} data-on={c.on || undefined}>
            {c.on ? <Check size={15} /> : <Minus size={15} />}
          </span>
          <Box>
            <Text size="sm" fw={600}>
              {c.label}
            </Text>
            <Text size="xs" c="dimmed">
              {c.on ? c.onText : c.offText}
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
