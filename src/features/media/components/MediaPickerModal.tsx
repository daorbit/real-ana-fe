import { useEffect, useState } from "react";
import {
  Modal, TextInput, Group, Button, Stack, Text, Center,
  SegmentedControl, Pagination,
} from "@mantine/core";
import { Search, ImageOff, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDebouncedValue } from "@mantine/hooks";
import { useGetMediaQuery } from "@/app/store";
import { useWorkspace } from "@/features/workspace/context";
import type { MediaAsset, MediaKind } from "@/shared/types";
import { MediaGrid } from "./MediaGrid";
import { MediaGridSkeleton } from "./MediaGridSkeleton";

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
 * There is no upload here: files enter the workspace on the media page, so
 * what a post, a logo and an avatar draw from is one shelf, and nothing
 * arrives that cannot be found again.
 */
export function MediaPickerModal({
  opened,
  onClose,
  onPick,
  kind,
  title = "Choose a file",
}: Props) {
  const navigate = useNavigate();
  const { active } = useWorkspace();
  const workspaceId = active?._id ?? "";

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
        </Group>

        {/* The wall scrolls, not the modal: the search row and the footer stay
            put while the files move. */}
        <div style={{ maxHeight: "58vh", overflowY: "auto" }}>
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
                {/* The only route to an upload, since this modal has none. */}
                {!debouncedQ && (
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<Upload size={14} />}
                    onClick={() => {
                      onClose();
                      navigate("/app/media");
                    }}
                  >
                    Add files to your library
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
        </div>

        {pages > 1 && (
          <Group justify="center">
            <Pagination size="sm" value={page} onChange={setPage} total={pages} />
          </Group>
        )}

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
