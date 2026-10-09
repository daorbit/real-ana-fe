import { Loader, Tooltip, UnstyledButton } from "@mantine/core";
import { AlertCircle, Check, Copy, Download } from "lucide-react";
import { timeAgo } from "@/shared/lib";
import { ComposeButton } from "@/features/notes/components/ComposeButton";
import type { SaveState } from "@/features/notes/hooks/useNoteDraft";
import classes from "@/features/notes/components/Notes.module.css";

function StatusText({ state, updatedAt }: { state: SaveState; updatedAt: string }) {
  if (state === "saving") return <><Loader size={9} color="gray" /> Saving…</>;
  if (state === "saved") return <><Check size={12} strokeWidth={2.5} /> Saved</>;
  if (state === "error") return <><AlertCircle size={12} /> Not saved — keep typing to retry</>;
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
  ];

  return (
    <footer className={classes.bar}>
      <span className={classes.barTools}>
        {actions.map(({ label, icon: Icon, onClick }) => (
          <Tooltip key={label} label={label} withArrow openDelay={400}>
            <UnstyledButton className={classes.tool} onClick={onClick} aria-label={label}>
              <Icon size={15} />
            </UnstyledButton>
          </Tooltip>
        ))}
      </span>
      <span className={classes.status} data-state={saveState} aria-live="polite">
        <StatusText state={saveState} updatedAt={updatedAt} />
        <span className={classes.statusDivider} aria-hidden="true">·</span>
        <span>{words} {words === 1 ? "word" : "words"}</span>
      </span>
      <ComposeButton onClick={onNew} />
    </footer>
  );
}
