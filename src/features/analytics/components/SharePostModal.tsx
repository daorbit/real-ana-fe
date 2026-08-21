import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal, Group, Button, Text, Box, CopyButton, ActionIcon, Tooltip,
  Divider, Anchor, TextInput,
} from "@mantine/core";
import {
  Copy, Check, Download, X, RotateCcw, ExternalLink,
  Monitor, Smartphone, Link as LinkIcon, PenLine,
} from "lucide-react";
import { notify, errMessage } from "@/shared/lib/notify";
import {
  useWriteShareCaptionMutation,
  useGetLinkedInStatusQuery,
  usePostToLinkedInMutation,
} from "@/app/store";
import {
  renderShareCard, downloadShareCard,
  type ShareCardStats,
} from "./shareCard";
import {
  CaptionEditor, CaptionToolbar, countHashtags,
  type CaptionEditorHandle,
} from "@/shared/components/CaptionEditor";
import { PLATFORMS, VISIBLE_PLATFORMS, PlatformGlyph, copyText, type PlatformId } from "./sharePlatforms";
import { FeedPreview } from "./FeedPreview";
import { LinkedInConnection } from "./LinkedInConnection";

export function SharePostModal({
  opened,
  onClose,
  workspaceId,
  workspace,
  url,
  shareUrl,
  stats,
  rangeLabel,
}: {
  opened: boolean;
  onClose: () => void;
  workspaceId: string;
  workspace: string;
  /** The public dashboard link. Always present — the modal only opens when live. */
  url: string;
  /**
   * The link handed to the networks.
   *
   * Points at the API's preview route rather than the dashboard itself: a
   * scraper does not run our JavaScript, so only a server-rendered page can
   * give it tags for *this* workspace. Anyone who clicks is redirected on to
   * `url`, so the two are the same destination by different doors.
   */
  shareUrl: string;
  /** Figures for the card. A null tile is simply left off. */
  stats: ShareCardStats;
  rangeLabel: string;
}) {
  const { t } = useTranslation();
  const [platform, setPlatform] = useState<PlatformId>("linkedin");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [writeCaption, { isLoading: writing }] = useWriteShareCaptionMutation();
  const [postToLinkedIn, { isLoading: posting }] = usePostToLinkedInMutation();
  // The permalink of the post just published, so the panel can link to it.
  const [postedUrl, setPostedUrl] = useState<string | null>(null);
  const [justPosted, setJustPosted] = useState(false);
  // Read here as well as inside the connection panel: RTK Query serves both
  // from one cache entry, so this is the same request, not a second one.
  const { data: linkedInStatus } = useGetLinkedInStatusQuery();
  // Whether the caption on screen came from Orbit. Drives the button's label,
  // and the note under the editor that says so plainly.
  const [written, setWritten] = useState(false);
  // An optional steer for Orbit. Empty means "write about this dashboard",
  // which is what this panel is for; filled, it writes to that angle instead.
  const [angle, setAngle] = useState("");

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
  // The editor's imperative actions, which the toolbar drives — inserting at
  // the caret rather than appending, now that the two panels share one editor.
  const editorRef = useRef<CaptionEditorHandle | null>(null);

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
      setWritten(false);
      // Or reopening would report the previous post as just published.
      setJustPosted(false);
      setPostedUrl(null);
      undoTo.current = null;
    }
    wasOpen.current = opened;
  }, [opened]);

  const chars = caption.length;
  const tags = countHashtags(caption);
  const overLimit = active.limit !== null && chars > active.limit;

  /**
   * Whether the intent-URL share path must not run.
   *
   * True only on the LinkedIn tab without a usable connection. LinkedIn no
   * longer offers that button at all — it publishes through the panel above —
   * so this is the guard that keeps the handler honest if it is ever reached
   * another way. The other four networks share through a public intent URL,
   * need no account of ours, and are unaffected.
   */
  const linkedInReady = Boolean(
    linkedInStatus?.connected && !linkedInStatus.expired && linkedInStatus.canPublish !== false,
  );
  const blockedOnLinkedIn = platform === "linkedin" && !linkedInReady;

  /**
   * Replace the caption with one written for the selected platform.
   *
   * The previous caption goes on the undo step, so a generated one someone
   * dislikes is a single click away from being taken back — this overwrites
   * work, unlike every other toolbar action.
   */
  const generate = async () => {
    try {
      // An empty angle keeps the original behaviour: a caption about this
      // workspace's own dashboard, built from figures the server reads itself.
      // Given one, Orbit writes about that instead — the link and image on this
      // panel are unchanged either way.
      const res = await writeCaption({
        workspaceId,
        platform,
        ...(angle.trim() ? { topic: angle.trim() } : {}),
      }).unwrap();
      undoTo.current = caption;
      setDraft(res.caption);
      setWritten(true);
    } catch (e) {
      notify.error(errMessage(e, t("sharePost.writeError")));
    }
  };

  /** Publish through our own LinkedIn connection. */
  const runLinkedInPost = async () => {
    setJustPosted(false);
    setPostedUrl(null);
    try {
      const res = await postToLinkedIn({ caption, image }).unwrap();
      setPostedUrl(res.postUrl);
      setJustPosted(true);
      notify.success(t("sharePost.linkedinPosted"));
    } catch (e) {
      notify.error(errMessage(e, t("sharePost.linkedinPostError")));
    }
  };

  const share = () => {
    // Belt and braces with the disabled button above: LinkedIn now publishes
    // through our own connection, so the intent fallback must not run for it
    // while that connection is missing.
    if (blockedOnLinkedIn) return;
    // Platforms that drop the caption get it on the clipboard first, so the
    // paste is one keystroke away in the composer that is about to open.
    //
    // Both halves run synchronously inside the click. Awaiting the clipboard
    // before opening the window cost us both: the write outlived the user
    // gesture that authorised it, and the popup blocker took the window
    // because it no longer looked like a click had opened it.
    if (active.needsPaste) {
      const copied = copyText(caption);
      notify[copied ? "success" : "error"](
        copied ? t("sharePost.pasteBody") : t("sharePost.pasteFailed"),
        copied ? t("sharePost.pasteTitle") : t("sharePost.pasteFailedTitle"),
      );
    }
    // The intent carries the preview URL so the network scrapes tags for this
    // workspace; the caption keeps the readable dashboard link.
    window.open(active.intent(caption, shareUrl), "_blank", "noopener,noreferrer");
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
          <Group gap="sm" px={20} py="md" wrap="nowrap" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
            <ActionIcon variant="subtle" color="gray" size="lg" onClick={onClose} aria-label={t("sharePost.close")}>
              <X size={18} />
            </ActionIcon>
            <Divider orientation="vertical" my={6} />
            <Text fw={600}>{t("sharePost.title")}</Text>
          </Group>

          {/* Platform tabs — hand-rolled rather than Mantine's, so the active
              underline can carry the network's own brand colour. */}
          <Group className="share-post-row share-post-tabs" gap={0} wrap="nowrap" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
            {VISIBLE_PLATFORMS.map((p) => {
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

          {/* Native overflow, so this column carries the app's own thin
              scrollbar rather than Mantine's overlay one. */}
          <Box style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            {/* The link tab shares a URL, not a post: no caption, no card, no
                network. Giving it the composer would put an editor on screen
                whose text nothing would ever publish. */}
            {platform === "link" ? (
              <Box className="share-post-body">
                <Text size="sm" fw={600} mb={8}>{t("sharePost.publicLink")}</Text>
                <Text size="xs" c="dimmed" mb="md" style={{ lineHeight: 1.5 }}>
                  {t("sharePost.publicLinkHint")}
                </Text>

                <Box
                  p="sm"
                  style={{
                    border: "1px solid var(--mantine-color-default-border)",
                    borderRadius: "var(--mantine-radius-md)",
                    background: "var(--mantine-color-default)",
                  }}
                >
                  <Text
                    size="sm"
                    style={{ wordBreak: "break-all", fontFamily: "var(--mantine-font-family-monospace)" }}
                  >
                    {url}
                  </Text>
                </Box>

                <Group mt="sm" gap="sm">
                  <CopyButton value={url}>
                    {({ copied, copy }) => (
                      <Button
                        variant={copied ? "light" : "filled"}
                        color={copied ? "teal" : undefined}
                        onClick={copy}
                        leftSection={copied ? <Check size={15} /> : <Copy size={15} />}
                      >
                        {copied ? t("sharePost.copied") : t("sharePost.copyLink")}
                      </Button>
                    )}
                  </CopyButton>
                  <Button
                    variant="default"
                    leftSection={<ExternalLink size={15} />}
                    onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                  >
                    {t("sharePost.openLink")}
                  </Button>
                </Group>
              </Box>
            ) : (
            <Box className="share-post-body">
              <Group justify="space-between" align="center" mb={8} wrap="nowrap">
                <Text size="sm" fw={600}>{t("sharePost.caption")}</Text>
                {/* Named rather than a bare "Write for me": the caption goes out
                    under the user's own name, so who wrote it — and that it
                    costs an Orbit question — should be legible before the
                    click, not discovered after it. */}
                <Tooltip
                  label={t("sharePost.writeTooltip", { platform: active.label })}
                  withArrow
                  multiline
                  w={260}
                  openDelay={300}
                >
                  <Button
                    size="compact-sm"
                    variant="light"
                    color="emerald"
                    loading={writing}
                    onClick={generate}
                    leftSection={<PenLine size={14} />}
                  >
                    {written ? t("sharePost.writeAgain") : t("sharePost.write")}
                  </Button>
                </Tooltip>
              </Group>

              {/* Optional, and says so: left empty this panel writes about the
                  dashboard it is sharing, which is the normal case. Filling it
                  in is for the times someone wants the post to lead on a
                  particular angle rather than the numbers. */}
              <TextInput
                mb={8}
                size="sm"
                placeholder={t(
                  "sharePost.anglePlaceholder",
                  "Optional: an angle for Orbit to write to",
                )}
                value={angle}
                onChange={(e) => setAngle(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !writing) {
                    e.preventDefault();
                    generate();
                  }
                }}
              />

              <Box
                style={{
                  border: `1px solid ${overLimit ? "var(--mantine-color-red-5)" : "var(--mantine-color-default-border)"}`,
                  borderRadius: "var(--mantine-radius-md)",
                  overflow: "hidden",
                }}
              >
                <CaptionToolbar
                  editor={editorRef}
                  onUndo={() => {
                    if (undoTo.current === null) return;
                    setCaption(undoTo.current, false);
                    undoTo.current = null;
                    // Stepping back past a generated caption means what is on
                    // screen is the user's own words again.
                    setWritten(false);
                  }}
                  canUndo={undoTo.current !== null}
                />
                <CaptionEditor
                  value={caption}
                  onChange={(next) => { setCaption(next, false); setWritten(false); }}
                  handleRef={editorRef}
                  ariaLabel={t("sharePost.caption")}
                  className="caption-editor"
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

              {/* Said plainly, and only while it is true: a caption posted
                  under someone's own name should not quietly be a machine's
                  words. It clears the moment they edit or reset. */}
              {written && (
                <Group gap={6} mt={8} wrap="nowrap">
                  <PenLine size={13} style={{ color: "var(--mantine-color-dimmed)", flexShrink: 0 }} />
                  <Text size="xs" c="dimmed">{t("sharePost.writtenNote")}</Text>
                </Group>
              )}

              <Group grow mt="md" gap="sm">
                <Button
                  variant="default"
                  leftSection={<RotateCcw size={15} />}
                  disabled={caption === defaultCaption}
                  onClick={() => { setDraft(null); setWritten(false); undoTo.current = null; }}
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

              {/* LinkedIn can publish directly now, so it gets the connection
                  panel instead of the copy-and-paste hint. Every other network
                  keeps that hint and its existing behaviour untouched. */}
              {platform === "linkedin" ? (
                <LinkedInConnection />
              ) : (
                active.needsPaste && (
                  <Text size="xs" c="dimmed" mt="md">
                    {t("sharePost.pasteHint", { platform: active.label })}
                  </Text>
                )
              )}

              {justPosted && (
                <Group gap={6} mt="md" wrap="nowrap">
                  <Check size={13} style={{ color: "var(--mantine-color-teal-6)", flexShrink: 0 }} />
                  <Text size="xs" c="dimmed">{t("sharePost.linkedinPosted")}</Text>
                  {/* Only when LinkedIn returned a URN we can address — never a
                      guessed URL. */}
                  {postedUrl && (
                    <Anchor href={postedUrl} target="_blank" rel="noopener noreferrer" size="xs">
                      {t("sharePost.linkedinView")}
                    </Anchor>
                  )}
                </Group>
              )}
            </Box>
            )}
          </Box>

          {/* Action bar, pinned so it stays reachable however long the caption. */}
          <Group
            justify="space-between"
            px={20}
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
              {/* LinkedIn publishes through our own connection now, and that
                  action lives in the panel above with the account it will post
                  as. Repeating a "Share on LinkedIn" button down here would put
                  two different primary actions on screen at once — one of them
                  the old copy-and-paste intent, which is exactly what the
                  integration replaced. The other four networks are unchanged. */}
              {/* LinkedIn publishes through our own connection, so its primary
                  action is a real post rather than the intent hand-off — but it
                  sits here, with every other panel's primary action, instead of
                  halfway up the body. The Link tab has no composer to publish,
                  so it carries no action beyond the copy button opposite. */}
              {platform === "linkedin" ? (
                linkedInReady && (
                  <Button
                    onClick={runLinkedInPost}
                    loading={posting}
                    disabled={overLimit || !caption.trim()}
                    radius="xl"
                    leftSection={<PlatformGlyph icon={active.icon} />}
                    style={
                      overLimit || !caption.trim()
                        ? undefined
                        : { background: `#${active.icon.hex}`, color: "#fff" }
                    }
                  >
                    {posting ? t("sharePost.linkedinPosting") : t("sharePost.linkedinPost")}
                  </Button>
                )
              ) : platform !== "link" ? (
                <Button
                  onClick={share}
                  disabled={overLimit}
                  radius="xl"
                  leftSection={<PlatformGlyph icon={active.icon} />}
                  // Only painted while it is actually clickable: a brand colour
                  // on a disabled button overrides the dimming that says so.
                  style={
                    overLimit ? undefined : { background: `#${active.icon.hex}`, color: "#fff" }
                  }
                >
                  {t("sharePost.shareOn", { platform: active.label })}
                </Button>
              ) : null}
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
              {/* Nothing is being composed on the link tab, so the feed mock
                  would be previewing a post that will never exist. The card
                  itself is still what a scraper renders for the link, which is
                  the honest thing to show instead. */}
              {platform === "link" ? (
                <Box
                  style={{
                    borderRadius: "var(--mantine-radius-md)",
                    overflow: "hidden",
                    border: "1px solid var(--mantine-color-default-border)",
                  }}
                >
                  <img src={image} alt="" style={{ display: "block", width: "100%" }} />
                </Box>
              ) : (
              <FeedPreview
                workspace={workspace}
                caption={caption}
                image={image}
                url={url}
                platform={active}
                device={device}
              />
              )}
            </Box>
          </Box>
        </Box>
      </Group>
    </Modal>
  );
}
