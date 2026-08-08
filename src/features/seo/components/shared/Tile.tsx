import { Box, Text, ThemeIcon, Tooltip } from "@mantine/core";
import type { LucideIcon } from "lucide-react";

/**
 * A compact metric tile used across the content and technical tabs.
 *
 * Neutral by default: the icon and value only take colour when `tone` marks the
 * value as a verdict (good/warn/bad). A grid of tinted tiles was the "rainbow"
 * that read as unfinished, so colour is reserved for something meaning it.
 */
export function Tile({
  label,
  value,
  icon: Icon,
  color: _color,
  tone,
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Accepted for call-site compatibility; superseded by `tone`. */
  color?: string;
  tone?: "good" | "warn" | "bad";
  hint?: string;
}) {
  const toneColor =
    tone === "good" ? "teal" : tone === "warn" ? "yellow" : tone === "bad" ? "red" : "gray";
  const body = (
    <Box className="seo-tile" p="md">
      <ThemeIcon size={28} radius="md" variant="light" color={tone ? toneColor : "gray"} mb="sm">
        <Icon size={14} />
      </ThemeIcon>
      <Text
        fz={26}
        fw={700}
        lh={1.1}
        c={tone ? `${toneColor}.5` : undefined}
        style={{ letterSpacing: "-0.03em", fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </Text>
      <Text size="xs" c="dimmed" mt={2} truncate>
        {label}
      </Text>
    </Box>
  );
  return hint ? (
    <Tooltip label={hint} withArrow>
      {body}
    </Tooltip>
  ) : (
    body
  );
}
