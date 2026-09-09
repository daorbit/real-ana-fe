import type { ReactNode } from "react";
import { Box, Checkbox, Text, Group } from "@mantine/core";
import { Check, File, FileText, Film, Music } from "lucide-react";
import type { MediaAsset } from "@/shared/types";
import { formatBytes, previewUrl } from "../lib";
import classes from "./MediaGrid.module.css";

interface Props {
  items: MediaAsset[];
  /** The one currently chosen, in a single-pick picker. */
  selectedId?: string | null;
  onSelect?: (asset: MediaAsset) => void;
  renderActions?: (asset: MediaAsset) => ReactNode;
  /** Widest column count. Fewer columns = bigger tiles (the picker wants this). */
  maxColumns?: 3 | 4;
  /** Ids ticked for a bulk action. When passed, a tile click toggles the tick. */
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

/**
 * The library as a wall of tiles.
 *
 * Shared by the library page and the picker so the two cannot drift — what
 * someone browses and what they choose from should look the same.
 */
export function MediaGrid({
  items,
  selectedId,
  onSelect,
  renderActions,
  maxColumns = 4,
  selectedIds,
  onToggleSelect,
}: Props) {
  const multiSelect = Boolean(selectedIds);

  return (
    <Box className={`${classes.masonry} ${maxColumns === 3 ? classes.threeUp : ""}`}>
      {items.map((asset) => {
        const ticked = selectedIds?.has(asset.id) ?? false;
        const activate = multiSelect
          ? () => onToggleSelect?.(asset.id)
          : onSelect
            ? () => onSelect(asset)
            : undefined;

        return (
          <Box
            key={asset.id}
            className={`${classes.tile} ${
              (multiSelect ? ticked : selectedId === asset.id) ? classes.selected : ""
            }`}
            onClick={activate}
            role={activate ? "button" : undefined}
            tabIndex={activate ? 0 : undefined}
            onKeyDown={(e) => {
              if (activate && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                activate();
              }
            }}
          >
            <Preview asset={asset} />

            {multiSelect && (
              <Box className={classes.pick} onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  size="xs"
                  checked={ticked}
                  onChange={() => onToggleSelect?.(asset.id)}
                  aria-label={`Select ${asset.name}`}
                />
              </Box>
            )}

            {!multiSelect && selectedId === asset.id && (
              <Box className={classes.check}>
                <Check size={14} strokeWidth={3} />
              </Box>
            )}

            {!multiSelect && renderActions && (
              <Box className={classes.actions} onClick={(e) => e.stopPropagation()}>
                <Group gap={4} justify="flex-end">
                  {renderActions(asset)}
                </Group>
              </Box>
            )}

            <Box className={classes.meta}>
              <Text size="xs" fw={500} lineClamp={1} title={asset.name}>
                {asset.name}
              </Text>
              <Text size="10px" c="dimmed">
                {asset.width && asset.height
                  ? `${asset.width}×${asset.height} · ${formatBytes(asset.bytes)}`
                  : formatBytes(asset.bytes)}
              </Text>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

/** The tile's picture, or an icon for a file that has none. */
function Preview({ asset }: { asset: MediaAsset }) {
  const url = previewUrl(asset);

  if (url) {
    return (
      <img
        className={classes.image}
        src={url}
        alt={asset.alt || asset.name}
        loading="lazy"
      />
    );
  }

  return (
    <Box className={classes.fileTile}>
      <FileIcon mime={asset.mime} />
      <Text size="10px" c="dimmed">
        {asset.format?.toUpperCase() || "FILE"}
      </Text>
    </Box>
  );
}

function FileIcon({ mime }: { mime: string }) {
  if (mime === "application/pdf") return <FileText size={22} />;
  if (mime.startsWith("video/")) return <Film size={22} />;
  if (mime.startsWith("audio/")) return <Music size={22} />;
  return <File size={22} />;
}
