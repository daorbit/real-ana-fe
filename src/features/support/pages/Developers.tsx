import { useRef, useState } from "react";
import { Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { PageHelpButton } from "@/shared/ui/PageHelpButton";
import { RoleGate } from "@/features/billing/components/RoleGate";
import { useWorkspace } from "@/features/workspace/context";
import { useTitle } from "@/shared/lib/useTitle";
import type { ApiKeyUsageWindow } from "@/shared/types";
import { ApiKeysPanel } from "../components/developers/ApiKeysPanel";
import { UsageOverview } from "../components/developers/UsageOverview";
import { QuickStartPanel } from "../components/developers/QuickStartPanel";
import { PlaygroundPanel } from "../components/developers/PlaygroundPanel";
import classes from "../components/developers/Developers.module.css";

export default function Developers() {
  useTitle("Developers");
  const { t } = useTranslation();
  const { active } = useWorkspace();
  const [windowDays, setWindowDays] = useState<ApiKeyUsageWindow>(30);
  const [focusKeyId, setFocusKeyId] = useState<string | null>(null);
  const usageRef = useRef<HTMLDivElement>(null);

  const focusKeyUsage = (keyId: string) => {
    setFocusKeyId(keyId);
    usageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <AppShell>
      <PageHeader
        title={t("developers.title")}
        description={t("developers.description")}
        docsPath="/platform-api"
        actions={<PageHelpButton />}
      />

      <RoleGate minimum="admin" what="Only admins can manage API keys.">
        {active && (
          <Stack gap="xl">
            <div ref={usageRef} className={classes.usageAnchor}>
              <UsageOverview
                workspaceId={active._id}
                windowDays={windowDays}
                onWindowChange={setWindowDays}
                focusKeyId={focusKeyId}
                onFocusKey={setFocusKeyId}
              />
            </div>
            <ApiKeysPanel
              workspaceId={active._id}
              workspaceName={active.name}
              windowDays={windowDays}
              focusKeyId={focusKeyId}
              onFocusKey={focusKeyUsage}
            />
            <PlaygroundPanel workspaceId={active._id} />
            <QuickStartPanel />
          </Stack>
        )}
      </RoleGate>
    </AppShell>
  );
}
