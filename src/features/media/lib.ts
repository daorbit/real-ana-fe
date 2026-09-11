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

export function isPdf(asset: MediaAsset): boolean {
  return /\.pdf$/i.test(asset.name) || asset.format === "pdf";
}

// Word/Excel/PowerPoint have no native browser renderer, unlike a PDF.
// Microsoft's Office Online Viewer renders these itself off a public URL.
// Not used for pdf (its own direct iframe) or anything neither viewer
// handles (zip, txt, csv).
const OFFICE_EXTENSIONS = /\.(?:docx?|xlsx?|pptx?|rtf|odt|ods|odp)$/i;

export function isOfficeDoc(asset: MediaAsset): boolean {
  return OFFICE_EXTENSIONS.test(asset.name);
}

export function officePreviewUrl(fileUrl: string): string {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
}

// Plain text formats a browser can just fetch and print — no renderer needed,
// unlike a pdf or an office doc.
const TEXT_EXTENSIONS = /\.(?:csv|tsv|txt|log|json|md|xml|ya?ml)$/i;

export function isTextLike(asset: MediaAsset): boolean {
  return TEXT_EXTENSIONS.test(asset.name) || asset.mime.startsWith("text/");
}

/** Cap on how much of a text file the preview fetches and renders. */
export const TEXT_PREVIEW_MAX_BYTES = 200 * 1024;
