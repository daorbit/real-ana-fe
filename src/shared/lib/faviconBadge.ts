const SIZE = 64;
const DOT = "#ef4444";

let original: string | null = null;
let badged: string | null = null;
let pending: Promise<string | null> | null = null;
let wanted = false;

function iconLink(): HTMLLinkElement | null {
  return document.querySelector<HTMLLinkElement>('link[rel="icon"]');
}

function drawBadge(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        ctx.beginPath();
        ctx.arc(SIZE - 15, 15, 14, 0, Math.PI * 2);
        ctx.fillStyle = DOT;
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function setFaviconBadge(on: boolean) {
  wanted = on;
  const link = iconLink();
  if (!link) return;
  if (original === null) original = link.href;

  if (!on) {
    link.href = original;
    return;
  }

  if (!badged) {
    pending ??= drawBadge(original);
    badged = await pending;
    pending = null;
  }
  if (badged && wanted) link.href = badged;
}
