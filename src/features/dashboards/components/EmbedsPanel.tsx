import { ActionIcon, Badge, Button, Switch, Tooltip } from "@mantine/core";
import { Code2, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { WIDGET_MAP } from "@/features/analytics/widgetCatalog";
import { useDeleteEmbedMutation, useGetEmbedsQuery, useUpdateEmbedMutation } from "@/features/dashboards/api";
import { confirmDelete, errMessage, notify } from "@/shared/lib/notify";
import { num, timeAgo } from "@/shared/lib";
import type { Embed } from "@/features/dashboards/types";
import classes from "@/features/dashboards/components/Dashboards.module.css";

export function EmbedsPanel({
  workspaceId,
  canEdit,
  onOpen,
  onNew,
}: {
  workspaceId: string;
  canEdit: boolean;
  onOpen: (embed: Embed) => void;
  onNew: () => void;
}) {
  const { data: embeds = [], isLoading } = useGetEmbedsQuery(workspaceId);
  const [update] = useUpdateEmbedMutation();
  const [remove] = useDeleteEmbedMutation();

  const toggle = async (e: Embed, enabled: boolean) => {
    try {
      await update({ workspaceId, id: e.id, enabled }).unwrap();
    } catch (err) {
      notify.error(errMessage(err, "Could not update the embed."));
    }
  };

  const askDelete = (e: Embed) =>
    confirmDelete({
      title: "Delete embed?",
      body: <>“{e.name}” will stop loading on every site it's embedded on. This can't be undone.</>,
      onConfirm: async () => {
        try {
          await remove({ workspaceId, id: e.id }).unwrap();
        } catch (err) {
          notify.error(errMessage(err, "Could not delete the embed."));
        }
      },
    });

  if (isLoading) return null;

  if (embeds.length === 0) {
    return (
      <EmptyState
        icon={Code2}
        title="No embedded widgets yet"
        description="Put a live chart or KPI on your own website, a client portal or a Notion page. Each embed publishes only its own numbers."
        action={canEdit ? { label: "Embed a widget", icon: Plus, onClick: onNew } : undefined}
        minHeight="44vh"
      />
    );
  }

  return (
    <>
      {canEdit && (
        <div className={classes.viewActions}>
          <Button color="emerald" leftSection={<Plus size={15} />} onClick={onNew} mb="md">
            Embed a widget
          </Button>
        </div>
      )}
      <div className={classes.embedList}>
        {embeds.map((e) => (
          <div key={e.id} className={classes.embedRow} data-disabled={!e.enabled || undefined}>
            <div className={classes.embedMain}>
              <span className={classes.templateIcon}><Code2 size={15} /></span>
              <div className={classes.cardText}>
                <div className={classes.embedName}>{e.name}</div>
                <div className={classes.embedWidget}>
                  {WIDGET_MAP[e.widget]?.label ?? e.widget} · {e.range} · {e.theme}
                  {e.sites.length > 0 && ` · ${e.sites.length} site${e.sites.length === 1 ? "" : "s"}`}
                </div>
              </div>
            </div>
            <div className={classes.embedStats}>
              {num(e.views)} view{e.views === 1 ? "" : "s"}
              {e.lastViewedAt && ` · last ${timeAgo(e.lastViewedAt)}`}
            </div>
            <div>
              {canEdit ? (
                <Tooltip label={e.enabled ? "Live — turn off to stop it loading" : "Off — embeds show nothing"} withArrow>
                  <Switch color="emerald" checked={e.enabled} onChange={(ev) => toggle(e, ev.currentTarget.checked)} aria-label="Embed enabled" />
                </Tooltip>
              ) : (
                <Badge variant="light" color={e.enabled ? "emerald" : "gray"}>{e.enabled ? "Live" : "Off"}</Badge>
              )}
            </div>
            <div className={classes.embedActions}>
              <Button variant="default" size="xs" leftSection={<Code2 size={13} />} onClick={() => onOpen(e)}>
                Get code
              </Button>
              {canEdit && (
                <Tooltip label="Delete" withArrow>
                  <ActionIcon variant="subtle" color="red" onClick={() => askDelete(e)} aria-label="Delete embed">
                    <Trash2 size={15} />
                  </ActionIcon>
                </Tooltip>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
