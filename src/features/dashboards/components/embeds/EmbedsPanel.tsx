import { UnstyledButton } from "@mantine/core";
import { CodeXml, Lock, Plus } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { EmbedCard } from "@/features/dashboards/components/embeds/EmbedCard";
import { useEmbedActions } from "@/features/dashboards/hooks/useEmbedActions";
import type { Embed } from "@/features/dashboards/types";
import classes from "@/features/dashboards/components/embeds/Embeds.module.css";

export function EmbedsPanel({
  workspaceId,
  embeds,
  canEdit,
  locked,
  planName,
  onOpen,
  onNew,
}: {
  workspaceId: string;
  embeds: Embed[];
  canEdit: boolean;
  locked: boolean;
  planName: string;
  onOpen: (embed: Embed) => void;
  onNew: () => void;
}) {
  const { toggleEmbed, deleteEmbed } = useEmbedActions(workspaceId);

  if (embeds.length === 0 && locked) {
    return (
      <EmptyState
        icon={Lock}
        title="Embedded widgets are on Starter and up"
        description={`The ${planName} plan doesn't include embeds. Upgrade to put live charts and KPIs on your website, a client portal or a Notion page.`}
        action={{ label: "See plans", to: "/app/billing" }}
        minHeight="44vh"
      />
    );
  }

  if (embeds.length === 0) {
    return (
      <EmptyState
        icon={CodeXml}
        title="No embedded widgets yet"
        description="Put a live chart or KPI on your own website, a client portal or a Notion page. Each embed publishes only its own numbers."
        action={canEdit ? { label: "Embed a widget", icon: Plus, onClick: onNew } : undefined}
        minHeight="44vh"
      />
    );
  }

  return (
    <div className={classes.grid}>
      {embeds.map((e) => (
        <EmbedCard
          key={e.id}
          embed={e}
          canEdit={canEdit}
          onOpen={() => onOpen(e)}
          onToggle={(enabled) => toggleEmbed(e, enabled)}
          onDelete={() => deleteEmbed(e)}
        />
      ))}
      {canEdit && !locked && (
        <UnstyledButton className={classes.newTile} onClick={onNew}>
          <span className={classes.newTileIcon}><Plus size={20} /></span>
          <span className={classes.newTileTitle}>Embed a widget</span>
          <span className={classes.newTileText}>Pick a chart or KPI, copy one line of code</span>
        </UnstyledButton>
      )}
    </div>
  );
}
