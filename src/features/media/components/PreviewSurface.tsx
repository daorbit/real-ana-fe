import { Box, Text } from "@mantine/core";
import type { MediaAsset } from "@/shared/types";
import { FileTypeIcon } from "./FileTypeIcon";
import { TextPreview } from "./TextPreview";
import { isOfficeDoc, isPdf, isTextLike, officePreviewUrl } from "../lib";
import classes from "./MediaPreviewModal.module.css";

export function PreviewSurface({ asset }: { asset: MediaAsset }) {
  if (asset.kind === "video") {
    return (
      <Box className={classes.canvas}>
        <video key={asset.id} src={asset.url} controls autoPlay className={classes.media} />
      </Box>
    );
  }

  if (asset.kind === "image") {
    return (
      <Box className={classes.canvas} data-checker>
        <img key={asset.id} src={asset.url} alt={asset.alt || asset.name} className={classes.media} />
      </Box>
    );
  }

  if (isPdf(asset)) {
    return (
      <Box className={classes.canvas} data-document>
        <iframe src={asset.url} title={asset.name} className={classes.frame} />
      </Box>
    );
  }

  if (isOfficeDoc(asset)) {
    return (
      <Box className={classes.canvas} data-document>
        <iframe src={officePreviewUrl(asset.url)} title={asset.name} className={classes.frame} />
      </Box>
    );
  }

  if (isTextLike(asset)) {
    return (
      <Box className={classes.canvas} data-document>
        <TextPreview url={asset.url} />
      </Box>
    );
  }

  return (
    <Box className={classes.empty}>
      <FileTypeIcon fileName={asset.name} size={64} />
      <Text size="sm" fw={600}>
        No preview for this file type
      </Text>
      <Text size="xs">Download it or open the original to view it.</Text>
    </Box>
  );
}
