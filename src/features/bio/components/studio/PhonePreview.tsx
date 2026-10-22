import { useFitScale } from "@/hooks/useFitScale";
import { DeviceFrame, frameSize } from "@/features/social/components/DeviceFrame";
import { publicBioDisplay } from "@/features/bio/lib/bioOptions";
import type { BioPageInput } from "@/features/bio/types";
import { BioView } from "../BioView";
import classes from "./BioStudio.module.css";

const PHONE = frameSize("iphone");

export function PhonePreview({
  draft,
  note = true,
  compact = false,
}: {
  draft: BioPageInput;
  note?: boolean;
  compact?: boolean;
}) {
  const { ref, scale, measured } = useFitScale({
    contentWidth: PHONE.width,
    contentHeight: PHONE.height,
    padding: { x: 0, y: 0 },
  });

  return (
    <div className={classes.previewWrap}>
      <div ref={ref} className={classes.stage} data-compact={compact || undefined}>
        <DeviceFrame device="iphone" scale={scale} hidden={!measured}>
          <BioView
            variant="preview"
            title={draft.title}
            bio={draft.bio}
            avatarUrl={draft.avatarUrl}
            links={draft.links.filter((link) => link.enabled && link.label.trim())}
            socials={draft.socials.filter((social) => social.url.trim())}
            theme={draft.theme}
          />
        </DeviceFrame>
      </div>
      {note && <p className={classes.previewNote}>{publicBioDisplay(draft.slug || "your-page")}</p>}
    </div>
  );
}
