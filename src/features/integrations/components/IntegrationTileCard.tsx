import { Anchor, Badge, Button, Group, Text } from "@mantine/core";
import { Check, CirclePause, Link2, TriangleAlert } from "lucide-react";
import { ConnectionCard } from "@/features/auth/components/settings/ConnectionCard";
import { timeAgo } from "@/shared/lib/format";
import { BrandMark } from "./logos/BrandMarks";
import { CONNECT_HINT } from "../lib/catalog";
import type { IntegrationTile } from "../types";
import classes from "./IntegrationTileCard.module.css";

interface Props {
  tile: IntegrationTile;
  busy?: boolean;
  lockedReason?: string;
  onOpen: (tile: IntegrationTile) => void;
}

function enabledLabel(tile: IntegrationTile): string {
  if (tile.kind === "webhook") return "On for every form";
  const base = tile.account ?? "Connected";
  return tile.lastUsedAt ? `${base} · used ${timeAgo(tile.lastUsedAt)}` : base;
}

function ModeBadge({ tile }: { tile: IntegrationTile }) {
  if (tile.kind !== "payment" || !tile.enabled) return null;
  const live = tile.account === "Live mode";
  return (
    <Badge size="xs" variant="light" color={live ? "teal" : "gray"}>
      {live ? "Live" : "Test"}
    </Badge>
  );
}

function TileStatus({ tile, busy, lockedReason, onOpen }: Props) {
  if (lockedReason) {
    return (
      <Text size="xs" c="dimmed">
        {lockedReason}
      </Text>
    );
  }

  if (tile.enabled) {
    return (
      <Group gap={8} wrap="nowrap" className={classes.status}>
        <Check size={14} className={classes.ok} />
        <Text size="xs" c="dimmed" truncate>
          {enabledLabel(tile)}
        </Text>
        <Anchor
          component="button"
          type="button"
          size="xs"
          c="dimmed"
          underline="always"
          disabled={busy}
          onClick={() => onOpen(tile)}
          className={classes.link}
        >
          {tile.kind === "webhook" ? "Turn off" : "Manage"}
        </Anchor>
      </Group>
    );
  }

  if (tile.connected) {
    const expired = tile.kind === "calendar";
    return (
      <Group gap={8} wrap="nowrap" className={classes.status}>
        {expired ? <TriangleAlert size={14} className={classes.warn} /> : <CirclePause size={14} className={classes.paused} />}
        <Text size="xs" c="dimmed" truncate>
          {expired ? "Access expired" : "Saved, but switched off"}
        </Text>
        <Anchor
          component="button"
          type="button"
          size="xs"
          underline="always"
          disabled={busy}
          onClick={() => onOpen(tile)}
          className={classes.link}
        >
          {expired ? "Reconnect" : "Turn on"}
        </Anchor>
      </Group>
    );
  }

  return (
    <>
      <Text size="xs" c="dimmed" mb={10}>
        {CONNECT_HINT[tile.category]}
      </Text>
      <Button
        type="button"
        size="sm"
        variant="default"
        loading={busy}
        leftSection={<Link2 size={15} />}
        onClick={() => onOpen(tile)}
      >
        {tile.kind === "webhook" ? "Turn on webhooks" : `Connect ${tile.name}`}
      </Button>
    </>
  );
}

export function IntegrationTileCard(props: Props) {
  const { tile } = props;
  return (
    <ConnectionCard
      mark={<BrandMark id={tile.id} size={26} />}
      brand={tile.id}
      name={tile.name}
      hint={tile.description}
      badge={<ModeBadge tile={tile} />}
    >
      <TileStatus {...props} />
    </ConnectionCard>
  );
}
