import { ActionIcon, Box, Button, CopyButton, TextInput, Tooltip } from "@mantine/core";
import { Check, Copy, Trash2 } from "lucide-react";
import type { MediaAsset } from "@/shared/types";
import { dateTime } from "@/shared/lib/format";
import { formatBytes } from "../lib";
import classes from "./MediaPreviewModal.module.css";

interface Props {
  asset: MediaAsset;
  renaming: string;
  onRenamingChange: (v: string) => void;
  onSaveName: () => void;
  onDelete: (asset: MediaAsset) => void;
  renamingBusy: boolean;
  canEdit: boolean;
}

export function PreviewDetailsPanel({
  asset,
  renaming,
  onRenamingChange,
  onSaveName,
  onDelete,
  renamingBusy,
  canEdit,
}: Props) {
  const facts: [string, string][] = [
    ["Type", asset.kind === "raw" ? "File" : asset.kind[0].toUpperCase() + asset.kind.slice(1)],
    ["Format", (asset.format || asset.mime || "—").toUpperCase()],
    ["Size", formatBytes(asset.bytes)],
    ...(asset.width && asset.height ? [["Dimensions", `${asset.width} × ${asset.height}`] as [string, string]] : []),
    ...(asset.createdAt ? [["Uploaded", dateTime(asset.createdAt)] as [string, string]] : []),
  ];
  const nameChanged = renaming.trim() !== asset.name && renaming.trim().length > 0;

  return (
    <Box component="aside" className={classes.panel} aria-label="File details">
      <Box className={classes.panelSection}>
        <span className={classes.sectionTitle}>Details</span>
        <dl className={classes.facts}>
          {facts.map(([label, value]) => (
            <Box key={label} display="contents">
              <dt className={classes.factLabel}>{label}</dt>
              <dd className={classes.factValue} title={value}>
                {value}
              </dd>
            </Box>
          ))}
        </dl>
      </Box>

      <Box className={classes.panelSection}>
        <span className={classes.sectionTitle}>Name</span>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (nameChanged) onSaveName();
          }}
        >
          <TextInput
            value={renaming}
            onChange={(e) => onRenamingChange(e.currentTarget.value)}
            disabled={!canEdit}
            aria-label="File name"
          />
          {canEdit && nameChanged && (
            <Button type="submit" size="xs" mt="xs" fullWidth loading={renamingBusy}>
              Save name
            </Button>
          )}
        </form>
      </Box>

      <Box className={classes.panelSection}>
        <span className={classes.sectionTitle}>Link</span>
        <Box className={classes.linkRow}>
          <span className={classes.linkValue} title={asset.url}>
            {asset.url}
          </span>
          <CopyButton value={asset.url} timeout={1600}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? "Copied" : "Copy link"} withArrow>
                <ActionIcon
                  variant="subtle"
                  color={copied ? "teal" : "gray"}
                  onClick={copy}
                  aria-label="Copy link"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Box>
      </Box>

      {canEdit && (
        <Box className={`${classes.panelSection} ${classes.danger}`}>
          <Button
            variant="light"
            color="red"
            leftSection={<Trash2 size={15} />}
            onClick={() => onDelete(asset)}
            fullWidth
          >
            Delete file
          </Button>
        </Box>
      )}
    </Box>
  );
}
