import { Box, Text } from "@mantine/core";
import { PLACEHOLDER_IMAGE } from "./placeholder";

/**
 * The image area of the LinkedIn mock.
 *
 * LinkedIn tiles a multi-image post rather than making it swipeable: two side
 * by side, three as one large and two stacked, four as a grid, and anything
 * beyond four shows the first four with a "+N" over the last. Reproduced here
 * because which images are visible without a click is the thing the author is
 * actually choosing when they set the order.
 */
export function LinkedInImages({ images }: { images: string[] }) {
  const shown = images.length ? images : [PLACEHOLDER_IMAGE];

  if (shown.length === 1) {
    return (
      <img
        src={shown[0]}
        alt=""
        style={{ display: "block", width: "100%", maxHeight: 420, objectFit: "cover" }}
      />
    );
  }

  const tiles = shown.slice(0, 4);
  const hidden = shown.length - tiles.length;

  if (tiles.length === 2) {
    return (
      <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        {tiles.map((url, i) => <Tile key={i} url={url} height={220} />)}
      </Box>
    );
  }

  if (tiles.length === 3) {
    return (
      <Box style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2 }}>
        <Tile url={tiles[0]} height={300} />
        <Box style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 2 }}>
          <Tile url={tiles[1]} height={149} />
          <Tile url={tiles[2]} height={149} />
        </Box>
      </Box>
    );
  }

  return (
    <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
      {tiles.map((url, i) => (
        <Tile
          key={i}
          url={url}
          height={170}
          // The count sits on the last visible tile, which is where LinkedIn
          // puts it and where a reader looks for "there is more".
          more={i === tiles.length - 1 && hidden > 0 ? hidden : 0}
        />
      ))}
    </Box>
  );
}

function Tile({ url, height, more = 0 }: { url: string; height: number; more?: number }) {
  return (
    <Box style={{ position: "relative" }}>
      <img
        src={url}
        alt=""
        style={{ display: "block", width: "100%", height, objectFit: "cover" }}
      />
      {more > 0 && (
        <Box
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(0,0,0,0.55)",
          }}
        >
          <Text size="22px" fw={600} c="#fff">+{more}</Text>
        </Box>
      )}
    </Box>
  );
}
