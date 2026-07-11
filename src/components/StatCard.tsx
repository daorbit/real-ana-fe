import { Card, Group, Text, ThemeIcon, Badge } from "@mantine/core";
import type { LucideIcon } from "lucide-react";

const TINT: Record<string, { from: string; to: string; icon: string; ring: string }> = {
  violet: { from: "rgba(143,107,238,0.18)", to: "rgba(109,92,255,0.02)", icon: "#a88ff1", ring: "rgba(124,92,255,0.35)" },
  green:  { from: "rgba(52,211,153,0.18)",  to: "rgba(52,211,153,0.02)", icon: "#34d399", ring: "rgba(52,211,153,0.35)" },
  cyan:   { from: "rgba(34,211,238,0.18)",  to: "rgba(34,211,238,0.02)", icon: "#22d3ee", ring: "rgba(34,211,238,0.35)" },
  amber:  { from: "rgba(251,191,36,0.18)",  to: "rgba(251,191,36,0.02)", icon: "#fbbf24", ring: "rgba(251,191,36,0.35)" },
  pink:   { from: "rgba(244,114,182,0.18)", to: "rgba(244,114,182,0.02)", icon: "#f472b6", ring: "rgba(244,114,182,0.35)" },
};

export function StatCard({
  icon: Icon, label, value, color = "violet", live,
}: { icon: LucideIcon; label: string; value: number; color?: keyof typeof TINT | string; live?: boolean }) {
  const t = TINT[color] ?? TINT.violet;
  return (
    <Card
      radius="lg"
      padding="lg"
      style={{
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${t.from}, ${t.to}), var(--mantine-color-body)`,
        border: `1px solid ${t.ring}`,
      }}
    >
      <Group justify="space-between" align="flex-start">
        <ThemeIcon
          size={40} radius="md" variant="filled"
          style={{ background: "rgba(255,255,255,0.06)", color: t.icon, border: `1px solid ${t.ring}` }}
        >
          <Icon size={19} />
        </ThemeIcon>
        {live && <Badge color="green" variant="dot" size="sm">live</Badge>}
      </Group>
      <Text fw={800} fz={32} mt="md" lh={1} style={{ letterSpacing: "-0.03em", color: live ? t.icon : "var(--mantine-color-text)" }}>
        {value.toLocaleString()}
      </Text>
      <Text c="dimmed" size="sm" mt={6}>{label}</Text>
    </Card>
  );
}
