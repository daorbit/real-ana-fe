import { Box, Group, Stack, Text } from "@mantine/core";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";

/**
 * The scheduled post as it will appear on Instagram.
 *
 * Fixed values rather than theme tokens, for the same reason the LinkedIn mock
 * uses them: this is a picture of Instagram, not a panel in our own UI. Where
 * LinkedIn is a light feed, Instagram's web feed is dark by default — so the
 * palette below is Instagram's, and only Instagram's.
 */
const IG = {
  page: "#000000",
  card: "#000000",
  line: "#262626",
  bar: "#262626",
  barSoft: "#1f1f1f",
  text: "#f5f5f5",
  dim: "#a8a8a8",
  link: "#e0f1ff",
};

/** Instagram's ring: the gradient that wraps an avatar with an unseen story. */
const RING = "linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)";

function Bar({ w, h = 8, c = IG.bar }: { w: number | string; h?: number; c?: string }) {
  return (
    <Box style={{ width: typeof w === "number" ? `${w}%` : w, height: h, borderRadius: 4, background: c, flexShrink: 0 }} />
  );
}

/** One entry in the right rail's suggestions list: avatar, handle, follow link. */
function Suggestion({ w }: { w: number }) {
  return (
    <Group gap={10} wrap="nowrap">
      <Box style={{ width: 30, height: 30, borderRadius: "50%", background: IG.bar, flexShrink: 0 }} />
      <Stack gap={5} style={{ flex: 1, minWidth: 0 }}>
        <Bar w={w} h={7} />
        <Bar w={w - 20} h={6} c={IG.barSoft} />
      </Stack>
      <Text size="11px" fw={600} c={IG.link} style={{ flexShrink: 0 }}>Follow</Text>
    </Group>
  );
}

