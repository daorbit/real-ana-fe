import { useMemo } from "react";
import { useFitScale } from "@/hooks/useFitScale";
import { DeviceFrame, frameSize } from "@/features/social/components/DeviceFrame";
import { toPreviewPage } from "@/features/bio/lib/bioDraft";
import { publicBioDisplay } from "@/features/bio/lib/bioOptions";
import type { BioPageInput } from "@/features/bio/types";
import { BioPageView } from "../BioPageView";
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
  const page = useMemo(() => toPreviewPage(draft), [draft]);

  return (
    <div className={classes.previewWrap}>
      <div ref={ref} className={classes.stage} data-compact={compact || undefined}>
        <DeviceFrame device="iphone" scale={scale} hidden={!measured}>
          <BioPageView page={page} variant="preview" />
        </DeviceFrame>
      </div>
      {note && <p className={classes.previewNote}>{publicBioDisplay(draft.slug || "your-link")}</p>}
    </div>
  );
}
