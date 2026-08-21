import { ActionIcon, Box, Group, Text, Tooltip } from "@mantine/core";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

/**
 * One image in the post, with the controls that change its place.
 *
 * Arrows rather than drag: order matters on a carousel, and a drag target this
 * small is the thing people miss on a trackpad. The position is numbered for
 * the same reason — "slide 3" is what the author is thinking about.
 */
export function ImageSlide({
  url,
  index,
  total,
  onMove,
  onRemove,
}: {
  url: string;
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <Box
      style={{
        position: "relative",
        borderRadius: "var(--mantine-radius-md)",
        overflow: "hidden",
        border: "1px solid var(--mantine-color-default-border)",
      }}
    >
      <img
        src={url}
        alt=""
        style={{ display: "block", width: "100%", aspectRatio: "1 / 1", objectFit: "cover" }}
      />

      {total > 1 && (
        <Text
          size="10px"
          fw={700}
          c="#fff"
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            padding: "2px 7px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.6)",
          }}
        >
          {index + 1}
        </Text>
      )}

      <Group
        gap={3}
        justify="center"
        px={4}
        py={4}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(transparent, rgba(0,0,0,0.72))",
        }}
      >
        {total > 1 && (
          <>
            <Ctl label="Move left" disabled={index === 0} onClick={() => onMove(index, index - 1)}>
              <ChevronLeft size={13} />
            </Ctl>
            <Ctl
              label="Move right"
              disabled={index === total - 1}
              onClick={() => onMove(index, index + 1)}
            >
              <ChevronRight size={13} />
            </Ctl>
          </>
        )}
        <Ctl label="Remove" onClick={() => onRemove(index)}>
          <Trash2 size={13} />
        </Ctl>
      </Group>
    </Box>
  );
}

function Ctl({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip label={label} withArrow openDelay={400}>
      <ActionIcon
        variant="subtle"
        size="sm"
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
        // White on the gradient rather than a theme colour: this sits over the
        // author's own photograph, which can be any colour at all.
        styles={{ root: { color: "#fff" } }}
      >
        {children}
      </ActionIcon>
    </Tooltip>
  );
}
