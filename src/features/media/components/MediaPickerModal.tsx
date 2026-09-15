import { useEffect, useRef, useState } from "react";
import {
  Modal, TextInput, Group, Button, Stack, Text, Center,
  SegmentedControl, Pagination, Box,
} from "@mantine/core";
import { Search, ImageOff, Upload } from "lucide-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useGetMediaQuery, useUploadMediaMutation } from "@/app/store";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { notify, errMessage } from "@/shared/lib/notify";
import type { MediaAsset, MediaKind } from "@/shared/types";
import { MediaGrid } from "./MediaGrid";
import { MediaGridSkeleton } from "./MediaGridSkeleton";
import { UploadTray, type UploadItem } from "./UploadTray";
import { readAsDataUrl, MAX_ASSET_BYTES } from "../lib";

/** Enough to fill the wall without making the modal scroll far. */
const PER_PAGE = 12;

interface Props {
  opened: boolean;
  onClose: () => void;
  onPick: (asset: MediaAsset) => void;
  /** Narrows the library to what this field can actually use. */
  kind?: MediaKind;
  title?: string;
}

/**
 * The library as a chooser.
 *
 * Picking is deliberately two steps — click a tile, then confirm — rather than
 * closing on the first click. At this size a tile is easy to hit by accident,
 * and the field being filled is usually one someone has already thought about.
 *
 * Upload also lives here (button, drop zone) so a file that isn't in the
 * library yet doesn't force a trip to the Media page and back.
 */
export function MediaPickerModal({
  opened,
  onClose,
  onPick,
  kind,
  title = "Choose a file",
}: Props) {
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const workspaceId = active?._id ?? "";
  const fileInput = useRef<HTMLInputElement>(null);
  const [upload] = useUploadMediaMutation();
  const [tray, setTray] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);

  const [q, setQ] = useState("");
  // The library would be queried per keystroke otherwise, and a search that
  // fires on every letter is a request per letter.
  const [debouncedQ] = useDebouncedValue(q, 250);
  const [filter, setFilter] = useState<MediaKind | "all">(kind ?? "image");
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [page, setPage] = useState(1);

  // Each opening starts clean rather than resuming the last search.
  useEffect(() => {
    if (!opened) return;
    setSelected(null);
    setQ("");
    setFilter(kind ?? "image");
    setPage(1);
    setTray([]);
    setDragging(false);
  }, [opened, kind]);

  // A narrowed result set may be shorter than the page being viewed.
  useEffect(() => {
    setPage(1);
  }, [filter, debouncedQ]);

  const { data, isFetching } = useGetMediaQuery(
    {
      workspaceId,
      q: debouncedQ || undefined,
      kind: filter === "all" ? undefined : filter,
      page,
      perPage: PER_PAGE,
    },
    { skip: !workspaceId || !opened },
  );

  const items = data?.items ?? [];
  const pages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;

  async function onFiles(list: FileList | null) {
    if (!list?.length || !canEdit || !workspaceId) return;

    const files = Array.from(list);
    const queued: UploadItem[] = files.map((file) =>
      file.size > MAX_ASSET_BYTES
        ? { file, state: "error", error: "Larger than 25MB" }
        : { file, state: "queued" },
    );
    setTray(queued);

    const ok = files.filter((f) => f.size <= MAX_ASSET_BYTES);
    if (!ok.length) {
      window.setTimeout(() => setTray([]), 6000);
      return;
    }

    setTray((rows) =>
      rows.map((r) => (r.state === "queued" ? { ...r, state: "uploading" } : r)),
    );

    try {
      const payload = await Promise.all(
        ok.map(async (f) => ({ file: await readAsDataUrl(f), name: f.name, alt: "" })),
      );
      const res = await upload({ workspaceId, files: payload }).unwrap();

      const failedNames = new Map(res.failed?.map((f) => [f.name, f.message]) ?? []);
      setTray((rows) =>
        rows.map((r) =>
          r.state === "error"
            ? r
            : failedNames.has(r.file.name)
              ? { ...r, state: "error", error: failedNames.get(r.file.name) }
              : { ...r, state: "done" },
        ),
      );
    } catch (err) {
      const message = errMessage(err);
      setTray((rows) =>
        rows.map((r) => (r.state === "error" ? r : { ...r, state: "error", error: message })),
      );
      notify.error(message);
    } finally {
      if (fileInput.current) fileInput.current.value = "";
      window.setTimeout(() => setTray([]), 6000);
    }
  }

  function confirm() {
    if (!selected) return;
    onPick(selected);
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size={1040}
      centered
      styles={{ title: { fontWeight: 600, fontSize: "var(--mantine-font-size-lg)" } }}
    >
      <Stack>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept={kind === "image" ? "image/*" : kind === "video" ? "video/*" : undefined}
          hidden
          onChange={(e) => onFiles(e.currentTarget.files)}
        />

        <Group gap="sm">
          <TextInput
            style={{ flex: 1 }}
            placeholder="Search by name"
            leftSection={<Search size={16} />}
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
          />
          {/* Hidden when the field only accepts one kind — a logo picker has
              nothing to filter between. */}
          {!kind && (
            <SegmentedControl
              size="xs"
              value={filter}
              onChange={(v) => setFilter(v as MediaKind | "all")}
              data={[
                { label: "Images", value: "image" },
                { label: "Video", value: "video" },
                { label: "Files", value: "raw" },
                { label: "All", value: "all" },
              ]}
            />
          )}
          {canEdit && (
            <Button
              variant="default"
              size="sm"
              leftSection={<Upload size={15} />}
              onClick={() => fileInput.current?.click()}
            >
              Upload
            </Button>
          )}
        </Group>

        {/* The wall scrolls, not the modal: the search row and the footer stay
            put while the files move. Also takes a drop, same as the library page. */}
        <Box
          style={{ maxHeight: "58vh", overflowY: "auto", position: "relative" }}
          onDragOver={(e) => {
            if (!canEdit) return;
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            if (!canEdit) return;
            e.preventDefault();
            setDragging(false);
            void onFiles(e.dataTransfer.files);
          }}
          data-dragging={dragging || undefined}
        >
          {isFetching && !items.length ? (
            /* Fewer than the library page draws: this is a 58vh scroll box, and
               a full wall of placeholders below the fold is wasted motion. */
            <MediaGridSkeleton count={6} threeUp />
          ) : items.length === 0 ? (
            <Center py={50}>
              <Stack align="center" gap="xs">
                <ImageOff size={26} opacity={0.4} />
                <Text size="sm" c="dimmed">
                  {debouncedQ ? "Nothing matches that." : "Nothing here yet."}
                </Text>
                {!debouncedQ && canEdit && (
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<Upload size={14} />}
                    onClick={() => fileInput.current?.click()}
                  >
                    Upload a file
                  </Button>
                )}
              </Stack>
            </Center>
          ) : (
            <MediaGrid
              items={items}
              selectedId={selected?.id}
              onSelect={setSelected}
              maxColumns={3}
            />
          )}
        </Box>

        {pages > 1 && (
          <Group justify="center">
            <Pagination size="sm" value={page} onChange={setPage} total={pages} />
          </Group>
        )}

        <UploadTray items={tray} />

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {selected ? selected.name : "Select a file"}
          </Text>
          <Group gap="xs">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={!selected} onClick={confirm}>
              Use this file
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
