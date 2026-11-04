import { useState } from "react";
import { Box, Button } from "@mantine/core";
import { ImageIcon } from "lucide-react";
import { MediaPickerModal } from "@/features/media/components/MediaPickerModal";
import type { BrandingForm } from "../hooks/useBrandingForm";
import classes from "./Branding.module.css";

export function LogoField({ form }: { form: BrandingForm }) {
  const { logoUrl, setLogoUrl, logoBroken, setLogoBroken, locked } = form;
  const [picking, setPicking] = useState(false);
  const showImage = Boolean(logoUrl) && !logoBroken;

  return (
    <div className={classes.logoRow}>
      <Box className={classes.logoThumb}>
        {showImage ? (
          <img
            src={logoUrl}
            alt=""
            className={classes.logoImg}
            onError={() => setLogoBroken(true)}
          />
        ) : (
          <ImageIcon size={28} strokeWidth={1.6} />
        )}
      </Box>

      <div className={classes.logoText}>
        <div className={classes.rowLabel}>Logo</div>
        <div className={classes.rowHint}>
          {logoBroken
            ? "That image couldn't be loaded. Pick another one."
            : "A square image works best. It sits next to your name on forms and payments."}
        </div>
      </div>

      <div className={classes.logoActions}>
        <Button variant="default" radius="xl" onClick={() => setPicking(true)} disabled={locked}>
          {logoUrl ? "Change" : "Upload logo"}
        </Button>
        {logoUrl && (
          <Button variant="subtle" color="red" radius="xl" onClick={() => setLogoUrl("")} disabled={locked}>
            Remove
          </Button>
        )}
      </div>

      <MediaPickerModal
        opened={picking}
        onClose={() => setPicking(false)}
        onPick={(asset) => setLogoUrl(asset.url)}
        kind="image"
        title="Choose a logo"
      />
    </div>
  );
}
