import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal, Group, Button, Text, Box, Stack, CopyButton, ActionIcon, Tooltip,
  ScrollArea, Divider,
} from "@mantine/core";
import { siX, siWhatsapp, siFacebook, siTelegram } from "simple-icons";
import {
  Copy, Check, Download, X, Smile, List, ListOrdered, AtSign, RotateCcw, Link2,
  Monitor, Smartphone, Link as LinkIcon,
} from "lucide-react";
import { notify } from "@/shared/lib/notify";
import {
  renderShareCard, downloadShareCard, CARD_WIDTH, CARD_HEIGHT,
  type ShareCardStats,
} from "./shareCard";

/**
 * LinkedIn's mark, inline.
 *
 * simple-icons dropped it over trademark policy, so it is the one glyph we
 * carry ourselves rather than leaving the most-used tab without a logo.
 */
const LINKEDIN_ICON = {
  hex: "0A66C2",
  path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
};

/** The networks the composer can hand a post to. */
type PlatformId = "linkedin" | "facebook" | "twitter" | "whatsapp" | "telegram";

type Platform = {
  id: PlatformId;
  label: string;
  icon: { path: string; hex: string };
  /** Feed-composer character budget. `null` where there is no meaningful cap. */
  limit: number | null;
  /** Hashtag budget for the counter, where the network publishes one. */
  hashtagLimit: number | null;
  /**
   * Build the share-intent URL.
   *
   * LinkedIn and Facebook are the odd ones out: their composers ignore any
   * prefilled text and build the post from the link's own Open Graph tags, so
   * the caption is copied to the clipboard for pasting — see `needsPaste`.
   */
  intent: (caption: string, url: string) => string;
  needsPaste?: boolean;
};

const PLATFORMS: Platform[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: LINKEDIN_ICON,
    limit: 3000,
    hashtagLimit: 30,
    intent: (_c, url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    needsPaste: true,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: siFacebook,
    limit: 63206,
    hashtagLimit: null,
    intent: (_c, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    needsPaste: true,
  },
  {
    id: "twitter",
    label: "X",
    icon: siX,
    limit: 280,
    hashtagLimit: null,
    intent: (c, url) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(c)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: siWhatsapp,
    limit: null,
    hashtagLimit: null,
    intent: (c, url) => `https://wa.me/?text=${encodeURIComponent(`${c}\n\n${url}`)}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: siTelegram,
    limit: null,
    hashtagLimit: null,
    intent: (c, url) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(c)}`,
  },
];

function PlatformGlyph({ icon, size = 16 }: { icon: { path: string; hex: string }; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ display: "block", flexShrink: 0 }} aria-hidden="true">
      <path d={icon.path} />
    </svg>
  );
}

const HASHTAG = /#[\p{L}\p{N}_]+/gu;
const URL_IN_TEXT = /https?:\/\/\S+/g;

function countHashtags(text: string): number {
  return (text.match(HASHTAG) ?? []).length;
}

/**
 * The caption editor.
 *
 * A `contentEditable` surface rather than a textarea, because the design calls
 * for the link and hashtags to be styled inside the field as they are typed —
 * something a textarea cannot do at all.
 *
 * The value stays plain text throughout: `innerText` in, highlighted spans out.
 * Nothing but text is ever read back, so a paste carrying markup contributes
 * only its words, and what is posted is exactly what is displayed.
 */
