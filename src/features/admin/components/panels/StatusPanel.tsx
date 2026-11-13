import { useState } from "react";
import { Button, Center, Group, Loader } from "@mantine/core";
import { ExternalLink, Plus } from "lucide-react";
import { ErrorState } from "@/shared/ui/ErrorState";
import { SITE_URL } from "@/shared/lib/docsSlugs";
import { useGetAdminStatusQuery } from "../../status/api";
import { useStatusActions } from "../../status/useStatusActions";
import { AdminSection } from "../layout/AdminSection";
import { LiveChecks } from "../status/LiveChecks";
import { IncidentList } from "../status/IncidentList";
import { NewIncidentModal } from "../status/NewIncidentModal";
import { IncidentModal } from "../status/IncidentModal";
import classes from "../status/Status.module.css";

export default function StatusPanel() {
  const { data, isLoading, isError, refetch } = useGetAdminStatusQuery();
  const actions = useStatusActions();
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = data ? [...data.open, ...data.closed].find((i) => i.id === openId) ?? null : null;
  const subscribers = data?.subscribers.confirmed ?? 0;

  return (
    <AdminSection
      id="status"
      actions={
        <Group gap="sm">
          <Button component="a" href={`${SITE_URL}/status`} target="_blank" rel="noreferrer" variant="default" leftSection={<ExternalLink size={15} />}>
            Public page
          </Button>
          <Button leftSection={<Plus size={15} />} onClick={() => setCreating(true)} disabled={!data}>
            Open incident
          </Button>
        </Group>
      }
    >
      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isLoading || !data ? (
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      ) : (
        <div className={classes.stack}>
          <LiveChecks checks={data.components} />
          <IncidentList
            title="Open"
            note={`${subscribers.toLocaleString()} subscribers${data.subscribers.pending ? `, ${data.subscribers.pending} not confirmed` : ""}${data.pendingEmails ? ` · ${data.pendingEmails} email batches sending` : ""}`}
            incidents={data.open}
            empty="No open incidents or scheduled maintenance."
            onOpen={(i) => setOpenId(i.id)}
          />
          <IncidentList title="Closed" incidents={data.closed} empty="Nothing closed yet." onOpen={(i) => setOpenId(i.id)} />
        </div>
      )}

      <NewIncidentModal
        opened={creating}
        busy={actions.creating}
        subscribers={subscribers}
        onClose={() => setCreating(false)}
        onCreate={actions.create}
      />
      {open && (
        <IncidentModal
          key={open.id + open.updates.length}
          incident={open}
          subscribers={subscribers}
          posting={actions.posting}
          editing={actions.editing}
          onClose={() => setOpenId(null)}
          onPost={(update) => actions.post(open.id, update)}
          onEdit={(edit) => actions.edit(open.id, edit)}
          onDelete={() => actions.remove(open.id, () => setOpenId(null))}
        />
      )}
    </AdminSection>
  );
}
