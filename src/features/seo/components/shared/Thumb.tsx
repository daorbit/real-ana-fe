import { useState } from "react";
import { Anchor, Badge, Box, Center, Modal, Stack, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { Image as ImageIcon, Eye, Globe } from "lucide-react";

/**
 * A thumbnail of an image found on the audited page.
 *
 * Loaded straight from the customer's own origin, which means some will fail —
 * hotlink protection, an auth wall, a URL that only resolves on their network.
 * A broken-image glyph would read as "your image is broken" when it is not, so
 * a failure falls back to a neutral placeholder instead.
 */
export function Thumb({ src, alt, size = 48 }: { src: string; alt: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  const box: React.CSSProperties = { width: size, height: size };

  // Nothing to enlarge if it would not render at thumbnail size either.
  if (failed) {
    return (
      <Tooltip label="Could not load this image from here" withArrow>
        <Center
          style={{
            ...box,
            borderRadius: 8,
            boxShadow: "inset 0 0 0 1px var(--mantine-color-default-border)",
            background: "var(--mantine-color-body)",
            flexShrink: 0,
          }}
        >
          <ImageIcon size={16} style={{ opacity: 0.35 }} />
        </Center>
      </Tooltip>
    );
  }

  return (
    <>
      <UnstyledButton
        className="seo-thumb"
        style={box}
        onClick={() => setOpen(true)}
        aria-label={`Preview image${alt ? `: ${alt}` : ""}`}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <Box className="seo-thumb-overlay">
          <Eye size={16} />
        </Box>
      </UnstyledButton>

      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title={
          <Text size="sm" fw={600}>
            {alt || "Image preview"}
          </Text>
        }
        size="lg"
        centered
        radius="md"
      >
        <Stack gap="sm">
          <Center
            style={{
              background: "var(--mantine-color-body)",
              borderRadius: 8,
              padding: 12,
              minHeight: 200,
            }}
          >
            <img
              src={src}
              alt={alt}
              style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain" }}
            />
          </Center>
          <Box>
            <Text size="xs" c="dimmed" fw={650} tt="uppercase" mb={3} style={{ letterSpacing: "0.05em" }}>
              Alt text
            </Text>
            {alt ? (
              <Text size="sm">{alt}</Text>
            ) : (
              <Badge size="sm" variant="light" color="yellow">
                Missing
              </Badge>
            )}
          </Box>
          <Box>
            <Text size="xs" c="dimmed" fw={650} tt="uppercase" mb={3} style={{ letterSpacing: "0.05em" }}>
              Source
            </Text>
            <Anchor
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              size="xs"
              style={{ wordBreak: "break-all" }}
            >
              {src}
            </Anchor>
          </Box>
        </Stack>
      </Modal>
    </>
  );
}

/** The site's favicon in the SERP row, degrading to a globe glyph if it 404s. */
export function FaviconDot({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Globe size={13} style={{ opacity: 0.5 }} />;
  return (
    <img
      src={src}
      alt=""
      width={16}
      height={16}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      style={{ borderRadius: 4, objectFit: "contain" }}
    />
  );
}