function CaptionEditor({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // The editor owns the DOM while it has focus. Writing highlighted HTML back
  // into it on every keystroke would collapse the caret to the start on each
  // character, so re-rendering is limited to changes that came from elsewhere —
  // a reset, or the modal reopening.
  const lastRendered = useRef<string>("");

  useEffect(() => {
    const el = ref.current;
    if (!el || value === lastRendered.current) return;
    if (document.activeElement === el) return;
    el.innerHTML = highlight(value);
    lastRendered.current = value;
  }, [value]);

  /** Escape, then wrap URLs and hashtags. Order matters — escape first. */
  function highlight(text: string): string {
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return escaped
      .replace(URL_IN_TEXT, (m) => `<span class="caption-link">${m}</span>`)
      .replace(HASHTAG, (m) => `<span class="caption-tag">${m}</span>`);
  }

  const read = () => {
    const el = ref.current;
    if (!el) return;
    // `innerText` rather than `textContent`: it honours the line breaks the
    // browser inserted as <div>/<br>, which is what the user sees and what the
    // post should carry.
    const text = el.innerText.replace(/ /g, " ");
    lastRendered.current = text;
    onChange(text);
  };

  return (
    <div
      ref={ref}
      role="textbox"
      aria-multiline="true"
      aria-label={ariaLabel}
      contentEditable
      suppressContentEditableWarning
      onInput={read}
      // Re-highlight once the caret leaves, so a URL typed mid-session picks up
      // its styling without fighting the cursor while it is being typed.
      onBlur={() => {
        const el = ref.current;
        if (!el) return;
        el.innerHTML = highlight(el.innerText.replace(/ /g, " "));
      }}
      onPaste={(e) => {
        // Plain text only. A caption pasted from a rich source would otherwise
        // arrive with fonts and colours that no network will honour.
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      }}
      className="caption-editor"
    />
  );
}

/**
 * Formatting actions for the caption.
 *
 * Every one of these is a plain-text edit — networks do not accept markup, so
 * "bullet list" means the `•` character, not a `<ul>`. They act on the value
 * rather than the selection, which keeps the editor's plain-text contract
 * intact.
 */
function CaptionToolbar({
  onInsert,
  onUndo,
  canUndo,
}: {
  onInsert: (fragment: string, opts?: { line?: boolean }) => void;
  onUndo: () => void;
  canUndo: boolean;
}) {
  const { t } = useTranslation();

  const items: { icon: typeof Smile; label: string; run: () => void; disabled?: boolean }[] = [
    { icon: Smile, label: t("sharePost.tool.emoji"), run: () => onInsert("🚀") },
    { icon: List, label: t("sharePost.tool.bullets"), run: () => onInsert("• ", { line: true }) },
    { icon: ListOrdered, label: t("sharePost.tool.numbers"), run: () => onInsert("1. ", { line: true }) },
    { icon: AtSign, label: t("sharePost.tool.mention"), run: () => onInsert("@") },
    { icon: RotateCcw, label: t("sharePost.tool.undo"), run: onUndo, disabled: !canUndo },
    { icon: Link2, label: t("sharePost.tool.link"), run: () => onInsert("#Quantalog") },
  ];

  return (
    <Group gap={2} px={6} py={4} style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
      {items.map((item) => (
        <Tooltip key={item.label} label={item.label} withArrow openDelay={400}>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="md"
            onClick={item.run}
            disabled={item.disabled}
            aria-label={item.label}
          >
            <item.icon size={16} />
          </ActionIcon>
        </Tooltip>
      ))}
    </Group>
  );
}

/**
 * The mock's own palette.
 *
 * Fixed light values rather than theme tokens: this is a picture of a social
 * network, and every one of them is a light UI. Following our dark theme here
 * would produce a preview that looks nothing like where the post is going.
 */
const MOCK = {
  page: "#f0f2f5",
  card: "#ffffff",
  line: "#e4e6eb",
  bar: "#e4e6eb",
  barSoft: "#eceef1",
  text: "#0f1419",
  dim: "#65676b",
};

/**
 * A grey placeholder bar. The mock's only building block.
 *
 * A number is a percentage — rail bars are sized relative to their column so
 * they reflow with the pane. A string is passed through, for the few places
 * that need a fixed pixel width inside a flex row.
 */
function Bar({ w, h = 8, r = 4, c = MOCK.bar }: { w: number | string; h?: number; r?: number; c?: string }) {
  return <Box style={{ width: typeof w === "number" ? `${w}%` : w, height: h, borderRadius: r, background: c, flexShrink: 0 }} />;
}

/** A rail row: round avatar plus a line or two of bars, as a feed sidebar has. */
function RailRow({ lines }: { lines: number[] }) {
  return (
    <Group gap={8} wrap="nowrap" align="center">
      <Box style={{ width: 20, height: 20, borderRadius: "50%", background: MOCK.bar, flexShrink: 0 }} />
      <Stack gap={5} style={{ flex: 1, minWidth: 0 }}>
        {lines.map((w, i) => <Bar key={i} w={w} h={7} c={i ? MOCK.barSoft : MOCK.bar} />)}
      </Stack>
    </Group>
  );
}

/** A boxed rail card of bars, as the right-hand column of a feed carries. */
function RailCard({ lines }: { lines: number[] }) {
  return (
    <Stack gap={9} p={10} style={{ background: MOCK.card, borderRadius: 8, border: `1px solid ${MOCK.line}` }}>
      {lines.map((w, i) => <Bar key={i} w={w} h={7} c={i ? MOCK.barSoft : MOCK.bar} />)}
    </Stack>
  );
}

/**
 * The post as it will appear in a feed, inside a browser-chrome mock.
 *
 * Chrome only — the rails either side are grey blocks. A faithful clone of each
 * network's UI would be both a trademark problem and a maintenance treadmill;
 * what the user needs to see is where their caption folds and how the card
 * crops.
 */
function FeedPreview({
  workspace,
  caption,
  image,
  url,
  platform,
  device,
}: {
  workspace: string;
  caption: string;
  image: string;
  url: string;
  platform: Platform;
  device: "desktop" | "mobile";
}) {
  const { t } = useTranslation();
  const mobile = device === "mobile";
  // Feeds collapse long captions behind a "…more" fold. Showing the fold is the
  // point of the preview — it decides whether the first lines carry the message.
  const FOLD = mobile ? 120 : 165;
  const folded = caption.length > FOLD;
  const shown = folded ? caption.slice(0, FOLD) : caption;

  /** The post card itself — the only part of the mock carrying real content. */
  const post = (
    <Box style={{ background: MOCK.card, border: `1px solid ${MOCK.line}`, borderRadius: 8, overflow: "hidden" }}>
      <Group gap={9} px={12} pt={12} pb={8} wrap="nowrap" align="flex-start">
        <Box
          style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #34d399, #059669)",
            display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 15,
          }}
        >
          {(workspace || "?").slice(0, 1).toUpperCase()}
        </Box>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Text size="sm" fw={700} c={MOCK.text} truncate>{workspace}</Text>
          <Text size="11px" c={MOCK.dim} truncate>{t("sharePost.previewBio")}</Text>
          <Text size="11px" c={MOCK.dim}>{t("sharePost.previewNow")} • 🌐</Text>
        </div>
        <Text size="sm" c={MOCK.dim} style={{ letterSpacing: 1 }}>•••</Text>
      </Group>

      <Box px={12} pb={10}>
        <Text size="13px" c={MOCK.text} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.45 }}>
          {shown}
          {folded && <Text span size="13px" c={MOCK.dim}>…{t("sharePost.previewMore")}</Text>}
        </Text>
      </Box>

      {image && (
        <img src={image} alt="" style={{ display: "block", width: "100%", aspectRatio: `${CARD_WIDTH} / ${CARD_HEIGHT}` }} />
      )}

      {/* Reaction strip, so the card ends the way a real post does. */}
      <Group justify="space-between" px={12} py={8} wrap="nowrap" style={{ borderTop: `1px solid ${MOCK.line}` }}>
        <Group gap={4} wrap="nowrap">
          {["#1877f2", "#f0284a", "#f7b125"].map((c) => (
            <Box key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c, border: "2px solid #fff", marginRight: -5 }} />
          ))}
        </Group>
        <Group gap={10} wrap="nowrap">
          <Bar w="64px" h={7} /><Bar w="64px" h={7} />
        </Group>
      </Group>
    </Box>
  );

  return (
    <Box
      style={{
        // A window, not a wall: the mock keeps a browser's proportions and sits
        // centred in the pane rather than stretching to fill it.
        width: "100%",
        maxWidth: mobile ? 420 : 860,
        margin: "0 auto",
        borderRadius: 12,
        overflow: "hidden",
        background: MOCK.page,
        boxShadow: "0 30px 70px rgba(0,0,0,0.45)",
      }}
    >
      {/* Browser chrome: traffic lights and the address pill. */}
      <Group gap={6} px={12} py={10} wrap="nowrap" style={{ background: "#2b2d31" }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <Box key={c} w={11} h={11} style={{ borderRadius: "50%", background: c }} />
        ))}
        <Box style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Box style={{ width: "58%", borderRadius: 6, background: "#404349", padding: "3px 12px" }}>
            <Text size="10px" c="#c9ccd1" ta="center" truncate>
              {url.replace(/^https?:\/\//, "")}
            </Text>
          </Box>
        </Box>
        <Box w={33} />
      </Group>

      {/* Network chrome: the platform mark, a search pill and nav placeholders. */}
      <Group px={12} py={7} gap={10} wrap="nowrap" style={{ background: MOCK.card, borderBottom: `1px solid ${MOCK.line}` }}>
        <Box style={{ color: `#${platform.icon.hex}`, flexShrink: 0 }}>
          <PlatformGlyph icon={platform.icon} size={22} />
        </Box>
        {!mobile && (
          <Box style={{ width: 150, height: 22, borderRadius: 11, background: MOCK.page, flexShrink: 0 }} />
        )}
        {/* On mobile the nav collapses to a search field and one avatar, which
            is what these apps actually show at that width. */}
        {mobile ? (
          <>
            <Box style={{ flex: 1, height: 22, borderRadius: 11, background: MOCK.page }} />
            <Box style={{ width: 22, height: 22, borderRadius: "50%", background: MOCK.bar, flexShrink: 0 }} />
          </>
        ) : (
          <>
            <Group gap={22} justify="center" wrap="nowrap" style={{ flex: 1 }}>
              {[0, 1, 2, 3].map((i) => (
                <Box
                  key={i}
                  style={{
                    width: 26, height: 12, borderRadius: 3, background: MOCK.bar,
                    // The first nav item reads as the active tab, which gives
                    // the strip its "you are in the feed" shape.
                    borderBottom: i === 0 ? `3px solid #${platform.icon.hex}` : "none",
                    paddingBottom: i === 0 ? 6 : 0,
                  }}
                />
              ))}
            </Group>
            <Group gap={6} wrap="nowrap">
              {[0, 1, 2].map((i) => (
                <Box key={i} style={{ width: 20, height: 20, borderRadius: "50%", background: MOCK.bar }} />
              ))}
            </Group>
          </>
        )}
      </Group>

      {/* The feed: rails either side of the post on desktop, post alone on mobile. */}
      <Box p={mobile ? 10 : 14} style={{ background: MOCK.page }}>
        {mobile ? (
          post
        ) : (
          <Group align="flex-start" gap={14} wrap="nowrap">
            <Stack gap={13} style={{ flex: "0 0 21%", minWidth: 0 }}>
              {[[85], [70], [90], [62], [78], [55], [82], [68]].map((lines, i) => (
                <RailRow key={i} lines={lines} />
              ))}
            </Stack>

            <Box style={{ flex: "1 1 auto", minWidth: 0 }}>{post}</Box>

            <Stack gap={12} style={{ flex: "0 0 21%", minWidth: 0 }}>
              <RailCard lines={[90, 60]} />
              <RailCard lines={[75, 88, 55]} />
              <RailCard lines={[80, 65]} />
            </Stack>
          </Group>
        )}
      </Box>

      {/* Bottom status strip — the chat bar every desktop feed ends with. */}
      {!mobile && (
        <Group px={12} py={7} gap={8} wrap="nowrap" style={{ background: MOCK.card, borderTop: `1px solid ${MOCK.line}` }}>
          <Group gap={0} wrap="nowrap">
            {["#34d399", "#60a5fa", "#f59e0b"].map((c) => (
              <Box key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c, marginRight: -4, border: "2px solid #fff" }} />
            ))}
          </Group>
          <Bar w="70px" h={9} />
          <Box style={{ flex: 1 }} />
          <Bar w="90px" h={9} c={MOCK.barSoft} />
          <Bar w="70px" h={9} c={MOCK.barSoft} />
        </Group>
      )}
    </Box>
  );
}

