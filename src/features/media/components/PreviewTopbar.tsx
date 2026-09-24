import { ActionIcon, Box, Tooltip } from "@mantine/core";
import { Download, ExternalLink, Info, Link2, X } from "lucide-react";
import type { MediaAsset } from "@/shared/types";
import { FileTypeIcon } from "./FileTypeIcon";
import classes from "./MediaPreviewModal.module.css";

interface Props {
  asset: MediaAsset;
  meta: string;
  position: { index: number; total: number } | null;
  detailsOpen: boolean;
  onToggleDetails: () => void;
  onCopyLink: () => void;
  onDownload: () => void;
  onClose: () => void;
}

function Tool({
  label,
  onClick,
  active,
  children,
  href,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  children: React.ReactNode;
  href?: string;
}) {
  const shared = {
    variant: "subtle" as const,
    size: "lg" as const,
    className: classes.tool,
    "aria-label": label,
    "data-active": active || undefined,
  };
  return (
    <Tooltip label={label} withArrow>
      {href ? (
        <ActionIcon {...shared} component="a" href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </ActionIcon>
      ) : (
        <ActionIcon {...shared} onClick={onClick}>
          {children}
        </ActionIcon>
      )}
    </Tooltip>
  );
}

export function PreviewTopbar({
  asset,
  meta,
  position,
  detailsOpen,
  onToggleDetails,
  onCopyLink,
  onDownload,
  onClose,
}: Props) {
  return (
    <Box className={classes.topbar}>
      <span className={classes.fileIcon}>
        <FileTypeIcon fileName={asset.name} size={18} />
      </span>
      <Box className={classes.titleBlock}>
        <div className={classes.title} title={asset.name}>
          {asset.name}
        </div>
        <div className={classes.meta}>{meta}</div>
      </Box>

      <Box className={classes.toolbar}>
        {position && (
          <>
            <span className={`${classes.counter} ${classes.hideMobile}`}>
              {position.index + 1} of {position.total}
            </span>
            <span className={`${classes.divider} ${classes.hideMobile}`} />
          </>
        )}
        <Tool label="Copy link" onClick={onCopyLink}>
          <Link2 size={18} />
        </Tool>
        <Tool label="Download" onClick={onDownload}>
          <Download size={18} />
        </Tool>
        <Tool label="Open original" href={asset.url}>
          <ExternalLink size={18} />
        </Tool>
        <Tool label={detailsOpen ? "Hide details" : "Show details"} onClick={onToggleDetails} active={detailsOpen}>
          <Info size={18} />
        </Tool>
        <span className={classes.divider} />
        <Tool label="Close (Esc)" onClick={onClose}>
          <X size={19} />
        </Tool>
      </Box>
    </Box>
  );
}
