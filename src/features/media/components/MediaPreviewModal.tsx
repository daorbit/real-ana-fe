import { useEffect, useState } from "react";
import { Box, Center, Modal, Stack, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type { MediaAsset } from "@/shared/types";
import { useFitScale } from "@/hooks/useFitScale";
import { FileTypeIcon } from "./FileTypeIcon";
import { TextPreview } from "./TextPreview";
import { DeviceFrame, frameSize } from "./DeviceFrame";
import { PreviewTopbar } from "./PreviewTopbar";
import { PreviewDetailsPanel } from "./PreviewDetailsPanel";
import {
  formatBytes,
  previewUrl,
  isPdf,
  isOfficeDoc,
  officePreviewUrl,
  isTextLike,
} from "../lib";
import classes from "./MediaPreviewModal.module.css";

interface Props {
  asset: MediaAsset | null;
  renaming: string;
  onRenamingChange: (v: string) => void;
  onClose: () => void;
  onSaveName: () => void;
  onDelete: (asset: MediaAsset) => void;
  renamingBusy: boolean;
  canEdit: boolean;
}

/**
 * A file on a stage, the way the form builder previews a form: chrome across
 * the top, the file inside a MacBook mock on a workbench, and its details and
 * actions in a column on the left.
 *
 * The mock renders at the device's true CSS viewport and is then scaled to fit,
 * so the file is judged at a real desktop width rather than being squashed into
 * whatever width the modal happens to have.
 *
 * Inset by the shell's navbar rather than covering it: the rail is how someone
 * gets back out, so it stays reachable.
 */
export function MediaPreviewModal({
  asset,
  renaming,
  onRenamingChange,
  onClose,
  onSaveName,
  onDelete,
  renamingBusy,
  canEdit,
}: Props) {
  const [panelOpen, setPanelOpen] = useState(true);
  // The shell's panel — the bordered card the page sits in. Rendering into it
  // keeps the preview inside the app rather than over it, so the rail stays
  // reachable. Null before the shell has mounted, and on any screen that has no
  // panel, where the modal falls back to Mantine's own body portal.
  const [panelRoot, setPanelRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPanelRoot(document.getElementById("panel-overlay-root"));
  }, []);
  // The collapse toggle has nowhere to sit on a phone, where the panel stacks
  // above the stage — so it stays open there rather than becoming unreachable.
  const mobile = useMediaQuery("(max-width: 48em)") ?? false;

  const size = frameSize();
  // Matches `.stage`'s 24px padding on each side. Reserving more than the stage
  // actually pads would shrink the frame for no reason.
  const { ref: stageRef, scale, measured } = useFitScale({
    contentWidth: size.width,
    contentHeight: size.height,
    padding: { x: 48, y: 48 },
  });

  const meta = asset
    ? [
        asset.kind,
        formatBytes(asset.bytes),
        ...(asset.width && asset.height ? [`${asset.width}×${asset.height}`] : []),
      ]
    : [];

  return (
    <Modal
      opened={Boolean(asset)}
      onClose={onClose}
      withCloseButton={false}
      padding={0}
      // Absolute rather than fixed: the overlay and the modal position against
      // the panel they are rendered into, not the viewport.
      portalProps={panelRoot ? { target: panelRoot } : undefined}
      withinPortal={Boolean(panelRoot)}
      transitionProps={{ transition: "fade", duration: 150 }}
      overlayProps={{ backgroundOpacity: 0.35, blur: 2 }}
      classNames={{
        root: classes.root,
        overlay: classes.overlay,
        content: classes.content,
        inner: classes.inner,
      }}
      styles={{
        // Mantine's own body wrapper sits between the content box and the
        // stage; without a bounded height here the stage measures taller than
        // the panel and the frame is scaled to overflow it.
        body: {
          flex: 1,
          minHeight: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      {asset && (
        <>
          <PreviewTopbar title={asset.name} meta={meta} onClose={onClose} />

          <Box className={classes.body}>
            <PreviewDetailsPanel
              asset={asset}
              open={panelOpen || mobile}
              onToggle={() => setPanelOpen((v) => !v)}
              renaming={renaming}
              onRenamingChange={onRenamingChange}
              onSaveName={onSaveName}
              onDelete={onDelete}
              renamingBusy={renamingBusy}
              canEdit={canEdit}
            />

            {/* Laid out from the first render so the stage has something to
                size against, and unpainted until that fit is measured. */}
            <Box className={classes.stage} ref={stageRef}>
              <DeviceFrame scale={scale} hidden={!measured}>
                <Box className={classes.screen}>
                  <PreviewSurface asset={asset} />
                </Box>
              </DeviceFrame>
            </Box>
          </Box>
        </>
      )}
    </Modal>
  );
}

function PreviewSurface({ asset }: { asset: MediaAsset }) {
  if (asset.kind === "video") {
    return <video src={asset.url} controls className={classes.media} />;
  }

  const url = previewUrl(asset);
  if (url) {
    return <img src={url} alt={asset.alt || asset.name} className={classes.media} />;
  }

  if (isPdf(asset)) {
    return <iframe src={asset.url} title={asset.name} className={classes.frame} />;
  }

  if (isOfficeDoc(asset)) {
    return <iframe src={officePreviewUrl(asset.url)} title={asset.name} className={classes.frame} />;
  }

  if (isTextLike(asset)) {
    return <TextPreview url={asset.url} />;
  }

  return (
    <Center h="100%">
      <Stack align="center" gap="xs" p="md">
        <FileTypeIcon fileName={asset.name} size={64} />
        <Text size="sm" c="dimmed" ta="center">
          Preview isn't available for this file type — open or download it instead.
        </Text>
      </Stack>
    </Center>
  );
}
