import { useEffect, useState } from "react";
import { ActionIcon, Box, Modal } from "@mantine/core";
import { useHotkeys, useMediaQuery } from "@mantine/hooks";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MediaAsset } from "@/shared/types";
import { notify } from "@/shared/lib/notify";
import { PreviewTopbar } from "./PreviewTopbar";
import { PreviewDetailsPanel } from "./PreviewDetailsPanel";
import { PreviewSurface } from "./PreviewSurface";
import { downloadAsset, formatBytes } from "../lib";
import classes from "./MediaPreviewModal.module.css";

interface Props {
  asset: MediaAsset | null;
  items?: MediaAsset[];
  onNavigate?: (asset: MediaAsset) => void;
  renaming: string;
  onRenamingChange: (v: string) => void;
  onClose: () => void;
  onSaveName: () => void;
  onDelete: (asset: MediaAsset) => void;
  renamingBusy: boolean;
  canEdit: boolean;
}

export function MediaPreviewModal({
  asset,
  items = [],
  onNavigate,
  renaming,
  onRenamingChange,
  onClose,
  onSaveName,
  onDelete,
  renamingBusy,
  canEdit,
}: Props) {
  const compact = useMediaQuery("(max-width: 62em)") ?? false;
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [panelRoot, setPanelRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPanelRoot(document.getElementById("panel-overlay-root"));
  }, []);

  useEffect(() => {
    if (asset) setDetailsOpen(!compact);
  }, [Boolean(asset), compact]);

  const index = asset ? items.findIndex((i) => i.id === asset.id) : -1;
  const hasList = index >= 0 && items.length > 1 && Boolean(onNavigate);
  const prev = hasList && index > 0 ? items[index - 1] : null;
  const next = hasList && index < items.length - 1 ? items[index + 1] : null;

  useHotkeys(
    asset
      ? [
          ["ArrowLeft", () => prev && onNavigate?.(prev)],
          ["ArrowRight", () => next && onNavigate?.(next)],
        ]
      : [],
  );

  const meta = asset
    ? [
        (asset.format || asset.kind).toUpperCase(),
        formatBytes(asset.bytes),
        ...(asset.width && asset.height ? [`${asset.width} × ${asset.height}`] : []),
      ].join(" · ")
    : "";

  const copyLink = () => {
    if (!asset) return;
    void navigator.clipboard.writeText(asset.url);
    notify.success("Link copied");
  };

  return (
    <Modal
      opened={Boolean(asset)}
      onClose={onClose}
      withCloseButton={false}
      padding={0}
      portalProps={panelRoot ? { target: panelRoot } : undefined}
      withinPortal={Boolean(panelRoot)}
      transitionProps={{ transition: "fade", duration: 150 }}
      overlayProps={{ backgroundOpacity: 0.5, blur: 3 }}
      classNames={{
        root: classes.root,
        overlay: classes.overlay,
        content: classes.content,
        inner: classes.inner,
        body: classes.body,
      }}
    >
      {asset && (
        <>
          <PreviewTopbar
            asset={asset}
            meta={meta}
            position={hasList ? { index, total: items.length } : null}
            detailsOpen={detailsOpen}
            onToggleDetails={() => setDetailsOpen((v) => !v)}
            onCopyLink={copyLink}
            onDownload={() => void downloadAsset(asset)}
            onClose={onClose}
          />

          <Box className={classes.main}>
            <Box className={classes.stage}>
              {hasList && (
                <ActionIcon
                  className={`${classes.navButton} ${classes.navPrev}`}
                  disabled={!prev}
                  onClick={() => prev && onNavigate?.(prev)}
                  aria-label="Previous file"
                >
                  <ChevronLeft size={20} />
                </ActionIcon>
              )}

              <PreviewSurface asset={asset} />

              {hasList && (
                <ActionIcon
                  className={`${classes.navButton} ${classes.navNext}`}
                  disabled={!next}
                  onClick={() => next && onNavigate?.(next)}
                  aria-label="Next file"
                >
                  <ChevronRight size={20} />
                </ActionIcon>
              )}
            </Box>

            {detailsOpen && (
              <PreviewDetailsPanel
                asset={asset}
                renaming={renaming}
                onRenamingChange={onRenamingChange}
                onSaveName={onSaveName}
                onDelete={onDelete}
                renamingBusy={renamingBusy}
                canEdit={canEdit}
              />
            )}
          </Box>
        </>
      )}
    </Modal>
  );
}
