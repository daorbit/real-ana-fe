import type { MediaAsset } from "@/shared/types";

/** The ceiling the server enforces, repeated here so a refusal is instant. */
export const MAX_ASSET_BYTES = 25 * 1024 * 1024;

/** A file as the upload endpoint wants it: a base64 data URL. */
export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * What to show in a tile.
 *
 * `raw` has no visual form — a PDF or a CSV is an icon and its name — so this
 * returns nothing for those and the caller draws the fallback.
 */
export function previewUrl(asset: MediaAsset): string | undefined {
  if (asset.kind === "raw") return undefined;
  return asset.thumbnailUrl || asset.url;
}
