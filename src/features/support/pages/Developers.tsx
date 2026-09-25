import { useState } from "react";
import { Tabs } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
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
import classes from "../components/developers/Developers.module.css";

const TABS = ["keys", "usage", "quickstart"] as const;
type DevTab = (typeof TABS)[number];

function isTab(value: string | null): value is DevTab {
  return TABS.includes(value as DevTab);
}

export default function Developers() {
  useTitle("Developers");
  const { t } = useTranslation();
  const { active } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const [windowDays, setWindowDays] = useState<ApiKeyUsageWindow>(30);

  const requested = params.get("tab");
  const tab: DevTab = isTab(requested) ? requested : "keys";
  const focusKeyId = params.get("key");

  const update = (next: { tab?: DevTab; key?: string | null }) => {
    setParams(
      (prev) => {
        const out = new URLSearchParams(prev);
        const nextTab = next.tab ?? tab;
        if (nextTab === "keys") out.delete("tab");
        else out.set("tab", nextTab);
        if (next.key !== undefined) {
          if (next.key) out.set("key", next.key);
          else out.delete("key");
        }
        if (nextTab !== "usage") out.delete("key");
        return out;
      },
      { replace: true },
    );
  };

  const viewKeyUsage = (keyId: string) => update({ tab: "usage", key: keyId });

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
          <Tabs
            value={tab}
            onChange={(v) => isTab(v) && update({ tab: v })}
            keepMounted={false}
            classNames={{ list: classes.tabList, tab: classes.tab }}
          >
            <Tabs.List>
              <Tabs.Tab value="keys">{t("developers.tabKeys")}</Tabs.Tab>
              <Tabs.Tab value="usage">{t("developers.tabUsage")}</Tabs.Tab>
              <Tabs.Tab value="quickstart">{t("developers.tabQuickstart")}</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="keys" className={classes.tabPanel}>
              <ApiKeysPanel
                workspaceId={active._id}
                workspaceName={active.name}
                windowDays={windowDays}
                onViewUsage={viewKeyUsage}
              />
            </Tabs.Panel>

            <Tabs.Panel value="usage" className={classes.tabPanel}>
              <UsageOverview
                workspaceId={active._id}
                windowDays={windowDays}
                onWindowChange={setWindowDays}
                focusKeyId={focusKeyId}
                onFocusKey={(key) => update({ key })}
                onCreateKey={() => update({ tab: "keys" })}
              />
            </Tabs.Panel>

            <Tabs.Panel value="quickstart" className={classes.tabPanel}>
              <QuickStartPanel workspaceId={active._id} onCreateKey={() => update({ tab: "keys" })} />
            </Tabs.Panel>
          </Tabs>
        )}
      </RoleGate>
    </AppShell>
  );
}
