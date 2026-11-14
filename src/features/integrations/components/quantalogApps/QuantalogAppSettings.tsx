import { Suspense } from "react";
import { Stack } from "@mantine/core";
import { PanelSkeleton } from "@/shared/ui/Skeletons";
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
          <PanelSkeleton height={132} />
          <PanelSkeleton height={280} />
        </Stack>
      }
    >
      <Settings workspaceId={workspaceId} />
    </Suspense>
  );
}
