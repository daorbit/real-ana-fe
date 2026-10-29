import { Center, Loader, Stack } from "@mantine/core";
import type { DbStats } from "@/shared/types";
import { StorageTab } from "./StorageTab";
import { SubHeading } from "./shared";

export function PrimaryDbTab({ data }: { data: DbStats | undefined }) {
  if (!data) {
    return <Center py={64}><Loader size="sm" /></Center>;
  }

  return (
    <Stack gap="md">
      <SubHeading title="Storage" text={`What “${data.name}” is using, and how much room is left on the plan.`} />
      <StorageTab data={data} limitNote="Atlas M0 free-tier ceiling" />
    </Stack>
  );
}
