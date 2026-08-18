import { Box, Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { CARD_WIDTH, CARD_HEIGHT } from "./shareCard";
import { PlatformGlyph, type Platform } from "./sharePlatforms";

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
export function FeedPreview({
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
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
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
