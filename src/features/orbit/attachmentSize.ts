export const MAX_ATTACHMENTS_BYTES = 3 * 1024 * 1024;

export function dataUrlBytes(dataUrl: string | null | undefined): number {
  if (!dataUrl) return 0;
  const comma = dataUrl.indexOf(",");
  return Math.floor(((dataUrl.length - comma - 1) * 3) / 4);
}

export function fitsWithAttachment(fileBytes: number, otherDataUrl: string | null | undefined): boolean {
  return fileBytes + dataUrlBytes(otherDataUrl) <= MAX_ATTACHMENTS_BYTES;
}
