import { RingProgress, Text, Stack, Tooltip, Box, Group, ThemeIcon } from "@mantine/core";
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle } from "lucide-react";

/**
 * Lighthouse's own thresholds: 90+ passes, 50-89 needs work, under 50 fails.
 * Matching them means a score here means the same thing as a score in
 * PageSpeed Insights, which is where people will go to check us.
 */
export function scoreColor(score: number | null): string {
  if (score === null) return "gray";
  if (score >= 90) return "teal";
  if (score >= 50) return "yellow";
  return "red";
}

/** The same three bands, spelled out — a colour alone is not a verdict. */
export function scoreLabel(score: number | null): string {
  if (score === null) return "Not measured";
  if (score >= 90) return "Good";
  if (score >= 50) return "Needs work";
  return "Poor";
}

export function ScoreBadgeIcon({ score, size = 14 }: { score: number | null; size?: number }) {
  const Icon =
    score === null ? MinusCircle : score >= 90 ? CheckCircle2 : score >= 50 ? AlertTriangle : XCircle;
  return <Icon size={size} />;
}

/**
 * One score, as a ring with its verdict underneath.
 *
 * `hero` is the overall score: bigger, with the verdict spelled out, because it
 * is the number someone reads first and repeats to their team.
 */
export function ScoreRing({
  label,
  score,
  size = 92,
  hint,
  hero = false,
}: {
  label: string;
  /** 0-100, or null when the audit did not produce this category. */
  score: number | null;
  size?: number;
  hint?: string;
  hero?: boolean;
}) {
  const color = scoreColor(score);

  const ring = (
    <Stack gap={8} align="center" style={{ cursor: hint ? "help" : undefined }}>
      <RingProgress
        size={size}
        thickness={hero ? 10 : 7}
        roundCaps
        sections={[{ value: score ?? 0, color }]}
        rootColor="var(--mantine-color-default-border)"
        label={
          <Stack gap={0} align="center">
            <Text
              ta="center"
              fw={800}
              lh={1}
              fz={hero ? 34 : 20}
              style={{ letterSpacing: "-0.03em" }}
            >
              {score ?? "—"}
            </Text>
            {hero && (
              <Text ta="center" size="xs" c="dimmed" mt={2}>
                / 100
              </Text>
            )}
          </Stack>
        }
      />
      <Box ta="center">
        <Text size={hero ? "sm" : "xs"} fw={600} lh={1.2}>
          {label}
        </Text>
        <Group gap={4} justify="center" mt={3}>
          <ThemeIcon size={14} radius="xl" variant="transparent" color={color}>
            <ScoreBadgeIcon score={score} size={11} />
          </ThemeIcon>
          <Text size="xs" c={color === "gray" ? "dimmed" : color}>
            {scoreLabel(score)}
          </Text>
        </Group>
      </Box>
    </Stack>
  );

  return hint ? (
    <Tooltip label={hint} withArrow multiline w={250} position="bottom">
      {ring}
    </Tooltip>
  ) : (
    ring
  );
}
