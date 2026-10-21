import { Suspense } from "react";
import { Skeleton, Stack } from "@mantine/core";
import type { WorkspaceAppId } from "@/shared/types";
import { APP_SETTINGS } from "./appSettings";

export function hasAppSettings(app: WorkspaceAppId): boolean {
  return Boolean(APP_SETTINGS[app]);
}

export function QuantalogAppSettings({ app, workspaceId }: { app: WorkspaceAppId; workspaceId: string }) {
  const Settings = APP_SETTINGS[app];
  if (!Settings) return null;
  return (
    <Suspense
      fallback={
        <Stack gap="md">
          <Skeleton height={132} radius="md" />
          <Skeleton height={280} radius="md" />
        </Stack>
      }
    >
      <Settings workspaceId={workspaceId} />
    </Suspense>
  );
}
