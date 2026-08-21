import { Box, Group, Text } from "@mantine/core";
import type { PlanTurn } from "../../hooks/useOrbitPlan";

/**
 * One turn, styled like the main Orbit panel: the author gets a filled bubble,
 * Orbit speaks as plain text on the surface. Two bubbles read as two systems
 * talking past each other.
 */
export function PlanMessage({ turn }: { turn: PlanTurn }) {
  if (turn.role === "user") {
    return (
      <Group justify="flex-end" wrap="nowrap">
        <Box
          className="orbit-bubble-user"
          style={{ maxWidth: "85%", padding: "8px 13px", borderRadius: 14, borderBottomRightRadius: 4 }}
        >
          <Text size="sm" lh={1.55} style={{ whiteSpace: "pre-wrap" }}>
            {turn.content}
          </Text>
        </Box>
      </Group>
    );
  }

  return (
    <Text size="sm" lh={1.6} style={{ whiteSpace: "pre-wrap" }}>
      {turn.content}
    </Text>
  );
}
