import type { MediaAsset, MediaUploadInput } from "@/shared/types";
import { errMessage } from "@/shared/lib/notify";
import { MAX_BATCH_BYTES, readAsDataUrl } from "./lib";

export type MediaUploadResult = { items: MediaAsset[]; failed: { name: string; message: string }[] };

type SendBatch = (files: MediaUploadInput[]) => Promise<MediaUploadResult>;

function toBatches(files: File[]): File[][] {
  const batches: File[][] = [];
  let current: File[] = [];
  let currentBytes = 0;
  for (const file of files) {
    if (current.length && currentBytes + file.size > MAX_BATCH_BYTES) {
      batches.push(current);
      current = [];
      currentBytes = 0;
    }
    current.push(file);
    currentBytes += file.size;
  }
  if (current.length) batches.push(current);
  return batches;
}

export async function uploadInBatches(files: File[], send: SendBatch): Promise<MediaUploadResult> {
  const result: MediaUploadResult = { items: [], failed: [] };
  for (const batch of toBatches(files)) {
    try {
      const payload = await Promise.all(batch.map(async (f) => ({ file: await readAsDataUrl(f), name: f.name, alt: "" })));
      const res = await send(payload);
      result.items.push(...res.items);
      result.failed.push(...(res.failed ?? []));
    } catch (err) {
      const message = errMessage(err);
      result.failed.push(...batch.map((f) => ({ name: f.name, message })));
    }
  }
  return result;
}
