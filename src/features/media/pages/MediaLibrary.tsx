import { useRef, useState } from "react";
import {
  Group, Button, TextInput, Stack, Text, Center, Loader, Box, Modal,
  SegmentedControl, Pagination, Badge, Menu, ActionIcon, Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  Search, Upload, Trash2, ImageOff, Images, Pencil, MoreVertical,
  ExternalLink, Copy, Check,
} from "lucide-react";
import {
  useGetMediaQuery,
  useUploadMediaMutation,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
  useBulkDeleteMediaMutation,
} from "@/app/store";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { EmptyState } from "@/shared/ui/EmptyState";
import { notify, errMessage, confirmDelete } from "@/shared/lib/notify";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useTitle } from "@/shared/lib/useTitle";
import type { MediaAsset, MediaKind } from "@/shared/types";
import { MediaGrid } from "../components/MediaGrid";
import { UploadTray, type UploadItem } from "../components/UploadTray";
import { formatBytes, previewUrl, readAsDataUrl, MAX_ASSET_BYTES } from "../lib";
import classes from "./MediaLibrary.module.css";

const PER_PAGE = 40;

/**
 * The workspace's media library.
 *
 * The one place files enter the product. Everywhere else picks from here, so
 * this page owns uploading, naming and deleting — and nothing else has to.
 */
