import { Button, Center, Group, Loader, Stack } from "@mantine/core";
import { Trash2 } from "lucide-react";
import type { DbConnection, DbStorageStats } from "@/shared/types";
import { errMessage } from "@/shared/lib/notify";
import { ErrorState } from "@/shared/ui/ErrorState";
import { StorageTab } from "./StorageTab";
import { SubHeading } from "./shared";

type Props = {
  connection: DbConnection;
  data: DbStorageStats | undefined;
  error: unknown;
  fetching: boolean;
  onRetry: () => void;
  onRemove: () => void;
};

export function ConnectionDbTab({ connection, data, error, fetching, onRetry, onRemove }: Props) {
  const where = `${connection.host} · ${connection.dbName || "default database"}`;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <SubHeading title={connection.label} text={where} />
        <Button variant="subtle" color="gray" size="xs" leftSection={<Trash2 size={14} />} onClick={onRemove}>
          Remove
        </Button>
      </Group>

      {error && !fetching ? (
        <ErrorState
          compact
          title="Couldn't read this database"
          description={errMessage(error, "The connection failed. Try again in a moment.")}
          onRetry={onRetry}
        />
      ) : !data ? (
        <Center py={64}><Loader size="sm" /></Center>
      ) : (
        <StorageTab data={data} limitNote="Limit set when this database was added" />
      )}
    </Stack>
  );
}
