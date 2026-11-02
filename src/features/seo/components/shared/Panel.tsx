import { Center, Stack, Text, ThemeIcon } from "@mantine/core";
import { AlertTriangle, Info, XCircle, FileSearch } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SeoCard } from "./SeoCard";
import { ListRow } from "./SeoList";
import { StatusMark } from "./Pill";

export const SEVERITY = {
  critical: { color: "red", icon: XCircle, label: "Critical", rail: "var(--red)" },
  warning: { color: "yellow", icon: AlertTriangle, label: "Warning", rail: "var(--amber)" },
  info: { color: "blue", icon: Info, label: "Suggestion", rail: "var(--accent)" },
} as const;

export function Panel({
  title,
  description,
  right,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  color?: string;
  semantic?: boolean;
  right?: React.ReactNode;
  children: React.ReactNode;
  padding?: string | number;
  className?: string;
}) {
  return (
    <SeoCard title={title} description={description} right={right} className={className}>
      {children}
    </SeoCard>
  );
}

export function CheckRow({
  ok,
  label,
  detail,
  state,
}: {
  ok: boolean;
  label: string;
  detail?: string;
  state?: string;
  icon?: LucideIcon;
}) {
  return (
    <ListRow
      lead={<StatusMark ok={ok} />}
      title={label}
      sub={detail}
      clip
      aside={<Text size="xs" c="dimmed">{state ?? (ok ? "Passed" : "Missing")}</Text>}
    />
  );
}

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
