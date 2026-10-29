import { Button, Group, Stack } from "@mantine/core";
import { Plus } from "lucide-react";
import { PageTabs } from "@/shared/ui/PageTabs";
import { pageTabId, pageTabPanelId } from "@/shared/ui/pageTabIds";
import { PrimaryDbTab } from "@/features/admin/components/database/PrimaryDbTab";
import { ConnectionDbTab } from "@/features/admin/components/database/ConnectionDbTab";
import { AiUsageTab } from "@/features/admin/components/database/AiUsageTab";
import { AddDbConnectionModal } from "@/features/admin/components/database/AddDbConnectionModal";
import { AI_TAB, useDatabaseTabs } from "../../useDatabaseTabs";
import { useAddDbConnectionForm } from "../../useAddDbConnectionForm";
import { AdminSection } from "../layout/AdminSection";
import { AdminRefreshButton } from "../layout/AdminRefreshButton";

const TAB_PREFIX = "database";

export default function DatabasePanel() {
  const db = useDatabaseTabs();
  const form = useAddDbConnectionForm((created) => db.setActive(created.id));

  return (
    <AdminSection
      id="database"
      actions={
        <Group gap="xs" wrap="nowrap">
          <Button variant="default" size="sm" radius="md" leftSection={<Plus size={14} />} onClick={form.open}>
            Add database
          </Button>
          <AdminRefreshButton onClick={db.refresh} loading={db.refreshing} />
        </Group>
      }
    >
      <Stack gap="lg">
        <PageTabs
          items={db.tabs}
          active={db.current}
          onChange={db.setActive}
          label="Databases"
          idPrefix={TAB_PREFIX}
        />

        <div
          role="tabpanel"
          id={pageTabPanelId(TAB_PREFIX, db.current)}
          aria-labelledby={pageTabId(TAB_PREFIX, db.current)}
        >
          {db.current === AI_TAB ? (
            <AiUsageTab accounts={db.primary.data?.workersAi} trendRef={db.trendRef} />
          ) : db.connection ? (
            <ConnectionDbTab
              connection={db.connection}
              data={db.connectionStats.currentData}
              error={db.connectionStats.error}
              fetching={db.connectionStats.isFetching}
              onRetry={db.refresh}
              onRemove={() => db.connection && db.remove(db.connection)}
            />
          ) : (
            <PrimaryDbTab data={db.primary.data} />
          )}
        </div>
      </Stack>

      <AddDbConnectionModal
        opened={form.opened}
        draft={form.draft}
        saving={form.saving}
        canSubmit={form.canSubmit}
        set={form.set}
        onClose={form.close}
        onSubmit={form.submit}
      />
    </AdminSection>
  );
}
