import { Box, Group, Text } from "@mantine/core";
import { Check } from "lucide-react";

/** The two stages: what gets written, then when it goes out. */
export const STEPS = [
  { id: "content" as const, label: "Write" },
  { id: "schedule" as const, label: "Schedule" },
];

export type Step = (typeof STEPS)[number]["id"];

/**
 * Which stage the composer is on.
 *
 * Doubles as a status rather than only a label: a completed step keeps a tick,
 * so someone returning to this screen after switching tabs can see where they
 * left off without re-reading the form. Only a step already passed is
 * clickable — a step ahead cannot be jumped to before the content behind it is
 * valid, which is the same rule the Continue button enforces.
 */
export function ComposerSteps({
  step,
  onStep,
}: {
  step: Step;
  onStep: (step: Step) => void;
}) {
  const currentIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <Group gap={6} wrap="nowrap" ml="auto">
      {STEPS.map((s, i) => {
        const active = step === s.id;
        const done = currentIndex > i;
        const reachable = done;

        return (
          <Group key={s.id} gap={6} wrap="nowrap">
            {i > 0 && (
              <Box style={{ width: 20, height: 1, background: "var(--mantine-color-default-border)" }} />
            )}
            <Group
              gap={6}
              wrap="nowrap"
              onClick={() => reachable && onStep(s.id)}
              style={{ cursor: reachable ? "pointer" : "default" }}
            >
              <Box
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                  background: active || done ? "var(--accent)" : "var(--mantine-color-default)",
                  color: active || done ? "#fff" : "var(--mantine-color-dimmed)",
                  border: active || done ? "none" : "1px solid var(--mantine-color-default-border)",
                }}
              >
                {done ? <Check size={12} /> : i + 1}
              </Box>
              <Text size="sm" fw={active ? 600 : 500} c={active ? undefined : "dimmed"}>
                {s.label}
              </Text>
            </Group>
          </Group>
        );
      })}
    </Group>
  );
}
