import { Card, Center, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { AlertTriangle, CheckCircle2, Info, XCircle, FileSearch } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Severity → colour/icon/label/rail, shared by the issue lists. */
export const SEVERITY = {
  critical: { color: "red", icon: XCircle, label: "Critical", rail: "#ef4444" },
  warning: { color: "yellow", icon: AlertTriangle, label: "Warning", rail: "#f59e0b" },
  info: { color: "blue", icon: Info, label: "Suggestion", rail: "#3b82f6" },
} as const;

/**
 * A titled panel — the house card.
 *
 * Title and one line of description, no icon chip: the section headings above
 * already say what a panel is about, and an icon on every card was noise.
 * `icon`, `color` and `semantic` are still accepted so call sites stay as they
 * are; a `semantic` panel shows a small status dot in its colour.
 */
export function Panel({
  title,
  description,
  color = "emerald",
  semantic = false,
  right,
  children,
  padding = "lg",
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  color?: string;
  semantic?: boolean;
  right?: React.ReactNode;
  children: React.ReactNode;
  padding?: string | number;
}) {
  return (
    <Card withBorder radius="md" padding={padding} className="seo-panel">
      <Group justify="space-between" align="flex-start" wrap="nowrap" className="seo-panel-head" mb="md">
        <div style={{ minWidth: 0 }}>
          <Group gap={8} wrap="nowrap">
            {semantic && (
              <span
                aria-hidden
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: `var(--mantine-color-${color}-6)`,
                }}
              />
            )}
            <Text fw={600} size="sm" style={{ letterSpacing: "-0.01em" }}>
              {title}
            </Text>
          </Group>
          {description && (
            <Text size="xs" c="dimmed" mt={2}>
              {description}
            </Text>
          )}
        </div>
        {right}
      </Group>
      {children}
    </Card>
  );
}

/** A pass/fail row for a boolean signal, since half of technical SEO is one. */
export function CheckRow({
  ok,
  label,
  detail,
}: {
  ok: boolean;
  label: string;
  detail?: string;
  /** Accepted for call-site compatibility; the row shows its status instead. */
  icon?: LucideIcon;
}) {
  const StatusIcon = ok ? CheckCircle2 : XCircle;
  return (
    <Group gap="sm" wrap="nowrap" py={9} className="seo-check">
      <StatusIcon
        size={16}
        style={{ flexShrink: 0 }}
        color={ok ? "var(--mantine-color-teal-6)" : "var(--mantine-color-red-6)"}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <Text size="sm" fw={500}>
          {label}
        </Text>
        {detail && (
          <Text size="xs" c="dimmed" truncate>
            {detail}
          </Text>
        )}
      </div>
      <Text size="xs" fw={500} c={ok ? "teal.6" : "red.6"}>
        {ok ? "Pass" : "Fail"}
      </Text>
    </Group>
  );
}

/** A centred empty state for a panel with nothing to show. */
export function Empty({ children }: { children: string }) {
  return (
    <Center py="xl">
      <Stack align="center" gap={6}>
        <ThemeIcon size={34} radius="xl" variant="light" color="gray">
          <FileSearch size={17} />
        </ThemeIcon>
        <Text size="sm" c="dimmed" ta="center" maw={320}>
          {children}
        </Text>
      </Stack>
    </Center>
  );
}
