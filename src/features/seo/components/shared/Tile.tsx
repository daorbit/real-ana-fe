import { Box, Text, Tooltip } from "@mantine/core";
import type { LucideIcon } from "lucide-react";

/**
 * A compact metric: a label over a number.
 *
 * Neutral by default — the value only takes colour when `tone` marks it as a
 * verdict (good/warn/bad). `icon` and `color` are accepted for call-site
 * compatibility but not drawn: a grid of icon chips read as clutter.
 */
export function Tile({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  color?: string;
  tone?: "good" | "warn" | "bad";
  hint?: string;
}) {
  const toneColor = tone === "good" ? "teal" : tone === "warn" ? "yellow" : tone === "bad" ? "red" : undefined;
  const body = (
    <Box className="seo-tile" px="md" py={12}>
      <Text size="xs" c="dimmed" truncate>
        {label}
      </Text>
      <Text
        fz={22}
        fw={650}
        lh={1.2}
        mt={4}
        c={toneColor ? `${toneColor}.6` : undefined}
        truncate
        style={{ letterSpacing: "-0.02em", fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </Text>
    </Box>
  );
  return hint ? (
    <Tooltip label={hint} withArrow multiline w={260}>
      {body}
    </Tooltip>
  ) : (
    body
  );
}
