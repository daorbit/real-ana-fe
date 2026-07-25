import { useCallback, useEffect, useState } from "react";
import {
  Modal, Stack, Group, Button, Slider, Text, Box, ActionIcon, Tooltip,
} from "@mantine/core";
import { RotateCcw, RotateCw, ZoomIn, Check, X } from "lucide-react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";

/**
 * Square-crop an image before it is uploaded.
 *
 * Cropping in the browser is the point: only the finished 200×200 square is
 * sent, so a 4MB phone photo becomes a ~20KB upload, and the person choosing it
 * decides what is in frame rather than a server-side `g_face` guess. What was
 * previewed is exactly what gets stored.
 *
 * `react-easy-crop` handles the gesture surface — pan, pinch, wheel zoom, the
 * circular mask — and reports the selected region in source pixels. Turning that
 * region into a file is the part left to us, below.
 */

/** The stored avatar's edge length. Matches the server's transform. */
const OUTPUT_SIZE = 200;

type Props = {
  /** The picked file. `null` keeps the modal closed. */
  file: File | null;
  onCancel: () => void;
  /** Receives the cropped square as a JPEG blob, ready to upload. */
  onConfirm: (cropped: Blob) => void;
  busy?: boolean;
};

/**
 * Draw the selected region at output size and return it as a JPEG.
 *
 * The crop is taken from the source bitmap rather than from the preview, which
 * is only a viewport-sized approximation — resampling that would discard detail
 * the original still has. Rotation is applied by drawing into an intermediate
 * canvas first, because `croppedAreaPixels` is expressed in the rotated frame.
 */
async function cropToBlob(src: string, area: Area, rotation: number): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That file could not be read as an image."));
    img.src = src;
  });

  const radians = (rotation * Math.PI) / 180;
  const quarterTurn = (rotation / 90) % 2 !== 0;

  // A rotated image needs a canvas sized to its rotated bounding box, otherwise
  // the corners are clipped before the crop is even taken.
  const boxW = quarterTurn ? image.naturalHeight : image.naturalWidth;
  const boxH = quarterTurn ? image.naturalWidth : image.naturalHeight;

  const rotated = document.createElement("canvas");
  rotated.width = boxW;
  rotated.height = boxH;
  const rctx = rotated.getContext("2d");
  if (!rctx) throw new Error("Could not process that image.");

  rctx.translate(boxW / 2, boxH / 2);
  rctx.rotate(radians);
  rctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

  const out = document.createElement("canvas");
  out.width = OUTPUT_SIZE;
  out.height = OUTPUT_SIZE;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Could not process that image.");

  // JPEG has no alpha, so a transparent PNG would come out black wherever it
  // was see-through. White is the safe backdrop.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  ctx.drawImage(
    rotated,
    area.x, area.y, area.width, area.height,
    0, 0, OUTPUT_SIZE, OUTPUT_SIZE
  );

  return new Promise<Blob>((resolve, reject) => {
    out.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Could not process that image.")),
      "image/jpeg",
      0.9
    );
  });
}

export default function AvatarCropper({ file, onCancel, onConfirm, busy }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [area, setArea] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hold the file as a blob URL for as long as the modal is open, and reset the
  // editing state for each new pick. Revoking on cleanup matters: an un-revoked
  // URL pins the whole file in memory for the life of the page.
  useEffect(() => {
    if (!file) {
      setSrc(null);
      return;
    }
    setError(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setArea(null);

    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  const rotate = (degrees: number) =>
    setRotation((r) => (r + degrees + 360) % 360);

  const reset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const confirm = async () => {
    if (!src || !area) return;
    try {
      onConfirm(await cropToBlob(src, area, rotation));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not process that image.");
    }
  };

  return (
    <Modal
      opened={Boolean(file)}
      onClose={onCancel}
      title="Crop your profile image"
      centered
      radius="lg"
      size="sm"
    >
      <Stack gap="md">
        {error ? (
          <Text c="red" size="sm">{error}</Text>
        ) : (
          <>
            <Text size="xs" c="dimmed">
              Drag to reposition, scroll or use the slider to zoom.
            </Text>

            {/* The cropper positions itself absolutely, so it needs a sized,
                relative parent. A round crop shape because the avatar is round
                everywhere it is shown. */}
            <Box
              pos="relative"
              h={260}
              style={{
                borderRadius: "var(--mantine-radius-md)",
                overflow: "hidden",
                background: "var(--mantine-color-dark-8)",
              }}
            >
              {src && (
                <Cropper
                  image={src}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  minZoom={1}
                  maxZoom={3}
                  restrictPosition
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
            </Box>

            <Group gap="sm" align="center">
              <ZoomIn size={15} opacity={0.6} />
              <Slider
                flex={1}
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={setZoom}
                label={(v) => `${v.toFixed(1)}×`}
              />
              <Tooltip label="Rotate left">
                <ActionIcon variant="default" onClick={() => rotate(-90)}>
                  <RotateCcw size={15} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Rotate right">
                <ActionIcon variant="default" onClick={() => rotate(90)}>
                  <RotateCw size={15} />
                </ActionIcon>
              </Tooltip>
            </Group>

            <Group justify="space-between">
              <Button variant="subtle" size="sm" onClick={reset} disabled={busy}>
                Reset
              </Button>
              <Group gap="xs">
                <Button
                  variant="default"
                  size="sm"
                  leftSection={<X size={14} />}
                  onClick={onCancel}
                  disabled={busy}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  leftSection={<Check size={14} />}
                  onClick={() => void confirm()}
                  loading={busy}
                  disabled={!area}
                >
                  Save image
                </Button>
              </Group>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}
