import { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal, TextInput, Button, Text, SegmentedControl, Pagination, Box,
} from "@mantine/core";
import { Search, ImageOff, Upload } from "lucide-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useGetMediaQuery, useUploadMediaMutation } from "@/app/store";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useDemo } from "@/features/demo/context";
import { demoMediaResponse } from "@/features/demo/demoMedia";
import { notify, errMessage } from "@/shared/lib/notify";
import type { MediaAsset, MediaKind } from "@/shared/types";
import { MediaGrid } from "./MediaGrid";
import { MediaGridSkeleton } from "./MediaGridSkeleton";
import { UploadTray, type UploadItem } from "./UploadTray";
import { MAX_ASSET_BYTES, MAX_ASSET_LABEL } from "../lib";
import { uploadInBatches } from "../uploadInBatches";
import classes from "./MediaPickerModal.module.css";

const PER_PAGE = 12;

interface Props {
  opened: boolean;
  onClose: () => void;
  onPick: (asset: MediaAsset) => void;
  kind?: MediaKind;
  title?: string;
}

export function MediaPickerModal({
  opened,
  onClose,
  onPick,
  kind,
  title = "Choose a file",
}: Props) {
  const { active } = useWorkspace();
  const perms = usePermissions();
  const { demo } = useDemo();
  const canEdit = perms.canEdit && !demo;
  const workspaceId = active?._id ?? "";
  const fileInput = useRef<HTMLInputElement>(null);
  const [upload] = useUploadMediaMutation();
  const [tray, setTray] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);

  const [q, setQ] = useState("");
  const [debouncedQ] = useDebouncedValue(q, 250);
  const [filter, setFilter] = useState<MediaKind | "all">(kind ?? "image");
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!opened) return;
    setSelected(null);
    setQ("");
    setFilter(kind ?? "image");
    setPage(1);
    setTray([]);
    setDragging(false);
  }, [opened, kind]);

  useEffect(() => {
    setPage(1);
  }, [filter, debouncedQ]);

  const { data: queried, isFetching: queryFetching } = useGetMediaQuery(
    {
      workspaceId,
      q: debouncedQ || undefined,
      kind: filter === "all" ? undefined : filter,
      page,
      perPage: PER_PAGE,
    },
    { skip: !workspaceId || !opened || demo },
  );
  const sample = useMemo(
    () =>
      demo
        ? demoMediaResponse({
            q: debouncedQ || undefined,
            kind: filter === "all" ? undefined : filter,
            page,
            perPage: PER_PAGE,
          })
        : null,
    [demo, debouncedQ, filter, page],
  );
  const data = sample ?? queried;
  const isFetching = sample ? false : queryFetching;

  const items = data?.items ?? [];
  const pages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;

  async function onFiles(list: FileList | null) {
    if (!list?.length || !canEdit || !workspaceId) return;

    const files = Array.from(list);
    const queued: UploadItem[] = files.map((file) =>
      file.size > MAX_ASSET_BYTES
        ? { file, state: "error", error: `Larger than ${MAX_ASSET_LABEL}` }
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
      const res = await uploadInBatches(ok, (files) => upload({ workspaceId, files }).unwrap());

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
      radius="lg"
      centered
      classNames={{ content: classes.content, header: classes.header, title: classes.title, body: classes.body }}
    >
        <input
          ref={fileInput}
          type="file"
          multiple
          accept={kind === "image" ? "image/*" : kind === "video" ? "video/*" : undefined}
          hidden
          onChange={(e) => onFiles(e.currentTarget.files)}
        />

        <div className={classes.toolbar}>
          <TextInput
            className={classes.search}
            radius="md"
            placeholder="Search by name"
            leftSection={<Search size={15} />}
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
            aria-label="Search files"
          />
          {!kind && (
            <SegmentedControl
              size="xs"
              radius="md"
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
              radius="md"
              leftSection={<Upload size={15} />}
              onClick={() => fileInput.current?.click()}
            >
              Upload
            </Button>
          )}
        </div>

        <Box
          className={classes.scroll}
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
            <MediaGridSkeleton count={8} picker />
          ) : items.length === 0 ? (
            <div className={classes.empty}>
              <span className={classes.emptyIcon}>
                <ImageOff size={20} />
              </span>
              <Text size="sm" fw={600} c="var(--text)">
                {debouncedQ ? "Nothing matches that" : "Nothing here yet"}
              </Text>
              <Text size="xs" c="dimmed">
                {debouncedQ ? "Try a different name." : canEdit ? "Upload a file or drop one here." : "Files added to Media show up here."}
              </Text>
              {!debouncedQ && canEdit && (
                <Button
                  variant="default"
                  size="xs"
                  radius="md"
                  mt={4}
                  leftSection={<Upload size={14} />}
                  onClick={() => fileInput.current?.click()}
                >
                  Upload a file
                </Button>
              )}
            </div>
          ) : (
            <MediaGrid items={items} selectedId={selected?.id} onSelect={setSelected} picker />
          )}
        </Box>

        {pages > 1 && (
          <div className={classes.pager}>
            <Pagination size="sm" radius="md" value={page} onChange={setPage} total={pages} />
          </div>
        )}

        <UploadTray items={tray} />

        <div className={classes.footer}>
          <span className={classes.selection} data-picked={selected ? true : undefined}>
            {selected ? selected.name : "Select a file"}
          </span>
          <div className={classes.footerActions}>
            <Button variant="default" radius="md" onClick={onClose}>
              Cancel
            </Button>
            <Button radius="md" disabled={!selected} onClick={confirm}>
              Use this file
            </Button>
          </div>
        </div>
    </Modal>
  );
}
