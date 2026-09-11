import { ActionIcon, Box, Button, Group, Menu, Stack, Text, TextInput } from "@mantine/core";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import type { MediaAsset } from "@/shared/types";
import { notify } from "@/shared/lib/notify";
import { formatBytes } from "../lib";
import classes from "./MediaPreviewModal.module.css";

interface Props {
  asset: MediaAsset;
  open: boolean;
  onToggle: () => void;
  renaming: string;
  onRenamingChange: (v: string) => void;
  onSaveName: () => void;
  onDelete: (asset: MediaAsset) => void;
  renamingBusy: boolean;
  canEdit: boolean;
}

/** A labelled fact about the file. */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between" gap="xs" wrap="nowrap">
      <Text size="xs" className={classes.panelDimmed}>
        {label}
      </Text>
      <Text size="xs" className={classes.panelValue} truncate title={value}>
        {value}
      </Text>
    </Group>
  );
}

/**
 * The file's details and everything you can do with it, in a column beside the
 * stage — rename and delete included, so the preview is where a file is managed
 * rather than only looked at. Collapses away when the picture is what matters.
 */
export function PreviewDetailsPanel({
  asset,
  open,
  onToggle,
  renaming,
  onRenamingChange,
  onSaveName,
  onDelete,
  renamingBusy,
  canEdit,
}: Props) {
  return (
    <>
      {open && (
        <Box className={classes.panel}>
          <Box className={classes.panelHeader}>
            <Text size="xs" fw={600} tt="uppercase" className={classes.panelHeading}>
              Details
            </Text>
          </Box>

          <Box className={classes.panelScroll}>
            <Stack gap="md">
              <Stack gap={6}>
                <Row label="Type" value={asset.kind} />
                <Row label="Size" value={formatBytes(asset.bytes)} />
                {asset.width && asset.height && (
                  <Row label="Dimensions" value={`${asset.width}×${asset.height}`} />
                )}
                {asset.format && <Row label="Format" value={asset.format} />}
              </Stack>

              <TextInput
                label="Name"
                size="xs"
                value={renaming}
                onChange={(e) => onRenamingChange(e.currentTarget.value)}
                disabled={!canEdit}
              />

              <Group gap="xs">
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<Pencil size={14} />}
                  onClick={onSaveName}
                  loading={renamingBusy}
                  disabled={!canEdit || renaming.trim() === asset.name}
                >
                  Rename
                </Button>
                <Menu position="bottom-start" withinPortal>
                  <Menu.Target>
                    <ActionIcon variant="default" size="md" aria-label="More actions">
                      <MoreVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<Copy size={14} />}
                      onClick={() => {
                        void navigator.clipboard.writeText(asset.url);
                        notify.success("URL copied");
                      }}
                    >
                      Copy URL
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<ExternalLink size={14} />}
                      component="a"
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open original
                    </Menu.Item>
                    {canEdit && (
                      <>
                        <Menu.Divider />
                        <Menu.Item
                          color="red"
                          leftSection={<Trash2 size={14} />}
                          onClick={() => onDelete(asset)}
                        >
                          Delete
                        </Menu.Item>
                      </>
                    )}
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Stack>
          </Box>
        </Box>
      )}

      <button
        type="button"
        className={classes.panelToggle}
        data-open={open}
        onClick={onToggle}
        aria-label={open ? "Hide details" : "Show details"}
      >
        {open ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </>
  );
}
