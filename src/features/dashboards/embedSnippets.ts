import { WIDGET_MAP } from "@/features/analytics/widgetCatalog";

const HEIGHTS: Record<string, number> = {
  metric: 170,
  chart: 320,
  map: 420,
  list: 360,
  live: 320,
};

export function embedHeight(widget: string): number {
  if (widget === "heatmap") return 340;
  return HEIGHTS[WIDGET_MAP[widget]?.kind ?? "list"] ?? 320;
}

export function embedUrl(token: string): string {
  return `${window.location.origin}/embed/${token}`;
}

export function iframeSnippet(token: string, widget: string, title: string): string {
  return `<iframe src="${embedUrl(token)}" title="${title.replace(/"/g, "&quot;")}" width="100%" height="${embedHeight(widget)}" style="border:0;border-radius:16px;overflow:hidden" loading="lazy"></iframe>`;
}

export function scriptSnippet(token: string): string {
  return `<div data-quantalog-embed="${token}"></div>\n<script async src="${window.location.origin}/embed.js"></script>`;
}
