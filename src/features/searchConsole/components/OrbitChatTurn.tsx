import { useState } from "react";
import { ActionIcon, Textarea, Tooltip, UnstyledButton } from "@mantine/core";
import { AlertTriangle, Copy, Pencil, RefreshCw, Share2 } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { RichText, toPlainText } from "@/features/orbit/components/RichText";
import { useTypewriter } from "@/features/orbit/useTypewriter";
import { notify } from "@/shared/lib/notify";
import type { SearchOrbitMessage } from "../useSearchOrbitChat";
import classes from "./orbitChat.module.css";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    notify.success("Copied to clipboard");
  } catch {
    notify.error("Couldn't copy that.");
  }
}

async function share(text: string) {
  if (navigator.share) {
    try {
      await navigator.share({ title: "Orbit AI", text });
    } catch {
      return;
    }
    return;
  }
  await copyText(text);
}

function UserTurn({
  message,
  editable,
  onEdit,
}: {
  message: SearchOrbitMessage;
  editable: boolean;
  onEdit: (text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);

  const commit = () => {
    const text = draft.trim();
    setEditing(false);
    if (text && text !== message.content) onEdit(text);
  };

  if (editing) {
    return (
      <div className={classes.userTurnEditing}>
        <Textarea
          value={draft}
          autoFocus
          autosize
          minRows={1}
          maxRows={8}
          variant="unstyled"
          size="sm"
          onChange={(e) => setDraft(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") setEditing(false);
          }}
        />
        <div className={classes.editActions}>
          <UnstyledButton className={classes.editCancel} onClick={() => setEditing(false)}>
            Cancel
          </UnstyledButton>
          <UnstyledButton className={classes.editSave} onClick={commit} disabled={!draft.trim()}>
            Send
          </UnstyledButton>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.userTurnRow}>
      {editable && message.mode !== "summary" && (
        <Tooltip label="Edit and re-ask" withArrow position="left">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            radius="xl"
            className={classes.userTurnEdit}
            onClick={() => {
              setDraft(message.content);
              setEditing(true);
            }}
            aria-label="Edit and re-ask"
          >
            <Pencil size={13} />
          </ActionIcon>
        </Tooltip>
      )}
      <div className={classes.userTurn}>{message.content}</div>
    </div>
  );
}

function AnswerTurn({
  message,
  live,
  isLast,
  busy,
  onRevealed,
  onRegenerate,
}: {
  message: SearchOrbitMessage;
  live: boolean;
  isLast: boolean;
  busy: boolean;
  onRevealed: () => void;
  onRegenerate: () => void;
}) {
  const shown = useTypewriter(message.content, live, onRevealed);

  if (message.stopped) {
    return (
      <div className={classes.stopped}>
        Stopped
        {isLast && (
          <UnstyledButton className={classes.askAgain} onClick={onRegenerate} disabled={busy}>
            <RefreshCw size={12} />
            Ask again
          </UnstyledButton>
        )}
      </div>
    );
  }

  return (
    <div className={classes.answer}>
      <div className={classes.answerHead}>
        {message.failed ? <AlertTriangle size={16} color="var(--mantine-color-orange-5)" /> : <OrbitMark size={20} />}
        <span className={classes.answerName}>Orbit</span>
      </div>
      <div className={classes.answerBody} data-failed={message.failed || undefined}>
        <RichText text={shown} animate={live} />
        {!live && (
          <div className={classes.actions}>
            {!message.failed && (
              <>
                <Tooltip label="Copy" withArrow>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    radius="xl"
                    onClick={() => void copyText(toPlainText(message.content))}
                    aria-label="Copy"
                  >
                    <Copy size={13} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Share" withArrow>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    radius="xl"
                    onClick={() => void share(toPlainText(message.content))}
                    aria-label="Share"
                  >
                    <Share2 size={13} />
                  </ActionIcon>
                </Tooltip>
              </>
            )}
            {isLast && (
              <Tooltip label="Regenerate" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  radius="xl"
                  onClick={onRegenerate}
                  disabled={busy}
                  aria-label="Regenerate"
                >
                  <RefreshCw size={13} />
                </ActionIcon>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function OrbitChatTurn({
  message,
  live,
  isLast,
  busy,
  onRevealed,
  onRegenerate,
  onEdit,
}: {
  message: SearchOrbitMessage;
  live: boolean;
  isLast: boolean;
  busy: boolean;
  onRevealed: () => void;
  onRegenerate: () => void;
  onEdit: (text: string) => void;
}) {
  if (message.role === "user") return <UserTurn message={message} editable={!busy} onEdit={onEdit} />;
  return (
    <AnswerTurn
      message={message}
      live={live}
      isLast={isLast}
      busy={busy}
      onRevealed={onRevealed}
      onRegenerate={onRegenerate}
    />
  );
}

export function OrbitThinkingRow({ label = "Reading your search data" }: { label?: string }) {
  return (
    <div className={classes.answer}>
      <div className={classes.answerHead}>
        <OrbitMark size={20} className={classes.markPulse} />
        <span className={classes.thinking}>{label}</span>
      </div>
    </div>
  );
}
