import { Box, Group, Stack, Text } from "@mantine/core";
import { Globe, MessageSquare, Repeat2, Send, ThumbsUp } from "lucide-react";
import { LinkedInImages } from "./LinkedInImages";

/**
 * The scheduled post as it will appear on LinkedIn.
 *
 * Fixed light values rather than theme tokens: this is a picture of LinkedIn,
 * and LinkedIn is a light UI. Following our dark theme here would produce a
 * preview that looks nothing like where the post is going.
 */
const MOCK = {
  page: "#f4f2ee",
  card: "#ffffff",
  line: "#e0dfdc",
  bar: "#e4e6eb",
  barSoft: "#eceef1",
  text: "#000000e6",
  dim: "#00000099",
  brand: "#0a66c2",
};

function Bar({ w, h = 8, c = MOCK.bar }: { w: number | string; h?: number; c?: string }) {
  return (
    <Box style={{ width: typeof w === "number" ? `${w}%` : w, height: h, borderRadius: 4, background: c, flexShrink: 0 }} />
  );
}

/** A rail card of grey bars, as the columns either side of a feed carry. */
function RailCard({ lines }: { lines: number[] }) {
  return (
    <Stack gap={9} p={10} style={{ background: MOCK.card, borderRadius: 8, border: `1px solid ${MOCK.line}` }}>
      {lines.map((w, i) => <Bar key={i} w={w} h={7} c={i ? MOCK.barSoft : MOCK.bar} />)}
    </Stack>
  );
}

