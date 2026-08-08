import { Badge, Card, Center, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { AlertTriangle, CheckCircle2, Info, XCircle, FileSearch } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Severity → colour/icon/label/rail, shared by the issue lists. */
export const SEVERITY = {
  critical: { color: "red", icon: XCircle, label: "Critical", rail: "#ef4444" },
  warning: { color: "yellow", icon: AlertTriangle, label: "Warning", rail: "#f59e0b" },
  info: { color: "blue", icon: Info, label: "Suggestion", rail: "#3b82f6" },
} as const;

/** A titled panel — the house card, with a neutral icon so tabs stay calm. */
export function Panel({
  title,
  description,
  icon: Icon,
  color = "emerald",
  semantic = false,
  right,
  children,
  padding = "lg",
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  color?: string;
  /** When true, the icon keeps `color` because it signals status; otherwise neutral. */
  semantic?: boolean;
  right?: React.ReactNode;
  children: React.ReactNode;
  padding?: string | number;
}) {
  return (
    <Card withBorder radius="md" padding={padding} className="seo-panel">
      <Group
        justify="space-between"
        align="flex-start"
        wrap="nowrap"
        className="seo-panel-head"
        mb="md"
        pb="sm"
      >
        <Group gap="sm" wrap="nowrap">
          {/* One neutral icon treatment across every panel — a tinted chip per
              section was the rainbow that made the page read as unfinished. The
              `color` prop is still accepted so callers stay unchanged, but only
              a genuinely semantic panel (set via `semantic`) shows colour. */}
          <ThemeIcon size={32} radius="md" variant="light" color={semantic ? color : "gray"} className="seo-panel-ic">
            <Icon size={16} />
          </ThemeIcon>
          <div style={{ minWidth: 0 }}>
            <Text fw={650} size="sm" style={{ letterSpacing: "-0.01em" }}>
              {title}
            </Text>
            {description && (
              <Text size="xs" c="dimmed" mt={1}>
                {description}
              </Text>
            )}
          </div>
        </Group>
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
  icon: Icon,
}: {
  ok: boolean;
  label: string;
  detail?: string;
  icon?: LucideIcon;
}) {
  return (
    <Group gap="sm" wrap="nowrap" py={9}>
      <ThemeIcon size={26} radius="xl" variant="light" color={ok ? "teal" : "red"}>
        {Icon ? <Icon size={13} /> : ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
      </ThemeIcon>
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
      <Badge size="xs" variant="light" color={ok ? "teal" : "red"}>
        {ok ? "Pass" : "Fail"}
      </Badge>
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
