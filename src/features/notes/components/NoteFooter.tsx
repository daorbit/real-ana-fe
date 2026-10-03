import { ActionIcon, Loader, Tooltip } from "@mantine/core";
import { AlertCircle, Check, Copy, Download, Plus } from "lucide-react";
import { timeAgo } from "@/shared/lib";
import type { SaveState } from "@/features/notes/hooks/useNoteDraft";
import classes from "@/features/notes/components/Notes.module.css";

function StatusText({ state, updatedAt }: { state: SaveState; updatedAt: string }) {
  if (state === "saving") return <><Loader size={10} color="gray" /> Saving…</>;
  if (state === "saved") return <><Check size={13} /> Saved</>;
  if (state === "error") return <><AlertCircle size={13} /> Not saved — keep typing to retry</>;
  return <>Edited {timeAgo(updatedAt)}</>;
}

export function NoteFooter({
  saveState,
  updatedAt,
  words,
  onCopy,
  onDownload,
  onNew,
}: {
  saveState: SaveState;
  updatedAt: string;
  words: number;
  onCopy: () => void;
  onDownload: () => void;
  onNew: () => void;
}) {
  const actions = [
    { label: "Copy text", icon: Copy, onClick: onCopy },
    { label: "Download as .txt", icon: Download, onClick: onDownload },
    { label: "New note", icon: Plus, onClick: onNew },
  ];

  return (
    <footer className={classes.foot}>
      <span className={classes.status} data-state={saveState} aria-live="polite">
        <StatusText state={saveState} updatedAt={updatedAt} />
        <span>· {words} word{words === 1 ? "" : "s"}</span>
      </span>
      <span className={classes.footActions}>
        {actions.map(({ label, icon: Icon, onClick }) => (
          <Tooltip key={label} label={label} withArrow>
            <ActionIcon variant="subtle" color="gray" radius="md" onClick={onClick} aria-label={label}>
              <Icon size={15} />
            </ActionIcon>
          </Tooltip>
        ))}
      </span>
    </footer>
  );
}
