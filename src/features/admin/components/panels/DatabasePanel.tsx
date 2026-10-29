import { Button, Group, Tabs } from "@mantine/core";
import { Plus } from "lucide-react";
import { PrimaryDbTab } from "@/features/admin/components/database/PrimaryDbTab";
import { ConnectionDbTab } from "@/features/admin/components/database/ConnectionDbTab";
import { AiUsageTab } from "@/features/admin/components/database/AiUsageTab";
import { AddDbConnectionModal } from "@/features/admin/components/database/AddDbConnectionModal";
import { AI_TAB, PRIMARY_TAB, useDatabaseTabs } from "../../useDatabaseTabs";
import { useAddDbConnectionForm } from "../../useAddDbConnectionForm";
import { AdminSection } from "../layout/AdminSection";
import { AdminRefreshButton } from "../layout/AdminRefreshButton";

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
      <Tabs value={db.current} onChange={(v) => v && db.setActive(v)} keepMounted={false}>
        <Tabs.List mb="lg">
          {db.tabs.map(({ id, label, icon: Icon }) => (
            <Tabs.Tab key={id} value={id} leftSection={Icon && <Icon size={14} />}>
              {label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value={PRIMARY_TAB}>
          <PrimaryDbTab data={db.primary.data} />
        </Tabs.Panel>

        {db.connection && (
          <Tabs.Panel value={db.connection.id}>
            <ConnectionDbTab
              connection={db.connection}
              data={db.connectionStats.currentData}
              error={db.connectionStats.error}
              fetching={db.connectionStats.isFetching}
              onRetry={db.refresh}
              onRemove={() => db.connection && db.remove(db.connection)}
            />
          </Tabs.Panel>
        )}

        <Tabs.Panel value={AI_TAB}>
          <AiUsageTab accounts={db.primary.data?.workersAi} trendRef={db.trendRef} />
        </Tabs.Panel>
      </Tabs>

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
