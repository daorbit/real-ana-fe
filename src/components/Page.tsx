import type { ReactNode } from "react";
import { Box, Group, Text, Title, Stack, Divider } from "@mantine/core";

/**
 * Shared page furniture.
 *
 * Every screen was hand-rolling its own title block and card headers, which is
 * why they drifted apart. These are deliberately thin — layout and rhythm
 * only, no behaviour — so a page can adopt them without changing what it does.
 */

/** The title block at the top of a page: heading, one line of context, actions. */
export function PageHeader({
  title,
  description,
  actions,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** Buttons and controls, right-aligned on wide screens. */
  actions?: ReactNode;
  /** Anything that belongs under the header — filters, tabs. */
  children?: ReactNode;
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
        {actions && (
          <Group gap="sm" wrap="wrap" justify="flex-end">
            {actions}
          </Group>
        )}
      </Group>
      {children && <Box mt="lg">{children}</Box>}
    </Box>
  );
}

/**
 * A titled group of related settings or content.
 *
 * The label sits outside the surface rather than inside it — a heading on its
 * own line above the card scans faster than one more row of text within it.
 */
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

/**
 * One labelled control inside a Section, as a row on wide screens.
 *
 * Label and help text on the left, the control on the right — so a column of
 * settings reads as a list of decisions rather than a stack of inputs.
 */
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

/** Vertical rhythm between sections on a settings-style page. */
export function PageStack({ children }: { children: ReactNode }) {
  return (
    <Stack gap="xl" style={{ maxWidth: 860 }}>
      {children}
    </Stack>
  );
}
