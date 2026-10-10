import { Button, Text } from "@mantine/core";
import type { AuditEntry } from "@/shared/types";
import { AuditRow } from "./AuditRow";
import classes from "./AuditLog.module.css";

export function AccountActivityList({
  items,
  hasMore,
  loadingMore,
  onLoadMore,
}: {
  items: AuditEntry[];
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}) {
  if (!items.length) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="lg">
        Nothing recorded yet. Sign-ins and security changes will show up here.
      </Text>
    );
  }

  return (
    <>
      <div className={classes.flat}>
        {items.map((entry) => (
          <AuditRow key={entry.id} entry={entry} perspective="self" />
        ))}
      </div>
      {hasMore && (
        <div className={classes.more}>
          <Button variant="default" size="xs" radius="md" loading={loadingMore} onClick={onLoadMore}>
            Show older activity
          </Button>
        </div>
      )}
    </>
  );
}
