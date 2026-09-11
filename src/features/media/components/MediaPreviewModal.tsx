import { Modal, Box, Stack, Text, Group, Badge, TextInput, Button, Menu, ActionIcon, Center } from "@mantine/core";
import { Pencil, MoreVertical, Copy, ExternalLink, Trash2, X } from "lucide-react";
import type { MediaAsset } from "@/shared/types";
import { notify } from "@/shared/lib/notify";
import { FileTypeIcon } from "./FileTypeIcon";
import { TextPreview } from "./TextPreview";
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
 * A file, full-screen: the stage takes the right side, everything you can do
 * with the file sits in a column on the left — the same split the form
 * builder's own preview uses.
 *
 * Fixed rather than Mantine's `fullScreen`, and inset by the app shell's own
 * navbar offset: the rail is how someone gets back out of this screen, so it
 * has to stay reachable rather than being buried under the overlay.
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
  return (
    <Modal
      opened={Boolean(asset)}
      onClose={onClose}
      fullScreen
      withCloseButton={false}
      padding={0}
      transitionProps={{ transition: "fade", duration: 150 }}
      classNames={{ content: classes.content, inner: classes.inner }}
    >
      {asset && (
        <Box className={classes.body}>
          <Stack className={classes.info} gap="md">
            <Group justify="space-between" wrap="nowrap">
              <Text fw={600} lineClamp={2} title={asset.name}>
                {asset.name}
              </Text>
              <ActionIcon variant="subtle" color="gray" onClick={onClose} aria-label="Close">
                <X size={18} />
              </ActionIcon>
            </Group>

            <Group gap="xs">
              <Badge variant="light" size="sm">
                {asset.kind}
              </Badge>
              <Badge variant="light" color="gray" size="sm">
                {formatBytes(asset.bytes)}
              </Badge>
              {asset.width && asset.height && (
                <Badge variant="light" color="gray" size="sm">
                  {asset.width}×{asset.height}
                </Badge>
              )}
            </Group>

            <TextInput
              label="Name"
              value={renaming}
              onChange={(e) => onRenamingChange(e.currentTarget.value)}
              disabled={!canEdit}
            />

            <Group gap="xs">
              <Button
                variant="light"
                leftSection={<Pencil size={14} />}
                onClick={onSaveName}
                loading={renamingBusy}
                disabled={!canEdit || renaming.trim() === asset.name}
              >
                Rename
              </Button>
              <Menu position="bottom-start">
                <Menu.Target>
                  <ActionIcon variant="default" size="lg">
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

          <Box className={classes.stage}>
            <PreviewSurface asset={asset} />
          </Box>
        </Box>
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
      <Stack align="center" gap="xs">
        <FileTypeIcon fileName={asset.name} size={64} />
        <Text size="sm" c="dimmed">
          Preview isn't available for this file type — open or download it instead.
        </Text>
      </Stack>
    </Center>
  );
}