export function InstagramPreview({
  author,
  caption,
  image,
  when,
  device,
}: {
  author: string;
  caption: string;
  /** A data URL for a new upload, an https URL for one already stored, or "". */
  image: string;
  /** "Monday at 09:00" — when this will publish, in place of "2h". */
  when: string;
  device: "desktop" | "mobile";
}) {
  const mobile = device === "mobile";
  // Instagram folds a caption after roughly the first line and hides the rest
  // behind "more". Showing the fold is the point: it decides whether the
  // opening words carry the post.
  const FOLD = mobile ? 90 : 130;
  const folded = caption.length > FOLD;
  const shown = folded ? caption.slice(0, FOLD) : caption;

  // Instagram derives the handle from the display name — lowercase, no spaces.
  const handle = (author || "your.handle").toLowerCase().replace(/\s+/g, "").slice(0, 30);

  const post = (
    <Box style={{ background: IG.card, border: `1px solid ${IG.line}`, borderRadius: 8, overflow: "hidden" }}>
      <Group gap={10} px={12} py={10} wrap="nowrap">
        <Box style={{ width: 34, height: 34, borderRadius: "50%", background: RING, padding: 2, flexShrink: 0 }}>
          <Box
            style={{
              width: "100%", height: "100%", borderRadius: "50%", border: `2px solid ${IG.card}`,
              background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
              display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 13,
            }}
          >
            {(author || "?").slice(0, 1).toUpperCase()}
          </Box>
        </Box>
        <Group gap={6} wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
          <Text size="13px" fw={600} c={IG.text} truncate>{handle}</Text>
          <Text size="13px" c={IG.dim} style={{ flexShrink: 0 }}>•</Text>
          <Text size="12px" c={IG.dim} truncate>{when}</Text>
        </Group>
        <Text size="sm" c={IG.text} style={{ letterSpacing: 1 }}>•••</Text>
      </Group>

      {/* The image is the post on Instagram — square by default, and required,
          so an empty slot shows as a frame rather than being skipped. */}
      {image ? (
        <img
          src={image}
          alt=""
          style={{ display: "block", width: "100%", aspectRatio: "1 / 1", objectFit: "cover" }}
        />
      ) : (
        <Box
          style={{
            width: "100%", aspectRatio: "1 / 1", background: "#0e0e0e",
            borderTop: `1px solid ${IG.line}`, borderBottom: `1px solid ${IG.line}`,
            display: "grid", placeItems: "center",
          }}
        >
          <Text size="12px" c={IG.dim}>Your image will appear here</Text>
        </Box>
      )}

      <Group justify="space-between" px={12} pt={10} wrap="nowrap">
        <Group gap={14} wrap="nowrap">
          <Heart size={22} style={{ color: IG.text }} />
          <MessageCircle size={22} style={{ color: IG.text }} />
          <Send size={22} style={{ color: IG.text }} />
        </Group>
        <Bookmark size={22} style={{ color: IG.text }} />
      </Group>

      <Box px={12} pt={8} pb={12}>
        <Text size="13px" fw={600} c={IG.text} mb={5}>1,284 likes</Text>
        <Text size="13px" c={IG.text} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.45 }}>
          <Text span size="13px" fw={600} c={IG.text}>{handle} </Text>
          {shown || <Text span c={IG.dim}>Your caption will appear here.</Text>}
          {folded && <Text span size="13px" c={IG.dim}> more</Text>}
        </Text>
        <Text size="12px" c={IG.dim} mt={6}>View all 37 comments</Text>
      </Box>
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
        // without it the mock's own edge anti-aliases to a pale hairline.
        border: "1px solid rgba(255,255,255,0.08)",
        background: IG.page,
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
            <Text size="10px" c="#c9ccd1" ta="center" truncate>instagram.com</Text>
          </Box>
        </Box>
        <Box w={33} />
      </Group>

      {/* Instagram's own chrome: the wordmark, a search pill, nav placeholders. */}
      <Group px={14} py={9} gap={12} wrap="nowrap" style={{ background: IG.card, borderBottom: `1px solid ${IG.line}` }}>
        <Text
          size="16px"
          fw={600}
          c={IG.text}
          style={{ fontFamily: "'Segoe Script', 'Brush Script MT', cursive", flexShrink: 0 }}
        >
          Instagram
        </Text>
        {mobile ? (
          <>
            <Box style={{ flex: 1 }} />
            <Heart size={18} style={{ color: IG.text, flexShrink: 0 }} />
            <Send size={18} style={{ color: IG.text, flexShrink: 0 }} />
          </>
        ) : (
          <>
            <Box style={{ width: 180, height: 24, borderRadius: 8, background: IG.bar, flexShrink: 0 }} />
            <Group gap={20} justify="flex-end" wrap="nowrap" style={{ flex: 1 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Box
                  key={i}
                  style={{
                    width: 20, height: 20, borderRadius: 5,
                    // The first item reads as the active tab, which gives the
                    // strip its "you are in the feed" shape.
                    background: i === 0 ? IG.text : IG.bar,
                  }}
                />
              ))}
            </Group>
          </>
        )}
      </Group>

      <Box p={mobile ? 10 : 16} style={{ background: IG.page }}>
        {mobile ? (
          post
        ) : (
          // Instagram's web feed is a centred column with a suggestions rail on
          // the right and nothing on the left — not LinkedIn's three columns.
          <Group align="flex-start" gap={24} justify="center" wrap="nowrap">
            <Box style={{ flex: "0 1 470px", minWidth: 0 }}>{post}</Box>

            <Stack gap={14} style={{ flex: "0 0 30%", minWidth: 0, paddingTop: 4 }}>
              <Group gap={10} wrap="nowrap">
                <Box style={{ width: 40, height: 40, borderRadius: "50%", background: RING, padding: 2, flexShrink: 0 }}>
                  <Box
                    style={{
                      width: "100%", height: "100%", borderRadius: "50%", border: `2px solid ${IG.page}`,
                      background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
                      display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 14,
                    }}
                  >
                    {(author || "?").slice(0, 1).toUpperCase()}
                  </Box>
                </Box>
                <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                  <Text size="12px" fw={600} c={IG.text} truncate>{handle}</Text>
                  <Text size="11px" c={IG.dim} truncate>{author || "Your name"}</Text>
                </Stack>
              </Group>

              <Text size="12px" fw={600} c={IG.dim}>Suggested for you</Text>
              <Stack gap={12}>
                {[70, 85, 60].map((w, i) => <Suggestion key={i} w={w} />)}
              </Stack>
            </Stack>
          </Group>
        )}
      </Box>
    </Box>
  );
}
