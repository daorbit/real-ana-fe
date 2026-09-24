import { useState } from "react";
import { Box, Button, Text } from "@mantine/core";
import { ImageIcon, Images, Trash2 } from "lucide-react";
import { MediaPickerModal } from "@/features/media/components/MediaPickerModal";
import type { BrandingForm } from "../hooks/useBrandingForm";
import classes from "./Branding.module.css";

export function LogoField({ form }: { form: BrandingForm }) {
  const { logoUrl, setLogoUrl, logoBroken, setLogoBroken, locked } = form;
  const [picking, setPicking] = useState(false);
  const showImage = Boolean(logoUrl) && !logoBroken;

  return (
    <>
      <Box className={classes.logoRow}>
        <Box className={classes.logoThumb} data-filled={showImage || undefined}>
          {showImage ? (
            <img
              src={logoUrl}
              alt="Logo"
              className={classes.logoImg}
              onError={() => setLogoBroken(true)}
            />
          ) : (
            <ImageIcon size={18} />
          )}
        </Box>
        <Box className={classes.logoActions}>
          <Button
            size="xs"
            variant="default"
            leftSection={<Images size={14} />}
            onClick={() => setPicking(true)}
            disabled={locked}
          >
            {logoUrl ? "Change" : "Choose logo"}
          </Button>
          {logoUrl && (
            <Button
              size="xs"
              variant="subtle"
              color="red"
              leftSection={<Trash2 size={14} />}
              onClick={() => setLogoUrl("")}
              disabled={locked}
            >
              Remove
            </Button>
          )}
        </Box>
      </Box>
      {logoBroken && (
        <Text size="xs" c="red" mt={6}>
          That image couldn't be loaded. Pick another one.
        </Text>
      )}

      <MediaPickerModal
        opened={picking}
        onClose={() => setPicking(false)}
        onPick={(asset) => setLogoUrl(asset.url)}
        kind="image"
        title="Choose a logo"
      />
    </>
  );
}
