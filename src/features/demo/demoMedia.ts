import type { MediaAsset, MediaKind, MediaListResult } from "@/shared/types";

const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
const DAY = 86_400_000;

function asset(
  id: string,
  name: string,
  kind: MediaKind,
  format: string,
  mime: string,
  bytes: number,
  daysAgo: number,
  over: Partial<MediaAsset> = {},
): MediaAsset {
  return {
    id: `demo-media-${id}`,
    name,
    alt: "",
    url: `https://acme.example/media/${name}`,
    kind,
    mime,
    format,
    bytes,
    width: null,
    height: null,
    thumbnailUrl: "",
    createdAt: iso(daysAgo * DAY),
    updatedAt: iso(daysAgo * DAY),
    ...over,
  };
}

export const demoMedia: MediaAsset[] = [
  asset("1", "hero-banner.png", "image", "png", "image/png", 842_300, 2, {
    alt: "The Acme dashboard showing a deploy in progress",
    url: "https://acme.example/media/hero-banner.png",
    thumbnailUrl: "https://acme.example/media/hero-banner.png",
    width: 1440,
    height: 900,
  }),
  asset("2", "logo-mark.svg", "image", "svg", "image/svg+xml", 4_120, 40, {
    alt: "Acme",
    url: "https://acme.example/media/logo-mark.svg",
    thumbnailUrl: "https://acme.example/media/logo-mark.svg",
    width: 120,
    height: 32,
  }),
  asset("3", "pricing-chart.png", "image", "png", "image/png", 318_900, 6, {
    url: "https://acme.example/media/pricing-chart.png",
    thumbnailUrl: "https://acme.example/media/pricing-chart.png",
    width: 800,
    height: 420,
  }),
  asset("4", "q3-product-update.pdf", "raw", "pdf", "application/pdf", 1_204_880, 12),
  asset("5", "brand-guidelines.pdf", "raw", "pdf", "application/pdf", 2_840_000, 55),
  asset("6", "onboarding-checklist.docx", "raw", "docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 88_400, 9),
  asset("7", "launch-recap.mp4", "video", "mp4", "video/mp4", 18_430_000, 4, {
    width: 1920,
    height: 1080,
  }),
  asset("8", "customer-list.csv", "raw", "csv", "text/csv", 14_220, 20),
];

export function demoMediaResponse(params: {
  q?: string;
  kind?: MediaKind;
  page?: number;
  perPage?: number;
}): MediaListResult {
  const q = params.q?.trim().toLowerCase();
  const filtered = demoMedia.filter(
    (m) => (!params.kind || m.kind === params.kind) && (!q || m.name.toLowerCase().includes(q)),
  );
  const perPage = params.perPage ?? filtered.length;
  const page = params.page ?? 1;
  const start = (page - 1) * perPage;

  return {
    items: filtered.slice(start, start + perPage),
    total: filtered.length,
    page,
    perPage,
  };
}
