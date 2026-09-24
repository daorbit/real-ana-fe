import { Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { PageHelpButton } from "@/shared/ui/PageHelpButton";
import { RoleGate } from "@/features/billing/components/RoleGate";
import { useWorkspace } from "@/features/workspace/context";
import { useTitle } from "@/shared/lib/useTitle";
import { ApiKeysPanel } from "../components/developers/ApiKeysPanel";
import { QuickStartPanel } from "../components/developers/QuickStartPanel";

export default function Developers() {
  useTitle("Developers");
  const { t } = useTranslation();
  const { active } = useWorkspace();

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
            <ApiKeysPanel workspaceId={active._id} workspaceName={active.name} />
            <QuickStartPanel />
          </Stack>
        )}
      </RoleGate>
    </AppShell>
  );
}
