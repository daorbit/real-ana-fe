import { ActionIcon, Box, Group, Stack, Text, Tooltip } from "@mantine/core";
import { AlertTriangle, Check, Palette, RotateCcw } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import type { PlanTurn } from "../../hooks/useOrbitPlan";
import classes from "./planMessage.module.css";

/**
 * One turn, styled like the main Orbit panel: the author gets a filled bubble,
 * Orbit speaks as plain text on the surface. Two bubbles read as two systems
 * talking past each other.
 */
export function PlanMessage({
  turn,
  onApproveImage,
  onRetryImage,
  generating,
  onApproveCaption,
}: {
  turn: PlanTurn;
  onApproveImage?: () => void;
  onRetryImage?: () => void;
  generating?: boolean;
  onApproveCaption?: () => void;
}) {
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

  if (turn.image) {
    return (
      <Group gap={12} wrap="nowrap" align="flex-start">
        <Box style={{ flexShrink: 0, marginTop: 1 }}>
          <OrbitMark size={22} />
        </Box>
        <Stack gap={8} style={{ minWidth: 0 }}>
          {turn.image.status === "generating" ? (
            <div className={classes.generatingImage}>
              <div className={classes.generatingImageSweep} />
              <Palette size={20} className={classes.generatingImageIcon} />
              <Text size="xs" fw={500} className={classes.generatingImageLabel}>
                Painting
              </Text>
            </div>
          ) : turn.image.status === "failed" ? (
            <Group
              gap={8}
              p={12}
              wrap="nowrap"
              style={{
                border: "1px dashed var(--mantine-color-red-6)",
                borderRadius: 12,
                background: "var(--surface)",
              }}
            >
              <AlertTriangle size={16} color="var(--mantine-color-red-6)" />
              <Text size="xs" c="red">Couldn't draw that.</Text>
              {onRetryImage && (
                <Tooltip label="Try again" withArrow>
                  <ActionIcon size="sm" variant="subtle" color="gray" onClick={onRetryImage} disabled={generating}>
                    <RotateCcw size={14} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          ) : (
            <Box style={{ position: "relative", width: 200 }}>
              <img
                src={turn.image.url}
                alt={turn.image.prompt}
                style={{
                  width: 200,
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 12,
                  border: "1px solid var(--mantine-color-default-border)",
                  display: "block",
                  opacity: turn.image.status === "approved" ? 0.6 : 1,
                }}
              />
              {turn.image.status === "approved" && (
                <Group
                  gap={5}
                  wrap="nowrap"
                  style={{
                    position: "absolute", top: 8, left: 8,
                    background: "var(--mantine-color-emerald-6)",
                    color: "#fff", borderRadius: 999, padding: "3px 9px",
                  }}
                >
                  <Check size={12} />
                  <Text size="10px" fw={600}>Added</Text>
                </Group>
              )}
            </Box>
          )}

          {turn.image.status === "ready" && (
            <Group gap={8}>
              <ActionIcon
                size="sm"
                radius="xl"
                color="emerald"
                variant="filled"
                onClick={onApproveImage}
                aria-label="Use this image"
              >
                <Check size={14} />
              </ActionIcon>
              <Tooltip label="Draw again" withArrow>
                <ActionIcon
                  size="sm"
                  radius="xl"
                  variant="subtle"
                  color="gray"
                  onClick={onRetryImage}
                  disabled={generating}
                  aria-label="Draw again"
                >
                  <RotateCcw size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
          )}
        </Stack>
      </Group>
    );
  }

  return (
    <Group gap={12} wrap="nowrap" align="flex-start">
      <Box style={{ flexShrink: 0, marginTop: 1 }}>
        <OrbitMark size={22} />
      </Box>
      <Stack gap={8} style={{ minWidth: 0, flex: 1 }}>
        <Text size="sm" lh={1.6} style={{ whiteSpace: "pre-wrap" }}>
          {turn.content}
        </Text>

        {turn.caption && (
          <Box
            p={12}
            style={{
              border: `1px solid ${turn.caption.status === "approved" ? "var(--mantine-color-emerald-6)" : "var(--mantine-color-default-border)"}`,
              borderRadius: "var(--mantine-radius-md)",
              background: "var(--surface)",
            }}
          >
            <Text size="sm" lh={1.6} style={{ whiteSpace: "pre-wrap" }}>
              {turn.caption.text}
            </Text>
            <Group justify="flex-end" mt={10}>
              {turn.caption.status === "approved" ? (
                <Group gap={5} wrap="nowrap">
                  <Check size={13} color="var(--mantine-color-emerald-6)" />
                  <Text size="xs" c="emerald.6" fw={500}>Added to the post</Text>
                </Group>
              ) : (
                <ActionIcon
                  size="sm"
                  radius="xl"
                  color="emerald"
                  variant="filled"
                  onClick={onApproveCaption}
                  aria-label="Use this caption"
                >
                  <Check size={14} />
                </ActionIcon>
              )}
            </Group>
          </Box>
        )}
      </Stack>
    </Group>
  );
}
