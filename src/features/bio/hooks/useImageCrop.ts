import { useState } from "react";
import { useUploadMediaMutation } from "@/app/store";
import { readAsDataUrl } from "@/features/media/lib";
import type { MediaAsset } from "@/shared/types";
import { errMessage, notify } from "@/shared/lib/notify";

async function fileFromUrl(url: string, name: string): Promise<File> {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error("Could not open that image.");
  const blob = await res.blob();
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}

export function useImageCrop(workspaceId: string | undefined, fileName: string, onDone: (url: string) => void) {
  const [upload] = useUploadMediaMutation();
  const [picking, setPicking] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const cropFromUrl = async (url: string) => {
    try {
      setCropFile(await fileFromUrl(url, `${fileName}.jpg`));
    } catch {
      onDone(url);
      notify.error("That image can't be cropped here, so it was added as it is.");
    }
  };

  const pick = (asset: MediaAsset) => {
    setPicking(false);
    void cropFromUrl(asset.url);
  };

  const cropUpload = (file: File) => {
    setPicking(false);
    setCropFile(file);
  };

  const save = async (blob: Blob) => {
    const file = new File([blob], `${fileName}-${Date.now()}.jpg`, { type: "image/jpeg" });
    setBusy(true);
    try {
      const dataUrl = await readAsDataUrl(file);
      if (!workspaceId) throw new Error("Open a workspace first.");
      const res = await upload({ workspaceId, files: [{ file: dataUrl, name: file.name, alt: "" }] }).unwrap();
      const asset = res.items[0];
      if (!asset) throw new Error(res.failed[0]?.message ?? "Upload failed.");
      onDone(asset.url);
      setCropFile(null);
    } catch (e) {
      notify.error(errMessage(e, "Could not save the image."));
    } finally {
      setBusy(false);
    }
  };

  return {
    picking,
    openPicker: () => setPicking(true),
    closePicker: () => setPicking(false),
    pick,
    cropUpload,
    adjust: (url: string) => void cropFromUrl(url),
    cropFile,
    cancelCrop: () => setCropFile(null),
    save,
    busy,
  };
}
