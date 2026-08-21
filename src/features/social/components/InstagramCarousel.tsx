import { useEffect, useState } from "react";
import { ActionIcon, Box, Group, Text } from "@mantine/core";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PLACEHOLDER_IMAGE } from "./placeholder";

/**
 * The image area of the Instagram mock.
 *
 * One image renders plain; several get the arrows, the slide counter and the
 * dots Instagram itself shows — which is the point of previewing a carousel at
 * all, since what the author is checking is the order and the first frame.
 */
export function InstagramCarousel({ images }: { images: string[] }) {
  const slides = images.length ? images : [PLACEHOLDER_IMAGE];
  const [at, setAt] = useState(0);

  // Removing the slide being viewed would otherwise leave the index past the
  // end and the frame blank.
  useEffect(() => {
    if (at > slides.length - 1) setAt(Math.max(0, slides.length - 1));
  }, [slides.length, at]);

  const index = Math.min(at, slides.length - 1);
  const many = slides.length > 1;

  return (
    <Box style={{ position: "relative", background: "#0e0e0e" }}>
      <img
        src={slides[index]}
        alt=""
        style={{ display: "block", width: "100%", aspectRatio: "1 / 1", objectFit: "cover" }}
      />

      {many && (
        <>
          <Text
            size="11px"
            fw={600}
            c="#fff"
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              padding: "3px 9px",
              borderRadius: 999,
              background: "rgba(0,0,0,0.6)",
            }}
          >
            {index + 1}/{slides.length}
          </Text>

          {index > 0 && <Arrow side="left" onClick={() => setAt(index - 1)} />}
          {index < slides.length - 1 && <Arrow side="right" onClick={() => setAt(index + 1)} />}

          <Group
            gap={5}
            justify="center"
            style={{ position: "absolute", left: 0, right: 0, bottom: 10 }}
          >
            {slides.map((_, i) => (
              <Box
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: i === index ? "#3897f0" : "rgba(255,255,255,0.45)",
                }}
              />
            ))}
          </Group>
        </>
      )}
    </Box>
  );
}

function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <ActionIcon
      radius="xl"
      size="sm"
      onClick={onClick}
      aria-label={side === "left" ? "Previous slide" : "Next slide"}
      style={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        [side]: 10,
        background: "rgba(255,255,255,0.85)",
        color: "#262626",
      }}
    >
      {side === "left" ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
    </ActionIcon>
  );
}
