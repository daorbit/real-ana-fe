import { Box, Group, Text } from "@mantine/core";

export function Meter({
  label,
  used,
  limit,
  pct,
}: {
  label: string;
  used: string;
  limit?: string;
  pct: number | null;
}) {
  const tone = pct == null ? "gray.5" : pct >= 90 ? "red.5" : pct >= 75 ? "yellow.5" : "emerald.5";
  return (
    <div>
      <Text size="xs" c="dimmed" fw={550}>{label}</Text>
      <Group gap={6} align="baseline" mt={2}>
        <Text fw={700} fz="lg" style={{ letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{used}</Text>
        {limit && <Text size="xs" c="dimmed">of {limit}</Text>}
      </Group>
      <Box mt={8} h={5} style={{ borderRadius: 3, background: "var(--mantine-color-default-border)", overflow: "hidden" }}>
        <Box
          h="100%"
          w={pct == null ? "0%" : `${Math.max(2, Math.min(100, pct))}%`}
          style={{ background: `var(--mantine-color-${tone.replace(".", "-")})`, borderRadius: 3 }}
        />
      </Box>
      {pct != null && <Text size="xs" c="dimmed" mt={3}>{pct.toFixed(pct < 1 ? 1 : 0)}%</Text>}
    </div>
  );
}

export function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <Text fw={700} fz="xl" style={{ letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Text>
      <Text size="sm" fw={550} mt={2}>{label}</Text>
      {hint && <Text size="xs" c="dimmed">{hint}</Text>}
    </div>
  );
}

export function Num({
  children,
  fw = 500,
  c,
}: {
  children: React.ReactNode;
  fw?: number;
  c?: string;
}) {
  return (
    <Text component="span" size="sm" fw={fw} c={c} style={{ fontVariantNumeric: "tabular-nums" }}>
      {children}
    </Text>
  );
}