export function SharePostModal({
  opened,
  onClose,
  workspace,
  url,
  stats,
  rangeLabel,
}: {
  opened: boolean;
  onClose: () => void;
  workspace: string;
  /** The public dashboard link. Always present — the modal only opens when live. */
  url: string;
  /** Figures for the card. A null tile is simply left off. */
  stats: ShareCardStats;
  rangeLabel: string;
}) {
  const { t } = useTranslation();
  const [platform, setPlatform] = useState<PlatformId>("linkedin");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const active = PLATFORMS.find((p) => p.id === platform) ?? PLATFORMS[0];

  const defaultCaption = useMemo(
    () => t("sharePost.defaultCaption", { workspace, url }),
    [t, workspace, url],
  );

  // `null` means "following the default", so switching workspace or interface
  // language updates the caption while an edited one is left alone.
  const [draft, setDraft] = useState<string | null>(null);
  const caption = draft ?? defaultCaption;

  // One step of undo, which is what the toolbar's arrow offers. A full history
  // stack is the browser's job in a real editor; here every action is a small
  // insertion and stepping back once covers the mistake people actually make.
  const undoTo = useRef<string | null>(null);

  const setCaption = (next: string, remember = true) => {
    if (remember) undoTo.current = caption;
    setDraft(next);
  };

  // Re-render the card whenever anything on it changes. Cheap and synchronous —
  // see the note in `shareCard`.
  const image = useMemo(
    () =>
      renderShareCard({
        workspace,
        url,
        rangeLabel,
        stats,
        labels: {
          visitors: t("sharePost.cardVisitors"),
          pageviews: t("sharePost.cardPageviews"),
          live: t("sharePost.cardLive"),
          badge: t("sharePost.cardBadge"),
        },
      }),
    [workspace, url, rangeLabel, stats, t],
  );

  // Reset when it closes, so reopening does not resume a half-written post
  // about a workspace the user has since switched away from.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !opened) {
      setDraft(null);
      setPlatform("linkedin");
      setDevice("desktop");
      undoTo.current = null;
    }
    wasOpen.current = opened;
  }, [opened]);

  const chars = caption.length;
  const tags = countHashtags(caption);
  const overLimit = active.limit !== null && chars > active.limit;

  /**
   * Append a fragment. `line` puts it at the start of its own line, which is
   * what a list marker needs; everything else lands at the end of the caption.
   */
  const insert = (fragment: string, opts?: { line?: boolean }) => {
    const base = caption.replace(/\s+$/, "");
    setCaption(opts?.line ? `${base}\n${fragment}` : `${base} ${fragment}`);
  };

  const share = async () => {
    // Platforms that drop the caption get it on the clipboard first, so the
    // paste is one keystroke away in the composer that is about to open.
    if (active.needsPaste) {
      try {
        await navigator.clipboard.writeText(caption);
        notify.success(t("sharePost.pasteBody"), t("sharePost.pasteTitle"));
      } catch {
        // Clipboard denied — the composer still opens and the caption is right
        // here to copy by hand.
      }
    }
    window.open(active.intent(caption, url), "_blank", "noopener,noreferrer");
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      withCloseButton={false}
      padding={0}
      transitionProps={{ transition: "fade", duration: 150 }}
      styles={{
        content: { display: "flex", flexDirection: "column", border: "none" },
        body: { flex: 1, minHeight: 0, overflow: "hidden" },
      }}
    >
      <Group h="100%" gap={0} align="stretch" wrap="nowrap" className="share-post-shell">
        {/* ---- Composer ---- */}
        <Box className="share-post-composer">
          <Group className="share-post-row" gap="sm" py="md" wrap="nowrap" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
            <ActionIcon variant="subtle" color="gray" size="lg" onClick={onClose} aria-label={t("sharePost.close")}>
              <X size={18} />
            </ActionIcon>
            <Divider orientation="vertical" my={6} />
            <Text fw={600}>{t("sharePost.title")}</Text>
          </Group>

          {/* Platform tabs — hand-rolled rather than Mantine's, so the active
              underline can carry the network's own brand colour. */}
          <Group className="share-post-row share-post-tabs" gap={0} wrap="nowrap" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
            {PLATFORMS.map((p) => {
              const on = p.id === platform;
              return (
                <Box
                  key={p.id}
                  component="button"
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  aria-current={on}
                  className="share-post-tab"
                  style={{
                    color: on ? `#${p.icon.hex}` : "var(--mantine-color-dimmed)",
                    borderBottomColor: on ? `#${p.icon.hex}` : "transparent",
                    fontWeight: on ? 600 : 500,
                  }}
                >
                  <PlatformGlyph icon={p.icon} />
                  {p.label}
                </Box>
              );
            })}
          </Group>

          <ScrollArea style={{ flex: 1 }} type="auto">
            <Box className="share-post-body">
              <Text size="sm" fw={600} mb={8}>{t("sharePost.caption")}</Text>

              <Box
                style={{
                  border: `1px solid ${overLimit ? "var(--mantine-color-red-5)" : "var(--mantine-color-default-border)"}`,
                  borderRadius: "var(--mantine-radius-md)",
                  overflow: "hidden",
                }}
              >
                <CaptionToolbar
                  onInsert={insert}
                  onUndo={() => {
                    if (undoTo.current === null) return;
                    setCaption(undoTo.current, false);
                    undoTo.current = null;
                  }}
                  canUndo={undoTo.current !== null}
                />
                <CaptionEditor
                  value={caption}
                  onChange={(next) => setCaption(next, false)}
                  ariaLabel={t("sharePost.caption")}
                />
              </Box>

              <Group justify="space-between" mt={8} wrap="nowrap">
                <Text size="xs" c={overLimit ? "red" : "dimmed"}>
                  {active.limit === null
                    ? t("sharePost.chars", { count: chars })
                    : t("sharePost.charsOf", { count: chars, limit: active.limit.toLocaleString() })}
                </Text>
                {active.hashtagLimit !== null && (
                  <Text size="xs" c={tags > active.hashtagLimit ? "red" : "dimmed"}>
                    {t("sharePost.hashtags", { count: tags, limit: active.hashtagLimit })}
                  </Text>
                )}
              </Group>

              <Group grow mt="md" gap="sm">
                <Button
                  variant="default"
                  leftSection={<RotateCcw size={15} />}
                  disabled={caption === defaultCaption}
                  onClick={() => { setDraft(null); undoTo.current = null; }}
                >
                  {t("sharePost.reset")}
                </Button>
                <CopyButton value={caption}>
                  {({ copied, copy }) => (
                    <Button
                      variant="default"
                      onClick={copy}
                      leftSection={copied ? <Check size={15} /> : <Copy size={15} />}
                    >
                      {copied ? t("sharePost.copied") : t("sharePost.copyCaption")}
                    </Button>
                  )}
                </CopyButton>
              </Group>

              <Text size="sm" fw={600} mt="xl" mb={8}>{t("sharePost.postImage")}</Text>
              <Box
                style={{
                  width: 260,
                  borderRadius: "var(--mantine-radius-md)",
                  overflow: "hidden",
                  border: "1px solid var(--mantine-color-default-border)",
                }}
              >
                <img src={image} alt="" style={{ display: "block", width: "100%" }} />
              </Box>

              {/* Sized to the thumbnail above it rather than the panel: the
                  button acts on that image, and stretching it the full width
                  detaches it from the thing it belongs to. */}
              <Button
                w={260}
                variant="default"
                mt="sm"
                leftSection={<Download size={15} />}
                onClick={() => downloadShareCard(image, workspace)}
              >
                {t("sharePost.downloadImage")}
              </Button>

              {active.needsPaste && (
                <Text size="xs" c="dimmed" mt="md">
                  {t("sharePost.pasteHint", { platform: active.label })}
                </Text>
              )}
            </Box>
          </ScrollArea>

          {/* Action bar, pinned so it stays reachable however long the caption. */}
          <Group
            className="share-post-row"
            justify="space-between"
            py="md"
            wrap="nowrap"
            style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
          >
            <CopyButton value={url}>
              {({ copied, copy }) => (
                <Button
                  variant="subtle"
                  color="gray"
                  onClick={copy}
                  leftSection={copied ? <Check size={15} /> : <LinkIcon size={15} />}
                >
                  {copied ? t("sharePost.copied") : t("sharePost.copyLink")}
                </Button>
              )}
            </CopyButton>
            <Group gap="sm" wrap="nowrap">
              <Button variant="default" onClick={onClose}>
                {t("sharePost.later")}
              </Button>
              <Button
                onClick={share}
                disabled={overLimit}
                radius="xl"
                leftSection={<PlatformGlyph icon={active.icon} />}
                style={{ background: `#${active.icon.hex}`, color: "#fff" }}
              >
                {t("sharePost.shareOn", { platform: active.label })}
              </Button>
            </Group>
          </Group>
        </Box>

        {/* ---- Preview ---- */}
        <Box className="share-post-preview">
          <Group justify="space-between" align="center" mb="xl" wrap="nowrap">
            <Text fw={700} size="lg">{t("sharePost.preview")}</Text>
            <Group gap={4} p={4} style={{ background: "var(--mantine-color-default)", borderRadius: "var(--mantine-radius-md)" }}>
              {([
                { id: "desktop" as const, Icon: Monitor },
                { id: "mobile" as const, Icon: Smartphone },
              ]).map(({ id, Icon }) => (
                <ActionIcon
                  key={id}
                  variant={device === id ? "white" : "subtle"}
                  color={device === id ? "dark" : "gray"}
                  size="lg"
                  radius="sm"
                  onClick={() => setDevice(id)}
                  aria-label={t(`sharePost.preview_${id}`)}
                  aria-pressed={device === id}
                >
                  <Icon size={17} />
                </ActionIcon>
              ))}
            </Group>
          </Group>

          <Box style={{ flex: 1, display: "flex", alignItems: "center", minHeight: 0 }}>
            <Box w="100%">
              <FeedPreview
                workspace={workspace}
                caption={caption}
                image={image}
                url={url}
                platform={active}
                device={device}
              />
            </Box>
          </Box>
        </Box>
      </Group>
    </Modal>
  );
}
