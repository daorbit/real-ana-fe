import type { Popup, PopupDevices, PopupInput, PopupLayout, PopupPageMode } from "@/features/popups/types";

export const LAYOUT_OPTIONS: { value: PopupLayout; label: string }[] = [
  { value: "modal", label: "Centered popup" },
  { value: "slide", label: "Corner slide-in" },
];

export const DEVICE_OPTIONS: { value: PopupDevices; label: string }[] = [
  { value: "all", label: "All devices" },
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Phones" },
];

export const PAGE_MODE_OPTIONS: { value: PopupPageMode; label: string }[] = [
  { value: "all", label: "Every page" },
  { value: "include", label: "Only these pages" },
  { value: "exclude", label: "All except these pages" },
];

export function defaultPopup(siteId = ""): PopupInput {
  return {
    name: "",
    siteId,
    formId: "",
    formTitle: "",
    enabled: true,
    trigger: { type: "delay", delaySeconds: 8, scrollPercent: 50 },
    layout: "modal",
    showAgainDays: 7,
    pages: { mode: "all", patterns: [] },
    devices: "all",
  };
}

export function toInput(popup: Popup): PopupInput {
  return {
    name: popup.name,
    siteId: popup.siteId,
    formId: popup.formId,
    formTitle: popup.formTitle,
    enabled: popup.enabled,
    trigger: { ...popup.trigger },
    layout: popup.layout,
    showAgainDays: popup.showAgainDays,
    pages: { mode: popup.pages.mode, patterns: [...popup.pages.patterns] },
    devices: popup.devices,
  };
}

export function triggerSummary(popup: PopupInput): string {
  if (popup.trigger.type === "scroll") return `At ${popup.trigger.scrollPercent}% scroll`;
  if (popup.trigger.type === "exit") return "On exit intent";
  return popup.trigger.delaySeconds ? `After ${popup.trigger.delaySeconds}s` : "Right away";
}

export function frequencySummary(days: number): string {
  if (days === 0) return "Once per visit";
  if (days === 1) return "At most daily";
  return `Every ${days} days at most`;
}

export function pagesSummary(popup: PopupInput): string {
  const count = popup.pages.patterns.length;
  if (popup.pages.mode === "include") return `${count} ${count === 1 ? "page" : "pages"}`;
  if (popup.pages.mode === "exclude") return `All but ${count} ${count === 1 ? "page" : "pages"}`;
  return "Every page";
}

export function conversionRate(popup: Popup): string {
  if (!popup.stats.views) return "–";
  return `${((popup.stats.submits / popup.stats.views) * 100).toFixed(1)}%`;
}
