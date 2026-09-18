import type { ReactNode } from "react";
import { Box, Group, Text, Title, Stack, Divider } from "@mantine/core";
import { DocsButton } from "@/shared/ui/DocsButton";
import { ActivityBellIcon } from "@/features/activity/ActivityBell";


export function PageHeader({
  title,
  description,
  actions,
  children,
  docsPath,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** Buttons and controls, right-aligned on wide screens. */
  actions?: ReactNode;
  /** Anything that belongs under the header — filters, tabs. */
  children?: ReactNode;
  /** Path suffix appended to the hosted docs base URL, e.g. "/analytics". */
  docsPath?: string;
}) {
  return (
    <Box mb="xl">
      <Group justify="space-between" align="flex-start" gap="md" wrap="wrap">
        <div style={{ flex: "1 1 260px", minWidth: 0 }}>
          <Title order={1} style={{ letterSpacing: "-0.02em" }}>
            {title}
          </Title>
          {description && (
            <Text c="dimmed" size="sm" mt={6}>
              {description}
            </Text>
          )}
        </div>
        <Group gap="sm" wrap="wrap" justify="flex-end">
          {actions}
    
          <DocsButton path={docsPath} />
          <ActivityBellIcon />
        </Group>
      </Group>
      {children && <Box mt="lg">{children}</Box>}
    </Box>
  );
}


export function Section({
  title,
  description,
  actions,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box>
      <Group justify="space-between" align="flex-end" mb="sm" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Text fw={650} size="sm" style={{ letterSpacing: "-0.01em" }}>
            {title}
          </Text>
          {description && (
            <Text c="dimmed" size="xs" mt={2}>
              {description}
            </Text>
          )}
        </div>
        {actions}
      </Group>
      <Box className="surface-card">{children}</Box>
    </Box>
  );
}


export function Field({
  label,
  hint,
  children,
  last = false,
}: {
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  /** Suppress the divider on the final row. */
  last?: boolean;
}) {
  return (
    <>
      <Group
        justify="space-between"
        align="flex-start"
        wrap="wrap"
        gap="md"
        px="lg"
        py="md"
      >
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <Text size="sm" fw={500}>
            {label}
          </Text>
          {hint && (
            <Text size="xs" c="dimmed" mt={3} style={{ maxWidth: "46ch" }}>
              {hint}
            </Text>
          )}
        </div>
        <div style={{ flex: "0 1 320px", minWidth: 240 }}>{children}</div>
      </Group>
      {!last && <Divider />}
    </>
  );
}


export function PageStack({
  children,
  maxWidth = 860,
}: {
  children: ReactNode;
  maxWidth?: number | string;
}) {
  return (
    <Stack gap="xl" style={{ maxWidth }}>
      {children}
    </Stack>
  );
}
