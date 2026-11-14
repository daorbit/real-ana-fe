import { useCallback, useEffect, useState } from "react";
import { notify } from "@/shared/lib/notify";

const QR_OPTIONS = { margin: 2, errorCorrectionLevel: "M" as const, color: { dark: "#000000", light: "#ffffff" } };

type QrModule = typeof import("qrcode");

async function loadQr(): Promise<QrModule> {
  const mod = await import("qrcode");
  return "default" in mod ? (mod as unknown as { default: QrModule }).default : mod;
}

function saveFile(href: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
}

export function useQrCode(url: string | null) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setSvg(null);
      return;
    }
    let cancelled = false;
    loadQr()
      .then((qr) => qr.toString(url, { ...QR_OPTIONS, type: "svg" }))
      .then((markup) => {
        if (!cancelled) setSvg(markup);
      })
      .catch(() => {
        if (!cancelled) notify.error("Could not make the QR code.");
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  const downloadPng = useCallback(
    async (filename: string) => {
      if (!url) return;
      const qr = await loadQr();
      saveFile(await qr.toDataURL(url, { ...QR_OPTIONS, width: 1024 }), `${filename}.png`);
    },
    [url],
  );

  const downloadSvg = useCallback(
    (filename: string) => {
      if (!svg) return;
      const href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      saveFile(href, `${filename}.svg`);
      setTimeout(() => URL.revokeObjectURL(href), 1000);
    },
    [svg],
  );

  return {
    image: svg ? `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` : null,
    downloadPng,
    downloadSvg,
  };
}
