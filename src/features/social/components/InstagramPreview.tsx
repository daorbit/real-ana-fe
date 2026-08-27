import { Box, Group, Stack, Text } from "@mantine/core";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import { InstagramCarousel } from "./InstagramCarousel";

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
  images,
  when,
  device,
}: {
  author: string;
  caption: string;
  /** Every slide, in order. More than one renders as a carousel. */
  images: string[];
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
      <InstagramCarousel images={images} />

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
    <Box style={{ width: "100%", height: "100%", background: IG.page }}>
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
            {/* Shrinks before the rail does — a feed column that will not give
                way is what pushed the suggestions off a narrow pane. */}
            <Box style={{ flex: "1 1 470px", maxWidth: 470, minWidth: 0 }}>{post}</Box>

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
