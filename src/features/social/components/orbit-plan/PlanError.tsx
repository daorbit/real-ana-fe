import { Box, Button, Group, Stack, Text } from "@mantine/core";
import { RefreshCw } from "lucide-react";

/**
 * A turn Orbit could not finish.
 *
 * The bare red line it replaced said what broke and nothing about what to do
 * next, in a thread where the author's own words had just disappeared. This
 * keeps the message, hands back the retry, and stays visibly part of the
 * conversation rather than reading as the whole panel failing.
 */
export function PlanError({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  /** Sends the author's last message again — it is still in the input box. */
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <Box
      p={16}
      style={{
        border: "1px solid var(--mantine-color-default-border)",
        borderRadius: "var(--mantine-radius-md)",
        background: "var(--surface-2)",
      }}
    >
      <Stack gap={10} align="center">
        <DriftingOrbit />
        <Text size="sm" fw={600} ta="center">That one got away from me</Text>
        <Text size="xs" c="dimmed" ta="center" lh={1.55} maw={320}>
          {message}
        </Text>
        <Group gap="sm" mt={2}>
          <Button
            size="xs"
            variant="light"
            color="emerald"
            leftSection={<RefreshCw size={13} />}
            loading={retrying}
            onClick={onRetry}
          >
            Try again
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}

/**
 * A small mark that drifts off its orbit and settles — the failure, drawn.
 *
 * Inline rather than an asset: it has to follow the accent and both themes,
 * and a GIF would be a fixed-colour rectangle in the middle of a themed panel.
 * Motion is dropped entirely under prefers-reduced-motion.
 */
function DriftingOrbit() {
  return (
    <Box component="svg" viewBox="0 0 120 72" style={{ width: 132, height: 80 }} aria-hidden="true">
      <ellipse
        cx="52" cy="36" rx="30" ry="17"
        fill="none"
        stroke="var(--mantine-color-default-border)"
        strokeWidth="1.5"
        strokeDasharray="4 5"
      />
      <ellipse
        cx="52" cy="36" rx="30" ry="17"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        opacity="0.35"
        transform="rotate(-18 52 36)"
      />
      {/* The one that left. It slides out along the ellipse and fades, then
          restarts — a loop, not a one-shot, so a reader who looked away still
          sees what happened. */}
      <circle r="5" fill="var(--accent)" className="plan-error-dot">
        <animateMotion
          dur="3.2s"
          repeatCount="indefinite"
          keyPoints="0;0.55;1"
          keyTimes="0;0.6;1"
          calcMode="spline"
          keySplines="0.4 0 0.2 1;0.4 0 1 1"
          path="M 52 19 A 30 17 0 0 1 82 36 L 112 30"
        />
        <animate
          attributeName="opacity"
          values="1;1;0.15"
          keyTimes="0;0.6;1"
          dur="3.2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="52" cy="36" r="8" fill="var(--accent)" opacity="0.18" />
      <circle cx="52" cy="36" r="3.5" fill="var(--accent)" opacity="0.55" />
    </Box>
  );
}
