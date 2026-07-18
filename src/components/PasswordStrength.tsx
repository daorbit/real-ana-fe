import { Box, Group, Text } from "@mantine/core";
import { Check, X } from "lucide-react";
import { passwordScore } from "../utils/validate";

/**
 * Strength meter plus the rules, shown live as they are met.
 *
 * The requirements are listed rather than only enforced on submit — a rule you
 * discover by failing is a worse experience than one you can see. The meter
 * carries severity through the fill colour, and the unfilled track is a
 * neutral step so state reads across the whole bar.
 */
const LEVELS = [
  { label: "Too short", color: "var(--muted)" },
  { label: "Weak", color: "#ef4444" },
  { label: "Fair", color: "#f59e0b" },
  { label: "Good", color: "#34d399" },
  { label: "Strong", color: "#10b981" },
];

function Rule({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <Group gap={6} wrap="nowrap">
      {met ? (
        <Check size={12} style={{ color: "#34d399", flexShrink: 0 }} />
      ) : (
        <X size={12} style={{ color: "var(--muted)", flexShrink: 0 }} />
      )}
      <Text size="xs" c={met ? "dimmed" : "dimmed"} style={{ opacity: met ? 0.75 : 1 }}>
        {children}
      </Text>
    </Group>
  );
}

export function PasswordStrength({ value }: { value: string }) {
  // Nothing typed yet: showing a red "weak" bar before the first keystroke
  // reads as an error the user hasn't made.
  if (!value) return null;

  const score = passwordScore(value);
  const level = LEVELS[score];

  return (
    <Box mt={8}>
      <Group gap={4} wrap="nowrap" mb={6}>
        {[0, 1, 2, 3].map((i) => (
          <Box
            key={i}
            style={{
              height: 3,
              flex: 1,
              borderRadius: 2,
              background: i < score ? level.color : "var(--border)",
              transition: "background 0.2s ease",
            }}
          />
        ))}
      </Group>

      <Group justify="space-between" wrap="nowrap" mb={6}>
        <Text size="xs" c="dimmed">
          Password strength
        </Text>
        <Text size="xs" fw={600} style={{ color: level.color }}>
          {level.label}
        </Text>
      </Group>

      <Group gap={12} wrap="wrap">
        <Rule met={value.length >= 8}>8+ characters</Rule>
        <Rule met={/[a-zA-Z]/.test(value)}>A letter</Rule>
        <Rule met={/[0-9]/.test(value)}>A number</Rule>
      </Group>
    </Box>
  );
}
