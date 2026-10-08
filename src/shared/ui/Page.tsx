import type { ReactNode } from "react";
import { Box, Group, Text, Title, Stack, Divider } from "@mantine/core";
import { DocsButton } from "@/shared/ui/DocsButton";
import { ActivityBellIcon } from "@/features/activity/ActivityBell";
import type { DocsSlug } from "@/shared/lib/docsSlugs";
import classes from "@/shared/ui/Page.module.css";


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
  /** Path suffix appended to the hosted docs base URL, e.g. "/overview". */
  docsPath?: DocsSlug;
}) {
  return (
    <Box mb="xl">
      <Group justify="space-between" align="flex-start" gap="md" wrap="wrap">
        <div className={classes.titleCol}>
          <Title order={1} className={classes.title}>
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
          <Group gap="sm" wrap="nowrap" visibleFrom="sm">
            <DocsButton path={docsPath} />
            <ActivityBellIcon />
          </Group>
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
        <div className={classes.sectionHead}>
          <Text fw={650} size="sm" className={classes.sectionTitle}>
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
        <div className={classes.fieldLabel}>
          <Text size="sm" fw={500}>
            {label}
          </Text>
          {hint && (
            <Text size="xs" c="dimmed" mt={3} className={classes.fieldHint}>
              {hint}
            </Text>
          )}
        </div>
        <div className={classes.fieldControl}>{children}</div>
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
    <Stack gap="xl" maw={maxWidth}>
      {children}
    </Stack>
  );
}
