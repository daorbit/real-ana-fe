import { demoSites } from "@/features/demo/demoData";
import type { PopupsResponse } from "@/features/popups/types";

export function demoPopups(): PopupsResponse {
  const siteId = demoSites[0]?.siteId ?? "demo-site";
  const createdAt = new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString();
  return {
    statsDays: 30,
    popups: [
      {
        id: "demo-popup-1",
        name: "Exit offer on pricing",
        siteId,
        formId: "000000000000000000000001",
        formTitle: "Get 10% off your first month",
        enabled: true,
        trigger: { type: "exit", delaySeconds: 8, scrollPercent: 50 },
        layout: "modal",
        showAgainDays: 7,
        pages: { mode: "include", patterns: ["/pricing", "/plans/*"] },
        devices: "all",
        stats: { views: 1840, submits: 131 },
        createdAt,
      },
      {
        id: "demo-popup-2",
        name: "Newsletter slide-in",
        siteId,
        formId: "000000000000000000000002",
        formTitle: "Weekly growth tips",
        enabled: true,
        trigger: { type: "scroll", delaySeconds: 8, scrollPercent: 60 },
        layout: "slide",
        showAgainDays: 14,
        pages: { mode: "include", patterns: ["/blog/*"] },
        devices: "desktop",
        stats: { views: 3215, submits: 96 },
        createdAt,
      },
    ],
  };
}
