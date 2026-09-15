import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActionIcon, Box, Center, Group, Loader, ScrollArea, Stack, Text, Textarea, Title,
  Tooltip, UnstyledButton,
} from "@mantine/core";
import {
  AlertTriangle, ArrowUp, Copy, Download, History, ImagePlus, Mic, Palette,
  Pencil, RefreshCw, RotateCcw, Share2, Square, X,
} from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { useSpeechInput } from "@/shared/hooks/useSpeechInput";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { RichText } from "@/features/orbit/components/RichText";
import { DataDigestTable } from "@/features/orbit/components/DataDigestTable";
import { useOrbit } from "@/features/orbit/components/OrbitProvider";
import { ORBIT_SUGGESTIONS, type OrbitMessage } from "@/features/orbit/useOrbitChat";
import { useTypewriter } from "@/features/orbit/useTypewriter";
import { OrbitHistoryDrawer } from "./OrbitHistoryDrawer";
import { notify } from "@/shared/lib/notify";
import classes from "./orbitPage.module.css";


async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    notify.success("Copied to clipboard");
  } catch {
    notify.error("Couldn't copy that.");
  }
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

/** A generated image, held back behind the skeleton until it has actually
 * decoded — otherwise the skeleton vanishes the instant the URL arrives and
 * the browser shows a blank gap while the bytes are still loading. */
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

/** Copy / share / regenerate, under an answered assistant turn. Regenerate
 * only on the last turn — see `regenerateLast`'s own note on why. */
function TurnActions({
  message,
  onRegenerate,
  regenerating,
}: {
  message: OrbitMessage;
  onRegenerate?: () => void;
  regenerating?: boolean;
}) {
  return (
    <Group gap={2} mt={6} wrap="nowrap">
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

/**
 * A question that was asked, with the pencil that lets it be asked again.
 *
 * The control is revealed on hover rather than sitting under every bubble:
 * editing is the rare case, and a row of buttons beside each of your own
 * questions makes a thread look like a form.
 */
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
    <Group justify="flex-end" wrap="nowrap" gap={4} className={classes.userTurnRow}>
      {editable && message.content && (
        <Tooltip label="Edit and re-ask" withArrow position="left">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            radius="xl"
            className={classes.userTurnEdit}
            onClick={begin}
            aria-label="Edit and re-ask"
          >
            <Pencil size={13} />
          </ActionIcon>
        </Tooltip>
      )}
      <Box className={classes.userTurn}>
        {message.imageUrl && (
          <img src={message.imageUrl} alt="Attached" className={classes.userTurnImage} />
        )}
        {message.content && (
          <Text size="sm" lh={1.6} style={{ whiteSpace: "pre-wrap" }}>
            {message.content}
          </Text>
        )}
      </Box>
    </Group>
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
}) {
  if (message.role === "user") {
    return <UserTurn message={message} onEdit={onEdit} editable={editable} />;
  }

  /*
   * A question that was stopped.
   *
   * Deliberately not the assistant bubble with the mark beside it: Orbit never
   * said anything here, and dressing our own note up as a turn from the
   * assistant is a small lie that makes the transcript untrustworthy. A quiet
   * line and the way back is all this needs.
   */
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
        {!live && <DataDigestTable digest={message.dataDigest} />}
        {!message.failed && !live && (
          <TurnActions
            message={message}
            onRegenerate={isLast ? onRegenerate : undefined}
            regenerating={regenerating}
          />
        )}
      </div>
    </Group>
  );
}

export default function Orbit() {
  // The page reads the provider's chat rather than calling the hook, so it is
  // the same conversation the bubble holds.
  const { chat } = useOrbit();
  const {
    messages, input, setInput, pendingImage, attachImage, imageMode, setImageMode,
    send, regenerateLast, editAndResend, stop, thinking, generatingImage,
    available, started, plan,
  } = chat;

 
  const [liveId, setLiveId] = useState<string | null>(null);
  const wasThinking = useRef(false);

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
  const bottom = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
 
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
    send(q);
  };

  /**
   * Read a dropped, pasted or picked file as the data URL the composer stages
   * and the server later validates for real. This check is a courtesy, not
   * the guard — the route rejects anything past its own size and type
   * ceiling regardless of what the browser let through.
   */
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

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") attachImage(reader.result);
    };
    reader.onerror = () => setImageError("Couldn't read that image.");
    reader.readAsDataURL(file);
  };

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptImage(e.currentTarget.files?.[0]);
    // Cleared so picking the same file twice in a row still fires onChange.
    e.currentTarget.value = "";
  };

  const onComposerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    acceptImage(e.dataTransfer.files?.[0]);
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
    setImageMode((v) => !v);
  };

  const onTextareaPaste = (e: React.ClipboardEvent) => {
    const file = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"));
    if (file) acceptImage(file);
  };

  const last = messages[messages.length - 1];

  const typing = liveId != null && last?.id === liveId;
  const followUps =
    last?.role === "assistant" && !last.failed && !last.stopped && !typing
      ? (last.suggestions ?? [])
      : [];

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

 
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

  const empty = !input.trim() && !pendingImage;


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
        <Textarea
          placeholder={
            speech.listening
              ? "Listening — speak your question"
              : imageMode
                ? "Describe what to draw"
                : "Ask anything"
          }
          value={input}
          onChange={(e) => {
            setInput(e.currentTarget.value);
            if (speech.listening) dictationBase.current = e.currentTarget.value;
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

        <div className={classes.composerFoot}>
          <Group gap={4} wrap="nowrap">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onFilePicked}
            />
            <Tooltip label="Attach an image" withArrow>
              <ActionIcon
                variant="subtle"
                color="gray"
                radius="xl"
                size="md"
                disabled={thinking || imageMode}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach an image"
              >
                <ImagePlus size={15} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={imageMode ? "Cancel drawing" : "Draw a picture"} withArrow>
              <ActionIcon
                variant={imageMode ? "filled" : "subtle"}
                color={imageMode ? "emerald" : "gray"}
                radius="xl"
                size="md"
                disabled={thinking || !!pendingImage}
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

 
      <Text size="10px" c={speech.error ? "orange.5" : "dimmed"} ta="center" mt={8} lh={1.4}>
        {speech.error ?? "Orbit can't see your data and can be wrong."}
      </Text>
    </div>
  );

  return (
    <AppShell>
      <div className={classes.page}>
        <div className={classes.header}>
       
        <Text size="sm" fw={650}>
          Orbit AI
        </Text>

        <Group gap={2} wrap="nowrap">
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


            <div className={classes.starters}>
              {ORBIT_SUGGESTIONS.map((q) => (
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
            <ScrollArea className={classes.scroll} type="hover" scrollbarSize={7}>
              <div className={classes.column}>
                <Stack gap={26}>
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
