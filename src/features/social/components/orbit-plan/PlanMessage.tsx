import { Box, Group, Text } from "@mantine/core";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
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
    <Group gap={12} wrap="nowrap" align="flex-start">
      <Box style={{ flexShrink: 0, marginTop: 1 }}>
        <OrbitMark size={22} />
      </Box>
      <Text size="sm" lh={1.6} style={{ whiteSpace: "pre-wrap", minWidth: 0, flex: 1 }}>
        {turn.content}
      </Text>
    </Group>
  );
}
