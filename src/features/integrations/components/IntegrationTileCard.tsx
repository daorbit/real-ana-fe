import type { ReactNode } from "react";
import { Badge, Button, Group, Text } from "@mantine/core";
import { Check, CircleDashed, CirclePause, Link2, Power, RefreshCw, Settings2, TriangleAlert } from "lucide-react";
import { ConnectionCard } from "@/features/auth/components/settings/ConnectionCard";
import { timeAgo } from "@/shared/lib/format";
import { BrandMark, CARD_MARK_SIZE } from "./logos/BrandMarks";
import { appGuideUrl } from "../lib/links";
import type { IntegrationTile } from "../types";
import classes from "./IntegrationTileCard.module.css";

interface Props {
  tile: IntegrationTile;
  busy?: boolean;
  lockedReason?: string;
  onOpen: (tile: IntegrationTile) => void;
}

interface Footer {
  icon: ReactNode;
  label: string;
  action: string;
  actionIcon: ReactNode;
  variant: "default" | "light";
  color?: string;
}

function enabledLabel(tile: IntegrationTile): string {
  if (tile.kind === "webhook") return "On for every form";
  const base = tile.account ?? "Connected";
  return tile.lastUsedAt ? `${base} · used ${timeAgo(tile.lastUsedAt)}` : base;
}

function footerFor(tile: IntegrationTile): Footer {
  const webhook = tile.kind === "webhook";
  if (tile.kind === "quantalog-app") {
    return tile.enabled
      ? {
          icon: <Check size={14} className={classes.ok} />,
          label: tile.account ?? "On",
          action: "Manage",
          actionIcon: <Settings2 size={14} />,
          variant: "default",
        }
      : {
          icon: <CircleDashed size={14} className={classes.idle} />,
          label: "Off",
          action: "Enable",
          actionIcon: <Power size={14} />,
          variant: "light",
        };
  }
  if (tile.enabled) {
    return {
      icon: <Check size={14} className={classes.ok} />,
      label: enabledLabel(tile),
      action: webhook ? "Turn off" : "Manage",
      actionIcon: webhook ? <Power size={14} /> : <Settings2 size={14} />,
      variant: "default",
    };
  }
  if (tile.connected) {
    const expired = tile.kind === "calendar" || tile.kind === "sheets" || tile.kind === "search-console";
    return expired
      ? {
          icon: <TriangleAlert size={14} className={classes.warn} />,
          label: "Access expired",
          action: "Reconnect",
          actionIcon: <RefreshCw size={14} />,
          variant: "light",
          color: "orange",
        }
      : {
          icon: <CirclePause size={14} className={classes.paused} />,
          label: "Saved, switched off",
          action: "Turn on",
          actionIcon: <Power size={14} />,
          variant: "light",
        };
  }
  return {
    icon: <CircleDashed size={14} className={classes.idle} />,
    label: "Not connected",
    action: webhook ? "Turn on" : "Connect",
    actionIcon: webhook ? <Power size={14} /> : <Link2 size={14} />,
    variant: "light",
  };
}

function ModeBadge({ tile }: { tile: IntegrationTile }) {
  if (tile.kind === "quantalog-app") {
    return (
      <Badge size="xs" variant="light" color="blue">
        Official
      </Badge>
    );
  }
  if (tile.kind !== "payment" || !tile.enabled) return null;
  const live = tile.account === "Live mode";
  return (
    <Badge size="xs" variant="light" color={live ? "teal" : "gray"}>
      {live ? "Live" : "Test"}
    </Badge>
  );
}

function TileFooter({ tile, busy, lockedReason, onOpen }: Props) {
  if (lockedReason) {
    return (
      <div className={classes.footer}>
        <Text size="xs" c="dimmed">
          {lockedReason}
        </Text>
      </div>
    );
  }

  const footer = footerFor(tile);
  return (
    <Group justify="space-between" gap="sm" wrap="nowrap" className={classes.footer}>
      <Group gap={8} wrap="nowrap" className={classes.status}>
        {footer.icon}
        <Text size="xs" c="dimmed" truncate>
          {footer.label}
        </Text>
      </Group>
      <Button
        type="button"
        size="xs"
        radius="md"
        variant={footer.variant}
        color={footer.color}
        loading={busy}
        leftSection={footer.actionIcon}
        onClick={() => onOpen(tile)}
        className={classes.action}
        aria-label={`${footer.action} ${tile.name}`}
      >
        {footer.action}
      </Button>
    </Group>
  );
}

export function IntegrationTileCard(props: Props) {
  const { tile } = props;
  return (
    <ConnectionCard
      mark={<BrandMark id={tile.id} size={CARD_MARK_SIZE} />}
      brand={tile.id}
      name={tile.name}
      hint={tile.description}
      badge={<ModeBadge tile={tile} />}
      docsUrl={appGuideUrl(tile.id)}
    >
      <TileFooter {...props} />
    </ConnectionCard>
  );
}
