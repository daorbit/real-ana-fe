import { useEffect, useState } from "react";
import { Text } from "@mantine/core";

/** Instagram's story canvas. Anything else is fitted and padded. */
const STORY_RATIO = 9 / 16;

/**
 * How far the attached image is from a story's shape.
 *
 * Measured from the file the author actually picked rather than assumed, and
 * said before the post goes out: a portrait photo fills the screen, a square
 * one publishes with bars top and bottom, and a landscape one ends up a strip
 * in the middle. All three are valid posts — this is a heads-up, not an error,
 * which is why it never blocks scheduling.
 */
export function StoryFitNote({ image }: { image: string }) {
  const [ratio, setRatio] = useState<number | null>(null);

  useEffect(() => {
    if (!image) {
      setRatio(null);
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setRatio(img.naturalWidth / img.naturalHeight);
    };
    // A picture that cannot be measured simply gets no note.
    img.onerror = () => { if (!cancelled) setRatio(null); };
    img.src = image;

    return () => { cancelled = true; };
  }, [image]);

  if (ratio === null) return null;

  // Within a few percent of 9:16 is close enough that the padding is invisible.
  if (Math.abs(ratio - STORY_RATIO) < 0.04) {
    return <Text size="xs" c="dimmed" mt={6}>Fills the screen — this is a story shape.</Text>;
  }

  return (
    <Text size="xs" c="dimmed" mt={6} lh={1.5}>
      {ratio > STORY_RATIO
        ? "Wider than a story, so it will be fitted with a matching surround above and below."
        : "Taller than a story, so it will be fitted with a matching surround either side."}{" "}
      Use 1080×1920 to fill the screen edge to edge.
    </Text>
  );
}