export function LinkedInPreview({
  author,
  headline,
  caption,
  images,
  when,
  device,
}: {
  author: string;
  /** The line under the name. The connection's own, when there is one. */
  headline: string;
  caption: string;
  /** Every image, in order. More than one renders as LinkedIn's tiled post. */
  images: string[];
  /** "Monday at 09:00" — when this will publish, in place of "now". */
  when: string;
  device: "desktop" | "mobile";
}) {
  const mobile = device === "mobile";
  // LinkedIn collapses long captions behind a "…see more" fold. Showing the fold
  // is the point of the preview — it decides whether the first lines carry the
  // message, which is the whole job of a scheduled post nobody watches go out.
  const FOLD = mobile ? 120 : 210;
  const folded = caption.length > FOLD;
  const shown = folded ? caption.slice(0, FOLD) : caption;

  const post = (
    <Box style={{ background: MOCK.card, border: `1px solid ${MOCK.line}`, borderRadius: 8, overflow: "hidden" }}>
      <Group gap={9} px={12} pt={12} pb={8} wrap="nowrap" align="flex-start">
        <Box
          style={{
            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 17,
          }}
        >
          {(author || "?").slice(0, 1).toUpperCase()}
        </Box>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Text size="sm" fw={600} c={MOCK.text} truncate>{author || "Your name"}</Text>
          {headline && <Text size="11px" c={MOCK.dim} truncate>{headline}</Text>}
          <Group gap={4} wrap="nowrap">
            <Text size="11px" c={MOCK.dim} truncate>{when}</Text>
            <Globe size={11} style={{ color: MOCK.dim, flexShrink: 0 }} />
          </Group>
        </div>
        <Text size="sm" c={MOCK.dim} style={{ letterSpacing: 1 }}>•••</Text>
      </Group>

      <Box px={12} pb={10}>
        <Text size="14px" c={MOCK.text} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.45 }}>
          {shown || <Text span c={MOCK.dim}>Your post will appear here.</Text>}
          {folded && <Text span size="14px" c={MOCK.dim}>…see more</Text>}
        </Text>
      </Box>

      <LinkedInImages images={images} />

      {/* Reaction counts, so the card ends the way a real post does. */}
      <Group justify="space-between" px={12} pt={8} wrap="nowrap">
        <Group gap={4} wrap="nowrap">
          {[MOCK.brand, "#f5987e", "#df704d"].map((c) => (
            <Box key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c, border: "2px solid #fff", marginRight: -6 }} />
          ))}
          <Text size="11px" c={MOCK.dim} ml={10}>128</Text>
        </Group>
        <Text size="11px" c={MOCK.dim}>14 comments</Text>
      </Group>

      <Group
        justify="space-between"
        px={12}
        py={6}
        mt={8}
        wrap="nowrap"
        style={{ borderTop: `1px solid ${MOCK.line}` }}
      >
        {[
          { Icon: ThumbsUp, label: "Like" },
          { Icon: MessageSquare, label: "Comment" },
          { Icon: Repeat2, label: "Repost" },
          { Icon: Send, label: "Send" },
        ].map(({ Icon, label }) => (
          <Group key={label} gap={6} wrap="nowrap" style={{ padding: "6px 8px" }}>
            <Icon size={16} style={{ color: MOCK.dim }} />
            {!mobile && <Text size="12px" fw={600} c={MOCK.dim}>{label}</Text>}
          </Group>
        ))}
      </Group>
    </Box>
  );

  return (
    <Box
      style={{
        // A window, not a wall: the mock keeps a browser's proportions and sits
        // centred in the pane rather than stretching to fill it.
        width: "100%",
        maxWidth: mobile ? 400 : 820,
        margin: "0 auto",
        borderRadius: 12,
        overflow: "hidden",
        // The ring keeps the rounded corners from fringing against the pane —
        // without it the light card edge anti-aliases to a pale hairline that
        // reads as a stray white border on a dark background.
        border: "1px solid rgba(0,0,0,0.35)",
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
            <Text size="10px" c="#c9ccd1" ta="center" truncate>linkedin.com/feed</Text>
          </Box>
        </Box>
        <Box w={33} />
      </Group>

      {/* LinkedIn's own chrome: the mark, a search pill, nav placeholders. */}
      <Group px={12} py={7} gap={10} wrap="nowrap" style={{ background: MOCK.card, borderBottom: `1px solid ${MOCK.line}` }}>
        <Box
          style={{
            width: 22, height: 22, borderRadius: 4, background: MOCK.brand, color: "#fff",
            display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}
        >
          in
        </Box>
        {mobile ? (
          <>
            <Box style={{ flex: 1, height: 22, borderRadius: 11, background: MOCK.page }} />
            <Box style={{ width: 22, height: 22, borderRadius: "50%", background: MOCK.bar, flexShrink: 0 }} />
          </>
        ) : (
          <>
            <Box style={{ width: 160, height: 22, borderRadius: 4, background: MOCK.page, flexShrink: 0 }} />
            <Group gap={22} justify="flex-end" wrap="nowrap" style={{ flex: 1 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Box
                  key={i}
                  style={{
                    width: 26, height: 12, borderRadius: 3, background: MOCK.bar,
                    // The first nav item reads as the active tab, which gives
                    // the strip its "you are in the feed" shape.
                    borderBottom: i === 0 ? `2px solid ${MOCK.text}` : "none",
                    paddingBottom: i === 0 ? 6 : 0,
                  }}
                />
              ))}
            </Group>
          </>
        )}
      </Group>

      <Box p={mobile ? 10 : 14} style={{ background: MOCK.page }}>
        {mobile ? (
          post
        ) : (
          <Group align="flex-start" gap={14} wrap="nowrap">
            <Stack gap={12} style={{ flex: "0 0 22%", minWidth: 0 }}>
              <RailCard lines={[90, 60, 75]} />
              <RailCard lines={[80, 55]} />
            </Stack>

            <Box style={{ flex: "1 1 auto", minWidth: 0 }}>{post}</Box>

            <Stack gap={12} style={{ flex: "0 0 22%", minWidth: 0 }}>
              <RailCard lines={[75, 88, 55]} />
              <RailCard lines={[80, 65]} />
            </Stack>
          </Group>
        )}
      </Box>
    </Box>
  );
}
