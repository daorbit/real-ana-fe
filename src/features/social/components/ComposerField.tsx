import { Box, Group, Text } from "@mantine/core";

/**
 * A labelled block in the composer column.
 *
 * `mb={10}` between label and field, `mb="xl"` between one field and the next:
 * a label sitting almost flush against its own input read as cramped, and with
 * too little space below a field the next label looked like it belonged to the
 * field above it.
 */
export function ComposerField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Box mb="xl">
      <Group justify="space-between" align="baseline" mb={10} wrap="nowrap">
        <Text size="sm" fw={600}>{label}</Text>
        {hint && <Text size="xs" c="dimmed">{hint}</Text>}
      </Group>
      {children}
    </Box>
  );
}
