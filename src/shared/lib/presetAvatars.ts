
export const PRESET_AVATARS = [
  "bottts_riley", "bottts_cameron", "bottts_sage",
  "bottts_drew", "bottts_lucas", "bottts_reese",
  "pixelart_jamie", "pixelart_cameron", "pixelart_casey",
  "notionists_riley", "notionists_casey", "notionists_quinn", "notionists_mia",
].map((id) => `/avatars/presets/${id}.svg`);

export function randomPresetAvatar(): string {
  return PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
}

const OUTPUT_SIZE = 200;

export async function fetchPresetAvatarBlob(src: string): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load that avatar."));
    img.src = src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process that avatar.");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  ctx.drawImage(image, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not process that avatar."))),
      "image/jpeg",
      0.9
    );
  });
}
