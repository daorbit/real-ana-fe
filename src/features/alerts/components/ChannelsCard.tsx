import { Anchor, Badge, Switch } from "@mantine/core";
import { Link } from "react-router-dom";
import { CHANNEL_META, CHANNEL_ORDER } from "@/features/alerts/lib/alertMeta";
import type { AlertChannel, AlertChannelStatus } from "@/features/alerts/types";
import { appsPath } from "@/features/integrations/lib/appsPath";
import classes from "@/features/alerts/components/Alerts.module.css";

type ChannelState = { text: string; badge: { label: string; color: string }; setup?: boolean };

function channelState(channel: AlertChannel, status: AlertChannelStatus): ChannelState {
  if (channel === "email") {
    return status.email.available
      ? { text: "To every editor and admin.", badge: { label: "Ready", color: "teal" } }
      : { text: "Email is not set up on this server.", badge: { label: "Unavailable", color: "gray" } };
  }
  if (channel === "telegram") {
    return status.telegram.available
      ? {
          text: `To ${status.telegram.chats} linked ${status.telegram.chats === 1 ? "chat" : "chats"}.`,
          badge: { label: "Ready", color: "teal" },
        }
      : { text: "Link a chat to receive alerts.", badge: { label: "Set up", color: "orange" }, setup: true };
  }
  if (!status.whatsapp.entitled) return { text: "Included with the Pro plan.", badge: { label: "Pro", color: "violet" } };
  return status.whatsapp.available
    ? {
        text: `To ${status.whatsapp.numbers} verified ${status.whatsapp.numbers === 1 ? "number" : "numbers"}.`,
        badge: { label: "Ready", color: "teal" },
      }
    : { text: "Verify a number to receive alerts.", badge: { label: "Set up", color: "orange" }, setup: true };
}

export function ChannelsCard({
  channels,
  status,
  canEdit,
  onChange,
}: {
  channels: Record<AlertChannel, boolean>;
  status: AlertChannelStatus;
  canEdit: boolean;
  onChange: (channel: AlertChannel, on: boolean) => void;
}) {
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div>
          <h3 className={classes.cardTitle}>Where alerts go</h3>
          <div className={classes.cardSub}>The bell in Quantalog always gets them too.</div>
        </div>
      </div>
      {CHANNEL_ORDER.map((channel) => {
        const meta = CHANNEL_META[channel];
        const Icon = meta.icon;
        const state = channelState(channel, status);
        return (
          <div key={channel} className={classes.row} data-off={!channels[channel] || undefined}>
            <span className={classes.icon}>
              <Icon size={17} />
            </span>
            <div className={classes.text}>
              <div className={classes.title}>{meta.label}</div>
              <div className={classes.description}>
                {state.text}{" "}
                {state.setup && meta.setupApp && (
                  <Anchor component={Link} to={appsPath(meta.setupApp)} size="xs">
                    Set up
                  </Anchor>
                )}
              </div>
            </div>
            <div className={classes.channelState}>
              <Badge size="xs" variant="light" color={state.badge.color}>
                {state.badge.label}
              </Badge>
              <Switch
                checked={channels[channel]}
                disabled={!canEdit}
                aria-label={`Send alerts by ${meta.label}`}
                onChange={(e) => onChange(channel, e.currentTarget.checked)}
              />
            </div>
          </div>
        );
      })}
    </section>
  );
}