export default function MediaLibraryPage() {
  useTitle("Media");
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const workspaceId = active?._id ?? "";
  const fileInput = useRef<HTMLInputElement>(null);

  const [q, setQ] = useState("");
  const [debouncedQ] = useDebouncedValue(q, 250);
  const [filter, setFilter] = useState<MediaKind | "all">("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewing, setViewing] = useState<MediaAsset | null>(null);
  const [renaming, setRenaming] = useState("");
  const [dragging, setDragging] = useState(false);
  /** What the floating tray is reporting. Cleared a moment after it settles. */
  const [tray, setTray] = useState<UploadItem[]>([]);

  const { data, isLoading, isFetching } = useGetMediaQuery(
    {
      workspaceId,
      q: debouncedQ || undefined,
      kind: filter === "all" ? undefined : filter,
      page,
      perPage: PER_PAGE,
    },
    { skip: !workspaceId },
  );

  const [upload] = useUploadMediaMutation();
  const [update, { isLoading: renamingBusy }] = useUpdateMediaMutation();
  const [remove] = useDeleteMediaMutation();
  const [bulkRemove] = useBulkDeleteMediaMutation();

  const items = data?.items ?? [];
  const pages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;

  async function onFiles(list: FileList | null) {
    if (!list?.length || !canEdit) return;

    const files = Array.from(list);
    // Refused before reading: turning a 60MB video into a base64 string only
    // to have the server reject it wastes the whole wait.
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

      // The server answers per file, so the tray can say which one failed
      // rather than reporting the batch as one outcome.
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
    } finally {
      if (fileInput.current) fileInput.current.value = "";
      // Left up long enough to read, then cleared — it is a report, not state.
      window.setTimeout(() => setTray([]), 6000);
    }
  }

  async function saveName() {
    if (!viewing || !renaming.trim()) return;
    try {
      await update({ workspaceId, id: viewing.id, name: renaming.trim() }).unwrap();
      setViewing({ ...viewing, name: renaming.trim() });
      notify.success("Renamed");
    } catch (err) {
      notify.error(errMessage(err));
    }
  }

  async function deleteOne(asset: MediaAsset) {
    // Worth confirming: anything already pointing at this file keeps its URL,
    // and that URL stops resolving.
    if (
      !(await confirmDelete({
        title: `Delete ${asset.name}?`,
        body: "Anything already using this file keeps its URL, and that URL will stop working.",
      }))
    )
      return;
    try {
      await remove({ workspaceId, id: asset.id }).unwrap();
      setViewing(null);
      setSelected((ids) => {
        const next = new Set(ids);
        next.delete(asset.id);
        return next;
      });
      notify.success("Deleted");
    } catch (err) {
      notify.error(errMessage(err));
    }
  }

  async function deleteSelected() {
    if (
      !(await confirmDelete({
        title: `Delete ${selected.size} file(s)?`,
        body: "Anything already using them keeps its URL, and those URLs will stop working.",
      }))
    )
      return;
    try {
      await bulkRemove({ workspaceId, ids: [...selected] }).unwrap();
      notify.success(`${selected.size} file(s) deleted.`);
      setSelected(new Set());
    } catch (err) {
      notify.error(errMessage(err));
    }
  }

  if (!active) {
    return (
      <AppShell>
        <EmptyState
          icon={Images}
          title="No workspace selected"
          description="Choose a workspace from the switcher to see its files."
          action={{ label: "Go to workspaces", to: "/app/workspaces" }}
        />
      </AppShell>
    );
  }

  const selecting = selected.size > 0;

  return (
    <AppShell>
      <PageHeader
        title="Media"
        description={`Files ${active.name} can use on posts, forms and payment windows.`}
        actions={
          <Group gap="xs" wrap="nowrap">
            {selecting && (
              <>
                <Button variant="subtle" color="gray" onClick={() => setSelected(new Set())}>
                  Clear
                </Button>
                <Button
                  variant="light"
                  color="red"
                  leftSection={<Trash2 size={15} />}
                  onClick={deleteSelected}
                >
                  Delete {selected.size}
                </Button>
              </>
            )}
            {canEdit && (
              <Button
                leftSection={<Upload size={15} />}
                onClick={() => fileInput.current?.click()}
              >
                Upload
              </Button>
            )}
          </Group>
        }
      />

      <input
        ref={fileInput}
        type="file"
        multiple
        hidden
        onChange={(e) => onFiles(e.currentTarget.files)}
      />

      <Group gap="sm" mt="md" mb="md" wrap="nowrap">
        <TextInput
          flex={1}
          placeholder="Search by name"
          leftSection={<Search size={15} />}
          value={q}
          onChange={(e) => {
            setQ(e.currentTarget.value);
            setPage(1);
          }}
        />
        <SegmentedControl
          size="xs"
          value={filter}
          onChange={(v) => {
            setFilter(v as MediaKind | "all");
            setPage(1);
          }}
          data={[
            { value: "all", label: "All" },
            { value: "image", label: "Images" },
            { value: "video", label: "Video" },
            { value: "raw", label: "Files" },
          ]}
        />
      </Group>

      {/* The whole library takes a drop, not just an empty-state box: dragging
          a file onto a wall of files is the obvious gesture once there is
          already something there. */}
      <Box
        className={`${classes.dropZone} ${dragging ? classes.dropping : ""}`}
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
      >
        {isLoading ? (
          <Center h={320}>
            <Loader size="sm" />
          </Center>
        ) : items.length ? (
          <Stack gap="md">
            <MediaGrid
              items={items}
              selectedIds={selecting ? selected : undefined}
              onToggleSelect={(id) =>
                setSelected((ids) => {
                  const next = new Set(ids);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                })
              }
              onSelect={(asset) => {
                setViewing(asset);
                setRenaming(asset.name);
              }}
              renderActions={
                canEdit
                  ? (asset) => (
                      <Tooltip label="Select" withArrow>
                        <ActionIcon
                          size="sm"
                          variant="default"
                          aria-label={`Select ${asset.name}`}
                          onClick={() => setSelected(new Set([asset.id]))}
                        >
                          <Check />
                        </ActionIcon>
                      </Tooltip>
                    )
                  : undefined
              }
            />

            {pages > 1 && (
              <Group justify="center">
                <Pagination value={page} onChange={setPage} total={pages} size="sm" />
              </Group>
            )}

            <Text size="xs" c="dimmed" ta="center">
              {data?.total} file{data?.total === 1 ? "" : "s"}
              {isFetching ? " · refreshing" : ""}
            </Text>
          </Stack>
        ) : (
          <EmptyState
            icon={debouncedQ ? Search : ImageOff}
            title={debouncedQ ? "Nothing matches that" : "No files yet"}
            description={
              debouncedQ
                ? "Try a different search."
                : "Drop files here, or use Upload. Everything you add can be picked from anywhere in the product."
            }
          />
        )}
      </Box>

      {/* One asset, close up — the only place its URL and dimensions are
          readable, and where renaming happens. */}
      <Modal
        opened={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.name}
        size="lg"
        radius="md"
      >
        {viewing && (
          <Stack gap="md">
            <Box
              style={{
                borderRadius: "var(--mantine-radius-md)",
                border: "1px solid var(--mantine-color-default-border)",
                overflow: "hidden",
                background: "var(--mantine-color-default-hover)",
              }}
            >
              {viewing.kind === "video" ? (
                <video src={viewing.url} controls style={{ width: "100%", maxHeight: 380 }} />
              ) : previewUrl(viewing) ? (
                <img
                  src={viewing.url}
                  alt={viewing.alt || viewing.name}
                  style={{ width: "100%", maxHeight: 380, objectFit: "contain" }}
                />
              ) : (
                <Center h={180}>
                  <Text size="sm" c="dimmed">
                    No preview for {viewing.format || "this file"}
                  </Text>
                </Center>
              )}
            </Box>

            <Group gap="xs">
              <Badge variant="light" size="sm">
                {viewing.kind}
              </Badge>
              <Badge variant="light" color="gray" size="sm">
                {formatBytes(viewing.bytes)}
              </Badge>
              {viewing.width && viewing.height && (
                <Badge variant="light" color="gray" size="sm">
                  {viewing.width}×{viewing.height}
                </Badge>
              )}
            </Group>

            <Group gap="xs" align="flex-end">
              <TextInput
                flex={1}
                label="Name"
                value={renaming}
                onChange={(e) => setRenaming(e.currentTarget.value)}
                disabled={!canEdit}
              />
              <Button
                variant="light"
                leftSection={<Pencil size={14} />}
                onClick={saveName}
                loading={renamingBusy}
                disabled={!canEdit || renaming.trim() === viewing.name}
              >
                Rename
              </Button>
              <Menu position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="default" size="lg">
                    <MoreVertical size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<Copy size={14} />}
                    onClick={() => {
                      void navigator.clipboard.writeText(viewing.url);
                      notify.success("URL copied");
                    }}
                  >
                    Copy URL
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<ExternalLink size={14} />}
                    component="a"
                    href={viewing.url}
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
                        onClick={() => deleteOne(viewing)}
                      >
                        Delete
                      </Menu.Item>
                    </>
                  )}
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Stack>
        )}
      </Modal>

      <UploadTray items={tray} />
    </AppShell>
  );
}
