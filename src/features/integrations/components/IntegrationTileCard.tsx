import { Badge, Text } from "@mantine/core";
import { ConnectionCard, type ConnectionCardStatus } from "@/features/auth/components/settings/ConnectionCard";
import { timeAgo } from "@/shared/lib/format";
import { BrandMark, CARD_MARK_SIZE } from "./logos/BrandMarks";
import { appGuideUrl } from "../lib/links";
import { useJustConnected } from "../hooks/useJustConnected";
import { ConnectionFooter, type FooterTone } from "./ConnectionFooter";
import type { IntegrationTile } from "../types";
import classes from "./IntegrationTileCard.module.css";

interface Props {
  tile: IntegrationTile;
  busy?: boolean;
  lockedReason?: string;
  onOpen: (tile: IntegrationTile) => void;
}

interface Footer {
  tone: FooterTone;
  label: string;
  action: string;
  variant: "default" | "light" | "filled";
  color?: string;
}

function enabledLabel(tile: IntegrationTile): string {
  if (tile.kind === "webhook") return "On for every form";
  const base = tile.account ?? "Connected";
  return tile.lastUsedAt ? `${base} · used ${timeAgo(tile.lastUsedAt)}` : base;
}

function footerFor(tile: IntegrationTile): Footer {
  const webhook = tile.kind === "webhook";
  if (tile.kind === "quantalog-app" && !tile.enabled && tile.price) {
    return { tone: "idle", label: `${tile.price} · one-time`, action: "Unlock", variant: "filled", color: "emerald" };
  }
  if (tile.kind === "quantalog-app") {
    return tile.enabled
      ? { tone: "ok", label: tile.account ?? "On", action: "Open", variant: "default" }
      : { tone: "idle", label: "Off", action: "Turn on", variant: "light" };
  }
  if (tile.category === "email" && tile.enabled) {
    return { tone: "ok", label: "Sending your form emails", action: "Manage", variant: "default" };
  }
  if (tile.category === "email" && tile.connected) {
    return { tone: "idle", label: "Saved, not sending", action: "Manage", variant: "light" };
  }
  if (tile.enabled) {
    return { tone: "ok", label: enabledLabel(tile), action: webhook ? "Turn off" : "Manage", variant: "default" };
  }
  if (tile.connected) {
    const expired = tile.kind === "calendar" || tile.kind === "sheets" || tile.kind === "search-console";
    return expired
      ? { tone: "warn", label: "Access expired", action: "Reconnect", variant: "light", color: "orange" }
      : { tone: "paused", label: "Saved, switched off", action: "Turn on", variant: "light" };
  }
  return { tone: "idle", label: "Not connected", action: webhook ? "Turn on" : "Connect", variant: "light" };
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

function statusOf(tile: IntegrationTile): ConnectionCardStatus {
  if (tile.enabled) return "connected";
  if (tile.connected && tile.category !== "email") return "attention";
  return "idle";
}

function TileFooter({ tile, busy, lockedReason, onOpen, celebrate }: Props & { celebrate: boolean }) {
  if (tile.soon) return null;
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
    <ConnectionFooter
      {...footer}
      busy={busy}
      celebrate={celebrate}
      ariaLabel={`${footer.action} ${tile.name}`}
      onAction={() => onOpen(tile)}
    />
  );
}

export function IntegrationTileCard(props: Props) {
  const { tile, lockedReason } = props;
  const status = lockedReason ? "idle" : statusOf(tile);
  const celebrate = useJustConnected(status === "connected");
  return (
    <ConnectionCard
      mark={<BrandMark id={tile.id} size={CARD_MARK_SIZE} />}
      brand={tile.id}
      name={tile.name}
      hint={tile.description}
      badge={<ModeBadge tile={tile} />}
      soon={tile.soon}
      docsUrl={tile.soon ? undefined : appGuideUrl(tile.id)}
      status={status}
      celebrate={celebrate}
    >
      <TileFooter {...props} celebrate={celebrate} />
    </ConnectionCard>
  );
}
