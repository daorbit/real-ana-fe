import { Anchor, Badge, Switch } from "@mantine/core";
import { Link } from "react-router-dom";
import { CHANNEL_META, CHANNEL_ORDER } from "@/features/alerts/lib/alertMeta";
import type { AlertChannel, AlertChannelStatus } from "@/features/alerts/types";
import { appsPath } from "@/features/integrations/lib/appsPath";
import classes from "@/features/alerts/components/Alerts.module.css";

function channelNote(channel: AlertChannel, status: AlertChannelStatus): { text: string; setup?: boolean } {
  if (channel === "email") {
    return status.email.available
      ? { text: "Sent to every editor and admin in this workspace." }
      : { text: "Email is not set up on this server." };
  }
  if (channel === "telegram") {
    return status.telegram.available
      ? { text: `To ${status.telegram.chats} linked ${status.telegram.chats === 1 ? "chat" : "chats"}.` }
      : { text: "Link a Telegram chat first.", setup: true };
  }
  if (!status.whatsapp.entitled) return { text: "Included with the Pro plan." };
  return status.whatsapp.available
    ? { text: `To ${status.whatsapp.numbers} verified ${status.whatsapp.numbers === 1 ? "number" : "numbers"}.` }
    : { text: "Turn on WhatsApp and verify a number first.", setup: true };
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
          <div className={classes.cardSub}>The bell in Quantalog always gets them.</div>
        </div>
      </div>
      {CHANNEL_ORDER.map((channel) => {
        const meta = CHANNEL_META[channel];
        const Icon = meta.icon;
        const note = channelNote(channel, status);
        return (
          <div key={channel} className={classes.row} data-off={!channels[channel] || undefined}>
            <span className={classes.icon}>
              <Icon size={17} />
            </span>
            <div className={classes.text}>
              <div className={classes.title}>
                {meta.label}{" "}
                {channel === "whatsapp" && !status.whatsapp.entitled && (
                  <Badge size="xs" variant="light" color="violet">
                    Pro
                  </Badge>
                )}
              </div>
              <div className={classes.description}>
                {note.text}{" "}
                {note.setup && meta.setupApp && (
                  <Anchor component={Link} to={appsPath(meta.setupApp)} size="xs">
                    Set up
                  </Anchor>
                )}
              </div>
            </div>
            <div className={classes.controls}>
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
