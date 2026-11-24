import { Button, Group, Text } from "@mantine/core";
import classes from "./searchConsole.module.css";

export function SearchPager({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (!total) return null;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const step = (label: string, next: number, disabled: boolean) => (
    <Button
      variant="default"
      radius="xl"
      size="compact-sm"
      className={classes.pillButton}
      disabled={disabled}
      onClick={() => onChange(next)}
    >
      {label}
    </Button>
  );

  return (
    <Group justify="space-between" gap="sm" className={classes.pagerRow}>
      <Text size="xs" c="dimmed">
        {((page - 1) * pageSize + 1).toLocaleString()}–{Math.min(page * pageSize, total).toLocaleString()} of{" "}
        {total.toLocaleString()}
      </Text>
      {pages > 1 && (
        <Group gap={6} wrap="nowrap">
          {step("Previous", page - 1, page <= 1)}
          {step("Next", page + 1, page >= pages)}
        </Group>
      )}
    </Group>
  );
}
