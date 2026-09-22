import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  ActionIcon, Alert, Anchor, Box, Button, Center, Group, Loader, Menu, ScrollArea, Stack, Text,
  Textarea, Title, Tooltip, UnstyledButton,
} from "@mantine/core";
import {
  AlertTriangle, ArrowUp, Check, ChevronDown, ClipboardList, Copy, Download, FileText, FolderPlus,
  Globe, History, Mic, Palette, Pencil, Paperclip, RefreshCw, RotateCcw, Share2, Square,
  Volume2, VolumeX, X,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { useSpeechInput } from "@/shared/hooks/useSpeechInput";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { RichText } from "@/features/orbit/components/RichText";
import { DataDigestTable, csvFromDigest, formatDigestAsText, isDataDigest } from "@/features/orbit/components/DataDigestTable";
import { useOrbit } from "@/features/orbit/components/OrbitProvider";
import { useWorkspace } from "@/features/workspace/context";
import { useIsPlatformAdmin } from "@/features/auth/context";
import { pickOrbitSuggestions } from "@/features/orbit/orbitSuggestions";
import type { OrbitMessage } from "@/features/orbit/useOrbitChat";
import { useTypewriter } from "@/features/orbit/useTypewriter";
import { OrbitHistoryDrawer } from "./OrbitHistoryDrawer";
import { ActivityBellIcon } from "@/features/activity/ActivityBell";
import { notify } from "@/shared/lib/notify";
import classes from "./orbitPage.module.css";


async function copyText(text: string, successMessage = "Copied to clipboard") {
  try {
    await navigator.clipboard.writeText(text);
    notify.success(successMessage);
  } catch {
    notify.error("Couldn't copy that.");
  }
}

async function copyDigestAsReport(digest: unknown) {
  if (!isDataDigest(digest)) return;
  await copyText(formatDigestAsText(digest), "Report copied to clipboard");
}

function downloadDigestAsCsv(digest: unknown) {
  if (!isDataDigest(digest)) return;
  const blob = new Blob([csvFromDigest(digest)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `orbit-report-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function copyImage(url: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    notify.success("Image copied to clipboard");
  } catch {
    // Clipboard image writes are unsupported on some browsers (Firefox) and
    // fail outright on http — a link is still something to share.
    await copyText(url);
  }
}

async function shareTurn(message: OrbitMessage) {
  const shareData: ShareData = message.imageUrl
    ? { title: "Orbit AI", text: message.content || undefined, url: message.imageUrl }
    : { title: "Orbit AI", text: message.content };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch {
      // Cancelled by the person, most likely — nothing to report.
    }
    return;
  }

  await copyText(message.imageUrl ?? message.content);
  notify.info("Sharing isn't available here — copied instead.");
}

/**
 * Read an answer aloud with the browser's own voice, and stop cleanly when
 * asked to, the turn changes, or the component unmounts.
 *
 * `window.speechSynthesis` is a single shared, global queue — without
 * cancelling on unmount and on every new play, a second "Read aloud" click
 * elsewhere in the thread would queue behind the first instead of replacing
 * it, and a closed panel would keep talking.
 */
function useSpeech() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setSpeakingId(null);
  }, [supported]);

  const speak = useCallback(
    (id: string, text: string) => {
      if (!supported || !text.trim()) return;
      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1;
      utter.onend = () => setSpeakingId((cur) => (cur === id ? null : cur));
      utter.onerror = () => setSpeakingId((cur) => (cur === id ? null : cur));
      window.speechSynthesis.speak(utter);
      setSpeakingId(id);
    },
    [supported],
  );

  const toggle = useCallback(
    (id: string, text: string) => {
      if (speakingId === id) stop();
      else speak(id, text);
    },
    [speakingId, speak, stop],
  );

  useEffect(() => () => stop(), [stop]);

  return { supported, speakingId, toggle };
}

async function downloadImage(url: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const ext = blob.type.split("/")[1]?.split("+")[0] || "png";
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `orbit-${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank");
  }
}

function GeneratedImage({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={classes.generatedImageWrap}>
      {!loaded && <div className={classes.generatedImageSkeleton} />}
      <img
        src={url}
        alt="Generated"
        className={classes.generatedImage}
        data-loaded={loaded}
        onLoad={() => setLoaded(true)}
      />
      {loaded && (
        <Tooltip label="Download image" withArrow>
          <ActionIcon
            className={classes.generatedImageDownload}
            variant="default"
            radius="xl"
            onClick={() => downloadImage(url)}
            aria-label="Download image"
          >
            <Download size={16} />
          </ActionIcon>
        </Tooltip>
      )}
    </div>
  );
}

function TurnActions({
  message,
  onRegenerate,
  regenerating,
  speaking,
  onToggleSpeech,
}: {
  message: OrbitMessage;
  onRegenerate?: () => void;
  regenerating?: boolean;
  speaking?: boolean;
  onToggleSpeech?: () => void;
}) {
  const isPlatformAdmin = useIsPlatformAdmin();

  return (
    <Group gap={2} mt={6} wrap="nowrap" align="center">
      {isPlatformAdmin && message.modelLabel && (
        <Text size="10px" c="dimmed" fw={600} tt="uppercase" mr={4} style={{ letterSpacing: "0.04em" }}>
          {message.modelLabel}
        </Text>
      )}
      <Tooltip label={message.imageUrl ? "Copy image" : "Copy"} withArrow>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          radius="xl"
          onClick={() => (message.imageUrl ? copyImage(message.imageUrl) : copyText(message.content))}
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
          onClick={() => shareTurn(message)}
          aria-label="Share"
        >
          <Share2 size={13} />
        </ActionIcon>
      </Tooltip>
      {onToggleSpeech && (
        <Tooltip label={speaking ? "Stop reading" : "Read aloud"} withArrow>
          <ActionIcon
            variant="subtle"
            color={speaking ? "emerald" : "gray"}
            size="sm"
            radius="xl"
            onClick={onToggleSpeech}
            aria-label={speaking ? "Stop reading" : "Read aloud"}
            aria-pressed={speaking}
          >
            {speaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </ActionIcon>
        </Tooltip>
      )}
      {isDataDigest(message.dataDigest) && (
        <>
          <Tooltip label="Copy as report" withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              radius="xl"
              onClick={() => copyDigestAsReport(message.dataDigest)}
              aria-label="Copy as report"
            >
              <ClipboardList size={13} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Download as CSV" withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              radius="xl"
              onClick={() => downloadDigestAsCsv(message.dataDigest)}
              aria-label="Download as CSV"
            >
              <Download size={13} />
            </ActionIcon>
          </Tooltip>
        </>
      )}
      {onRegenerate && (
        <Tooltip label="Regenerate" withArrow>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            radius="xl"
            onClick={onRegenerate}
            disabled={regenerating}
            aria-label="Regenerate"
          >
            <RefreshCw size={13} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
}

/** The pages a web search drew on, as a compact source list under the answer.
 * Only ever set on a Claude turn — see callAnthropic on the server. */
function CitationsList({ citations }: { citations?: { url: string; title: string }[] }) {
  if (!citations?.length) return null;

  return (
    <Group gap={6} mt={10} wrap="wrap" align="center">
      <Globe size={12} style={{ color: "var(--mantine-color-dimmed)", flexShrink: 0 }} />
      {citations.map((c, i) => (
        <Anchor
          key={c.url}
          href={c.url}
          target="_blank"
          rel="noopener noreferrer"
          size="xs"
          c="dimmed"
          underline="always"
        >
          {i + 1}. {c.title}
        </Anchor>
      ))}
    </Group>
  );
}

/** An answer's prose, revealed at reading speed when it has just arrived. */
function AnswerText({
  message,
  live,
  onDone,
}: {
  message: OrbitMessage;
  live: boolean;
  onDone?: () => void;
}) {
  const shown = useTypewriter(message.content, live, onDone);

  return (
    <Text
      size="sm"
      lh={1.7}
      c={message.failed ? "dimmed" : undefined}
      style={{ whiteSpace: "pre-wrap" }}
    >
      <RichText text={shown} />
    </Text>
  );
}

function UserTurn({
  message,
  onEdit,
  editable,
}: {
  message: OrbitMessage;
  onEdit?: (text: string) => void;
  editable?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);

  const begin = () => {
    setDraft(message.content);
    setEditing(true);
  };

  const commit = () => {
    const text = draft.trim();
    setEditing(false);
    if (!text || text === message.content) return;
    onEdit?.(text);
  };

  if (editing) {
    return (
      <Group justify="flex-end" wrap="nowrap">
        <Box className={classes.userTurnEditing}>
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
          <Group gap={6} justify="flex-end" mt={6}>
            <UnstyledButton className={classes.editCancel} onClick={() => setEditing(false)}>
              <Text size="xs">Cancel</Text>
            </UnstyledButton>
            <UnstyledButton
              component="button"
              type="button"
              className={classes.editSave}
              onClick={commit}
              disabled={!draft.trim()}
            >
              <Text size="xs" fw={600}>
                Send
              </Text>
            </UnstyledButton>
          </Group>
        </Box>
      </Group>
    );
  }

  return (
    <Stack gap={6} align="flex-end">
      {message.imageUrl && (
        <img src={message.imageUrl} alt="Attached" className={classes.userTurnImageStandalone} />
      )}
      {message.documentName && (
        <Group gap={6} wrap="nowrap" className={classes.userTurn} style={{ padding: "6px 10px" }}>
          <FileText size={14} style={{ flexShrink: 0, color: "var(--mantine-color-dimmed)" }} />
          <Text size="xs" lh={1.4} truncate maw={220}>
            {message.documentName}
          </Text>
        </Group>
      )}
      {message.content && (
        <Group justify="flex-end" wrap="nowrap" gap={4} className={classes.userTurnRow}>

          <Tooltip label="Edit and re-ask" withArrow position="left" disabled={!editable}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              radius="xl"
              className={classes.userTurnEdit}
              onClick={begin}
              disabled={!editable}
              aria-label="Edit and re-ask"
              // Hidden from assistive tech while it cannot be used, but still
              // occupying its place in the row.
              aria-hidden={!editable}
              style={editable ? undefined : { visibility: "hidden" }}
            >
              <Pencil size={13} />
            </ActionIcon>
          </Tooltip>
          <Box className={classes.userTurn}>
            <Text size="sm" lh={1.6} style={{ whiteSpace: "pre-wrap" }}>
              {message.content}
            </Text>
          </Box>
        </Group>
      )}
    </Stack>
  );
}

function Turn({
  message,
  isLast,
  live,
  onRevealed,
  onRegenerate,
  onEdit,
  editable,
  regenerating,
  speaking,
  onToggleSpeech,
}: {
  message: OrbitMessage;
  isLast?: boolean;
  /** Whether this answer should type itself in rather than appear whole. */
  live?: boolean;
  /** Fired once the reveal has finished, so the page can stop treating this
   * turn as still arriving. */
  onRevealed?: () => void;
  onRegenerate?: () => void;
  /** Re-ask this question with different wording. */
  onEdit?: (text: string) => void;
  /** Whether this question can be edited — false while Orbit is busy. */
  editable?: boolean;
  regenerating?: boolean;
  /** Whether this turn is the one currently being read aloud. */
  speaking?: boolean;
  onToggleSpeech?: () => void;
}) {
  if (message.role === "user") {
    return <UserTurn message={message} onEdit={onEdit} editable={editable} />;
  }

  if (message.stopped) {
    return (
      <Group gap={10} wrap="nowrap" align="center" pl={34}>
        <Text size="xs" c="dimmed">
          Stopped
        </Text>
        {isLast && onRegenerate && (
          <UnstyledButton onClick={onRegenerate} disabled={regenerating}>
            <Group gap={5} wrap="nowrap">
              <RefreshCw size={12} color="var(--mantine-color-emerald-5)" />
              <Text size="xs" c="emerald.5" fw={500}>
                Ask again
              </Text>
            </Group>
          </UnstyledButton>
        )}
      </Group>
    );
  }
 
  return (
    <Group gap={12} wrap="nowrap" align="flex-start">
      <Box style={{ flexShrink: 0, marginTop: 1 }}>
        {message.failed ? (
          <AlertTriangle size={17} color="var(--mantine-color-orange-5)" />
        ) : (
          <OrbitMark size={22} />
        )}
      </Box>
      <div style={{ minWidth: 0, flex: 1 }}>
        {message.imageUrl && <GeneratedImage url={message.imageUrl} />}
        {message.content && (
          <AnswerText message={message} live={Boolean(live)} onDone={onRevealed} />
        )}
        {!live && <DataDigestTable digest={message.dataDigest} takenAtIso={message.digestAt} />}
        {!live && <CitationsList citations={message.citations} />}
        {!message.failed && !live && (
          <TurnActions
            message={message}
            onRegenerate={isLast ? onRegenerate : undefined}
            regenerating={regenerating}
            speaking={speaking}
            onToggleSpeech={
              message.content && !message.imageUrl ? onToggleSpeech : undefined
            }
          />
        )}
      </div>
    </Group>
  );
}

/** Anchored regex: leading verb that suggests drawing. */
const DRAW_RE = /^(draw|generate|gen|create|illustrate|paint|sketch|render|make me (an? )?(image|picture|photo))\b/i;

export default function Orbit() {
  // The page reads the provider's chat rather than calling the hook, so it is
  // the same conversation the bubble holds.
  const { chat } = useOrbit();
  const {
    messages, input, setInput, pendingImage, attachImage, pendingDocument, attachDocument,
    imageMode, setImageMode, send, regenerateLast, editAndResend, stop, thinking, generatingImage,
    available, started, plan, models, model, setModel,
    hasOlderMessages, loadingOlderMessages, loadOlderMessages,
    conversationId, openConversation,
  } = chat;

  // Orbit answers questions about a workspace's data — with none created yet
  // there is nothing for it to look at, so the composer stays up but a banner
  // sends people to create one first instead of letting them ask into a void.
  const { workspaces } = useWorkspace();
  const noWorkspace = workspaces.length === 0;

  // The model picker itself is a super-admin tool, not a user preference —
  // `/status` already hides Claude from everyone else, so the only reason to
  // show a switcher at all is for the admin who has more than the one model
  // every workspace gets.
  const isPlatformAdmin = useIsPlatformAdmin();
  const showModelPicker = isPlatformAdmin && models.length > 1;

 
  const [liveId, setLiveId] = useState<string | null>(null);
  const wasThinking = useRef(false);
  const tts = useSpeech();

  const [searchParams, setSearchParams] = useSearchParams();

  // "pending": the URL named a conversation and its restore is still in
  // flight — the write-back effect below must not run yet, or it would wipe
  // the param out of the URL before `openConversation`'s response lands.
  const urlRestore = useRef<"pending" | "done">(
    searchParams.get("conversationId") ? "pending" : "done",
  );
  useEffect(() => {
    if (urlRestore.current !== "pending") return;
    const fromUrl = searchParams.get("conversationId");
    if (!fromUrl) {
      urlRestore.current = "done";
      return;
    }
    void openConversation(fromUrl).finally(() => {
      urlRestore.current = "done";
    });
    // Deliberately empty deps — this is a one-time restore on mount, not a
    // sync that should re-fire as `openConversation` or params change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the URL in step with the active thread the other direction too — a
  // new conversation getting its server-assigned id, or one opened from the
  // history drawer, both land here as `conversationId` changing. Skipped
  // while a URL-driven restore is still pending, so it never races that
  // restore's own write.
  useEffect(() => {
    if (urlRestore.current === "pending") return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (conversationId) next.set("conversationId", conversationId);
        else next.delete("conversationId");
        return next;
      },
      { replace: true },
    );
  }, [conversationId, setSearchParams]);

  // Picked once per visit, not on every render: reshuffling on each keystroke
  // would make the chips jump around while the composer is still empty.
  const staticStarters = useMemo(() => pickOrbitSuggestions(3), []);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (
      wasThinking.current &&
      !thinking &&
      last?.role === "assistant" &&
      !last.failed &&
      !last.stopped &&
      // A drawing's caption is four words under the picture everyone is
      // actually looking at — typing it out delays the row of actions for
      // nothing.
      !last.imageUrl
    ) {
      setLiveId(last.id);
    }
    wasThinking.current = thinking;
  }, [thinking, messages]);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const manualToggle = useRef(false);
 
  useEffect(() => {
    document.body.dataset.page = "orbit";
    return () => {
      delete document.body.dataset.page;
    };
  }, []);

  const dictationBase = useRef("");

  const onTranscript = useCallback(
    (text: string, final: boolean) => {
      const base = dictationBase.current;
      const joined = base && !base.endsWith(" ") ? `${base} ${text}` : base + text;
      if (final) dictationBase.current = joined;
      setInput(joined);
    },
    [setInput],
  );

  const speech = useSpeechInput({ onTranscript });

  const toggleDictation = () => {
 
    if (!speech.listening) dictationBase.current = input;
    speech.toggle();
  };

 
  const sendAndStop = (q?: string) => {
    if (speech.listening) speech.stop();
    dictationBase.current = "";
    manualToggle.current = false;
    send(q);
  };

  const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

  const acceptImage = (file: File | undefined | null) => {
    if (!file) return;
    setImageError(null);

    if (!file.type.startsWith("image/")) {
      setImageError("That isn't an image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("That image is too large — 6MB or smaller.");
      return;
    }
 
    setImageMode(false);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") attachImage(reader.result);
    };
    reader.onerror = () => setImageError("Couldn't read that image.");
    reader.readAsDataURL(file);
  };


  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file && SUPPORTED_DOCUMENT_MIME.has(file.type)) {
      acceptDocument(file);
    } else {
      acceptImage(file);
    }
    // Cleared so picking the same file twice in a row still fires onChange.
    e.currentTarget.value = "";
  };

  const onComposerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && SUPPORTED_DOCUMENT_MIME.has(file.type)) {
      acceptDocument(file);
    } else {
      acceptImage(file);
    }
  };

  const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;

  const SUPPORTED_DOCUMENT_MIME = new Set([
    "application/pdf",
    "text/csv",
    "application/vnd.ms-excel",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]);

  const acceptDocument = (file: File | undefined | null) => {
    if (!file) return;
    setDocumentError(null);

    if (!SUPPORTED_DOCUMENT_MIME.has(file.type)) {
      setDocumentError("That file type isn't supported — PDF, DOCX, CSV or plain text.");
      return;
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      setDocumentError("That file is too large — 5MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        attachDocument({ name: file.name, mime: file.type, data: reader.result });
      }
    };
    reader.onerror = () => setDocumentError("Couldn't read that file.");
    reader.readAsDataURL(file);
  };



  const toggleImageMode = () => {
    if (!imageMode && plan && !plan.imageGeneration) {
      notify.quotaLimit(
        "Drawing pictures is part of Orbit Pro.",
        { kind: "orbit_image_generation", plan: plan.name },
        "plan_required",
      );
      return;
    }
    manualToggle.current = true;
    setImageMode((v) => !v);
  };

  const onTextareaPaste = (e: React.ClipboardEvent) => {
    const file = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"));
    if (file) {
      setImageMode(false);
      acceptImage(file);
    }
  };

  const last = messages[messages.length - 1];

  const typing = liveId != null && last?.id === liveId;
  const followUps =
    last?.role === "assistant" && !last.failed && !last.stopped && !typing
      ? (last.suggestions ?? [])
      : [];


  const lastMessageId = useRef<string | null>(null);
  useEffect(() => {
    const newLastId = last?.id ?? null;
    if (newLastId !== lastMessageId.current) {
      lastMessageId.current = newLastId;
      bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, thinking, last]);

 
  useEffect(() => {
    if (!typing) return;
    const id = setInterval(() => {
      bottom.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }, 120);
    return () => clearInterval(id);
  }, [typing]);

  if (!available) {
    return (
      <AppShell>
        <Center h={320} px="md">
          <Stack gap={8} align="center" maw={420}>
            <OrbitMark size={44} />
            <Text size="sm" c="dimmed" ta="center" lh={1.6}>
              Orbit isn&apos;t set up on this server yet. Help &amp; support can still reach a
              person.
            </Text>
          </Stack>
        </Center>
      </AppShell>
    );
  }

  const empty = !input.trim() && !pendingImage && !pendingDocument;


  const composer = (
    <div className={classes.composerWrap}>
      <div className={classes.composer} onDragOver={(e) => e.preventDefault()} onDrop={onComposerDrop}>
        {pendingImage && (
          <div className={classes.imageChip}>
            <img src={pendingImage} alt="Attached" />
            <ActionIcon
              variant="subtle"
              color="gray"
              size="xs"
              radius="xl"
              onClick={() => attachImage(null)}
              aria-label="Remove attached image"
            >
              <X size={12} />
            </ActionIcon>
          </div>
        )}
        {pendingDocument && (
          <Group gap={6} wrap="nowrap" px="md" pt="sm">
            <FileText size={14} style={{ flexShrink: 0, color: "var(--mantine-color-dimmed)" }} />
            <Text size="xs" c="dimmed" truncate style={{ flex: 1 }}>
              {pendingDocument.name}
            </Text>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="xs"
              radius="xl"
              onClick={() => attachDocument(null)}
              aria-label="Remove attached file"
            >
              <X size={12} />
            </ActionIcon>
          </Group>
        )}
        <Textarea
          placeholder={
            speech.listening
              ? "Listening — speak your question"
              : imageMode
                ? "Describe what to draw"
                : pendingDocument
                  ? "Ask about this file"
                  : "Ask anything"
          }
          value={input}
          onChange={(e) => {
            const val = e.currentTarget.value;
            setInput(val);
            if (speech.listening) dictationBase.current = val;

            if (!manualToggle.current && !pendingImage && !pendingDocument && plan?.imageGeneration) {
              const match = DRAW_RE.test(val.trim());
              if (match && !imageMode) setImageMode(true);
            }
          }}

          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendAndStop();
            }
          }}
          onPaste={onTextareaPaste}
          variant="unstyled"
          autosize

          minRows={started ? 1 : 3}
          maxRows={started ? 8 : 10}
          px="md"
          pt="sm"
          disabled={thinking}
          data-autofocus

          styles={{
            input: {
              fontSize: 15,
              lineHeight: 1.6,
              background: "transparent",
              border: "none",
              boxShadow: "none",
            },
          }}
        />

        {imageError && (
          <Text size="10px" c="orange.5" px="md" pb={4}>
            {imageError}
          </Text>
        )}
        {documentError && (
          <Text size="10px" c="orange.5" px="md" pb={4}>
            {documentError}
          </Text>
        )}

        <div className={classes.composerFoot}>
          <Group gap={4} wrap="nowrap">

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.docx,.csv,.txt,application/pdf,text/csv,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              hidden
              onChange={onFilePicked}
            />
            <Tooltip label="Attach a file" withArrow>
              <ActionIcon
                variant="subtle"
                color="gray"
                radius="xl"
                size="md"
                disabled={thinking || imageMode || !!pendingImage || !!pendingDocument}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach a file"
              >
                <Paperclip size={15} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={imageMode ? "Cancel drawing" : "Draw a picture"} withArrow>
              <ActionIcon
                variant={imageMode ? "filled" : "subtle"}
                color={imageMode ? "emerald" : "gray"}
                radius="xl"
                size="md"
                disabled={thinking || !!pendingImage || !!pendingDocument}
                onClick={toggleImageMode}
                aria-label={imageMode ? "Cancel drawing" : "Draw a picture"}
                aria-pressed={imageMode}
              >
                <Palette size={15} />
              </ActionIcon>
            </Tooltip>
            {speech.supported && (
              <Tooltip
                label={speech.listening ? "Stop dictating" : "Dictate your question"}
                withArrow
              >
                <ActionIcon
                  variant={speech.listening ? "filled" : "subtle"}
                  color={speech.listening ? "red" : "gray"}
                  radius="xl"
                  size="md"
                  disabled={thinking}
                  onClick={toggleDictation}
                  aria-label={speech.listening ? "Stop dictating" : "Dictate your question"}
                  aria-pressed={speech.listening}
                >
                 
                  {speech.listening ? <Square size={12} /> : <Mic size={15} />}
                </ActionIcon>
              </Tooltip>
            )}
          </Group>

          <Group gap={4} wrap="nowrap">
        
            <Tooltip label={thinking ? "Stop" : "Send"} withArrow>
              <ActionIcon
                color={thinking ? "red" : "emerald"}
                radius="xl"
                size="lg"
                disabled={!thinking && empty}
                onClick={() => (thinking ? stop() : sendAndStop())}
                aria-label={thinking ? "Stop" : "Send"}
              >
                {thinking ? <Square size={12} fill="currentColor" /> : <ArrowUp size={16} />}
              </ActionIcon>
            </Tooltip>
          </Group>
        </div>
      </div>

      {noWorkspace && (
        <Alert
          color="red"
          variant="light"
          radius="md"
          icon={<FolderPlus size={16} />}
          mt={10}
        >
          <Group justify="space-between" wrap="nowrap" gap="md">
            <Text size="sm">
              Create a workspace to start asking Orbit about your data.
            </Text>
            <Button
              component={Link}
              to="/app/onboarding"
              size="xs"
              color="red"
              leftSection={<FolderPlus size={14} />}
            >
              Create workspace
            </Button>
          </Group>
        </Alert>
      )}


      <Text size="10px" c={speech.error ? "orange.5" : "dimmed"} ta="center" mt={8} lh={1.4}>
        {speech.error ?? "Orbit can't see your data and can be wrong."}
      </Text>
    </div>
  );

  return (
    <AppShell>
      <div className={classes.page}>
        <div className={classes.header}>
       
        {/* The mark alone — the rail row that got here already said the name,
            and the page it opens is only ever Orbit. The mark itself is
            decorative, so the heading carries the name for a screen reader. */}
        <span role="heading" aria-level={1} aria-label="Orbit AI" style={{ display: "inline-flex" }}>
          <OrbitMark size={26} />
        </span>

        <Group gap={2} wrap="nowrap">
          {/* A super-admin control, not a user preference — everyone else
              gets exactly the models `/status` sends them with nothing to
              pick between. See `showModelPicker` above. */}
          {showModelPicker && (
            <Menu position="bottom-end" radius="md" withinPortal zIndex={400}>
              <Menu.Target>
                <UnstyledButton
                  className="tile"
                  aria-label="Choose Orbit model"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "5px 8px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-2)",
                  }}
                >
                  {models.find((m) => m.id === model)?.label ?? "Model"}
                  <ChevronDown size={12} />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                {models.map((m) => (
                  <Menu.Item
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    rightSection={m.id === model && <Check size={14} />}
                  >
                    <Text size="sm" fw={600}>{m.label}</Text>
                    <Text size="xs" c="dimmed">{m.hint}</Text>
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          )}
          {/* "Start over" leaves the current thread rather than deleting it —
              it is saved, and the drawer is how you get back. */}
          {started && (
            <Tooltip label="Start over" withArrow>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="md"
                onClick={chat.reset}
                aria-label="Start over"
              >
                <RotateCcw size={15} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label="Conversations" withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="md"
              onClick={() => setHistoryOpen(true)}
              aria-label="Conversations"
            >
              <History size={16} />
            </ActionIcon>
          </Tooltip>
          {/* Placed by hand: Orbit's chat header is its own layout, not
              `PageHeader`, which carries the bell on every other screen. Sized
              to match the subtle/md icons already in this toolbar. */}
          <ActivityBellIcon variant="subtle" size="md" iconSize={16} />
        </Group>
      </div>

      <div className={classes.body} data-state={started ? "started" : "empty"}>
        {!started ? (
          <div className={classes.hero}>
            <div className={classes.heroHead}>
              <Title order={2} fw={500} className={classes.heroTitle}>
                How can Orbit help today?
              </Title>
            </div>
            {composer}


            {/*
              Faded in once, when every source behind the dynamic chips has
              settled. The row keeps its space while it waits, so the composer
              above it does not shift when the chips arrive.
            */}
            <div className={classes.starters} data-ready>
              {staticStarters.map((q) => (
                <UnstyledButton
                  key={q}
                  className={classes.starter}
                  onClick={() => sendAndStop(q)}
                >
                  <Text size="xs" lh={1.4}>
                    {q}
                  </Text>
                </UnstyledButton>
              ))}
            </div>
          </div>
        ) : (
          <>
            <ScrollArea
              className={classes.scroll}
              type="hover"
              scrollbarSize={7}
              onScrollPositionChange={({ y }) => {
                if (y < 80 && hasOlderMessages && !loadingOlderMessages) {
                  void loadOlderMessages();
                }
              }}
            >
              <div className={classes.column}>
                <Stack gap={26}>
                  {loadingOlderMessages && (
                    <Group justify="center" py={4}>
                      <Loader size={13} type="dots" color="var(--mantine-color-emerald-5)" />
                    </Group>
                  )}
                  {messages.map((m, i) => (
                    <Turn
                      key={m.id}
                      message={m}
                      isLast={i === messages.length - 1}
                      live={m.id === liveId}
                      onRevealed={() => setLiveId(null)}
                      onRegenerate={() => void regenerateLast()}
                      onEdit={(text) => void editAndResend(m.id, text)}
                      editable={!thinking}
                      regenerating={thinking}
                      speaking={tts.speakingId === m.id}
                      onToggleSpeech={
                        tts.supported ? () => tts.toggle(m.id, m.content) : undefined
                      }
                    />
                  ))}

                  {thinking && generatingImage && (
                    <Group gap={12} wrap="nowrap" align="flex-start">
                      <OrbitMark size={22} />
                      <div className={classes.generatingImage}>
                        <div className={classes.generatingImageSweep} />
                        <Palette size={20} className={classes.generatingImageIcon} />
                        <Text size="xs" fw={500} className={classes.generatingImageLabel}>
                          Painting
                        </Text>
                      </div>
                    </Group>
                  )}

                  {thinking && !generatingImage && (
                    <Group gap={12} wrap="nowrap">
                      <OrbitMark size={22} />
                      <Group gap={7} wrap="nowrap">
                        <Loader size={13} type="dots" color="var(--mantine-color-emerald-5)" />
                        <Text size="xs" c="emerald.4" fw={500} className="orbit-thinking">
                          Thinking
                        </Text>
                      </Group>
                    </Group>
                  )}

                  {!thinking && followUps.length > 0 && (
                    // Indented to the column the answers start at, so the
                    // follow-ups read as continuing the last one rather than as
                    // a new turn from somewhere else.
                    <div className={classes.followUps}>
                      {followUps.map((q) => (
                        <UnstyledButton
                          key={q}
                          className={classes.starter}
                          onClick={() => sendAndStop(q)}
                        >
                          <Text size="xs" lh={1.4}>
                            {q}
                          </Text>
                        </UnstyledButton>
                      ))}
                    </div>
                  )}

                  <div ref={bottom} />
                </Stack>
              </div>
            </ScrollArea>

            {composer}
          </>
        )}
      </div>

        <OrbitHistoryDrawer
          chat={chat}
          opened={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />
      </div>
    </AppShell>
  );
}
