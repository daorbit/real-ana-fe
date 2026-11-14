import { useState } from "react";
import { QrCode, SlidersHorizontal } from "lucide-react";
import { copyText } from "@/features/bio/lib/copyText";
import { SHARE_CHANNELS, channelUrl, type ShareChannel } from "@/features/bio/lib/utm";
import { QrDialog } from "../QrDialog";
import { SocialLogo } from "../SocialLogo";
import { UtmBuilder } from "./UtmBuilder";
import { PopoverPanel } from "./ui/PopoverPanel";
import classes from "./Share.module.css";

export function ShareLinks({ url, slug, title }: { url: string; slug: string; title: string }) {
  const [qrOpen, setQrOpen] = useState(false);
  const [custom, setCustom] = useState(false);

  const share = (channel: ShareChannel) => {
    if (channel.id === "qr") {
      setQrOpen(true);
      return;
    }
    void copyText(channelUrl(url, channel, slug), `${channel.label} link copied, with tracking.`);
  };

  return (
    <div className={classes.channels}>
      <span className={classes.channelsLabel}>Copy a tracked link for</span>
      <div className={classes.chips}>
        {SHARE_CHANNELS.map((channel) => (
          <button key={channel.id} type="button" className={classes.chip} title={`Copy link for ${channel.label}`} onClick={() => share(channel)}>
            {channel.logo === "qr" ? (
              <span className={classes.qrGlyph}>
                <QrCode size={13} />
              </span>
            ) : (
              <SocialLogo network={channel.logo} size="sm" />
            )}
            {channel.label}
          </button>
        ))}
        <PopoverPanel
          opened={custom}
          onChange={setCustom}
          width={340}
          position="bottom-end"
          target={
            <button type="button" className={classes.chip} data-custom onClick={() => setCustom((o) => !o)}>
              <SlidersHorizontal size={13} />
              Custom UTM
            </button>
          }
        >
          <UtmBuilder url={url} campaign={slug} />
        </PopoverPanel>
      </div>
      <QrDialog page={qrOpen ? { slug, title } : null} onClose={() => setQrOpen(false)} />
    </div>
  );
}
