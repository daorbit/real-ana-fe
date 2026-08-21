import { Box, Group, Text } from "@mantine/core";
import { MoreHorizontal, Send, X } from "lucide-react";
import { PLACEHOLDER_IMAGE } from "./placeholder";

/**
 * A story, as it fills a phone.
 *
 * A different frame from the feed mock rather than the same one narrowed: a
 * story is edge to edge at 9:16 with the chrome floating over the image, and
 * the thing an author is checking is whether their picture survives that crop.
 * Showing it in a feed card would answer the wrong question.
 */
export function StoryPreview({
  author,
  image,
  when,
}: {
  author: string;
  image: string;
  /** When it publishes, in place of the "2h" a live story would show. */
  when: string;
}) {
  const handle = (author || "your.handle").toLowerCase().replace(/\s+/g, "").slice(0, 30);

  return (
    <Box
      style={{
        // Sized from the pane's height rather than its width: a story is tall,
        // and a width-driven box either overflows a short pane or leaves most
        // of a tall one empty. The width follows from the 9:16 ratio.
        height: "min(72vh, 620px)",
        maxWidth: "100%",
        aspectRatio: "9 / 16",
        margin: "0 auto",
        position: "relative",
        borderRadius: 22,
        overflow: "hidden",
        background: "#000",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 30px 70px rgba(0,0,0,0.45)",
      }}
    >
      {/* A blurred copy of the image fills the frame behind the real one, which
          is what Instagram itself puts behind a story that is not exactly 9:16.
          Without it the letterboxed bars are flat black and the preview looks
          broken rather than looking like the post. */}
      <img
        src={image || PLACEHOLDER_IMAGE}
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(22px) saturate(1.3)",
          transform: "scale(1.15)",
        }}
      />

      {/* `contain`, not `cover`. Instagram does not crop a story to fit — it
          fits the whole image and pads what is left, so cropping here would
          show the author a frame they are not going to get, and hide exactly
          the edges they need to check. */}
      <img
        src={image || PLACEHOLDER_IMAGE}
        alt=""
        style={{
          position: "relative",
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />

      {/* Instagram darkens the top and bottom of a story so its own chrome
          stays legible over any image. Reproduced, because it is the reason a
          light photograph does not wash the controls out. */}
      <Box
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 22%, transparent 82%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* The progress bar. One segment, because one image is one story. */}
      <Box style={{ position: "absolute", top: 10, left: 10, right: 10 }}>
        <Box style={{ height: 2.5, borderRadius: 2, background: "rgba(255,255,255,0.32)" }}>
          <Box style={{ width: "38%", height: "100%", borderRadius: 2, background: "#fff" }} />
        </Box>
      </Box>

      <Group
        gap={9}
        wrap="nowrap"
        style={{ position: "absolute", top: 22, left: 10, right: 10 }}
      >
        <Box
          style={{
            width: 27,
            height: 27,
            borderRadius: "50%",
            flexShrink: 0,
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: 11,
          }}
        >
          {(author || "?").slice(0, 1).toUpperCase()}
        </Box>
        <Text size="12px" fw={600} c="#fff" style={{ minWidth: 0 }} truncate>
          {handle}
        </Text>
        <Text size="11px" c="rgba(255,255,255,0.72)" style={{ flexShrink: 0 }} truncate>
          {when}
        </Text>
        <Box style={{ marginLeft: "auto", display: "flex", gap: 10, flexShrink: 0 }}>
          <MoreHorizontal size={15} style={{ color: "#fff" }} />
          <X size={15} style={{ color: "#fff" }} />
        </Box>
      </Group>

      {/* The reply bar. Present because it is what a viewer actually sees at
          the foot of a story, and its absence made the frame look cropped. */}
      <Group gap={10} wrap="nowrap" style={{ position: "absolute", bottom: 12, left: 12, right: 12 }}>
        <Box
          style={{
            flex: 1,
            height: 32,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.55)",
            display: "flex",
            alignItems: "center",
            paddingLeft: 13,
          }}
        >
          <Text size="11px" c="rgba(255,255,255,0.75)">Send message</Text>
        </Box>
        <Send size={17} style={{ color: "#fff", flexShrink: 0 }} />
      </Group>
    </Box>
  );
}
