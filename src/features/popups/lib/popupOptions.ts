import { LEAD_FORMS_BASE } from "@/features/leadCapture/themeParams";
import type { Popup, PopupDevices, PopupInput, PopupLayout, PopupPageMode } from "@/features/popups/types";

export const POPUP_DEMO_MESSAGE = "Demo data is read-only. Turn off demo mode to change popups.";

export const LAYOUT_OPTIONS: { value: PopupLayout; label: string; hint: string }[] = [
  { value: "modal", label: "Centered popup", hint: "Dims the page and asks for full attention." },
  { value: "slide", label: "Corner slide-in", hint: "Slides into the corner without blocking the page." },
];

export const DEVICE_OPTIONS: { value: PopupDevices; label: string }[] = [
  { value: "all", label: "All devices" },
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Phones" },
];

export const PAGE_MODE_OPTIONS: { value: PopupPageMode; label: string }[] = [
  { value: "all", label: "Every page" },
  { value: "include", label: "Only these" },
  { value: "exclude", label: "All except" },
];

export const FREQUENCY_PRESETS: { value: number; label: string }[] = [
  { value: 0, label: "Every visit" },
  { value: 1, label: "Daily" },
  { value: 7, label: "Weekly" },
  { value: 30, label: "Monthly" },
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

export function isPopupValid(input: PopupInput): boolean {
  const needsPages = input.pages.mode !== "all";
  return Boolean(input.name.trim() && input.siteId && input.formId && (!needsPages || input.pages.patterns.length));
}

export function previewUrl(formId: string): string {
  return `${LEAD_FORMS_BASE.replace(/\/$/, "")}/form/${encodeURIComponent(formId)}/view?preview=1`;
}

export function triggerSummary(popup: PopupInput): string {
  if (popup.trigger.type === "scroll") return `At ${popup.trigger.scrollPercent}% scroll`;
  if (popup.trigger.type === "exit") return "On exit intent";
  return popup.trigger.delaySeconds ? `After ${popup.trigger.delaySeconds}s` : "Right away";
}

export function frequencySummary(days: number): string {
  if (days === 0) return "Once per visit";
  if (days === 1) return "At most daily";
  return `At most every ${days} days`;
}

export function pagesSummary(popup: PopupInput): string {
  const count = popup.pages.patterns.length;
  if (popup.pages.mode === "include") return `${count} ${count === 1 ? "page" : "pages"}`;
  if (popup.pages.mode === "exclude") return `All but ${count}`;
  return "Every page";
}

export function devicesLabel(devices: PopupDevices): string {
  return DEVICE_OPTIONS.find((o) => o.value === devices)?.label ?? "All devices";
}

export function conversionRate(views: number, submits: number): number {
  return views ? (submits / views) * 100 : 0;
}

export function formatRate(views: number, submits: number): string {
  return views ? `${conversionRate(views, submits).toFixed(1)}%` : "–";
}

function listPaths(patterns: string[]): string {
  if (patterns.length <= 3) return patterns.join(", ");
  return `${patterns.slice(0, 3).join(", ")} and ${patterns.length - 3} more`;
}

export function summarySentence(popup: PopupInput): string {
  const { trigger, pages, devices, showAgainDays } = popup;
  const when =
    trigger.type === "scroll"
      ? `Opens when a visitor scrolls ${trigger.scrollPercent}% down the page`
      : trigger.type === "exit"
        ? "Opens when a visitor is about to leave"
        : trigger.delaySeconds
          ? `Opens ${trigger.delaySeconds} ${trigger.delaySeconds === 1 ? "second" : "seconds"} after a visitor arrives`
          : "Opens as soon as the page loads";
  const where =
    pages.mode === "include" && pages.patterns.length
      ? ` on ${listPaths(pages.patterns)}`
      : pages.mode === "exclude" && pages.patterns.length
        ? ` on every page except ${listPaths(pages.patterns)}`
        : " on every page";
  const device = devices === "desktop" ? " on desktop" : devices === "mobile" ? " on phones" : "";
  const often =
    showAgainDays === 0 ? "once per visit" : showAgainDays === 1 ? "at most once a day" : `at most once every ${showAgainDays} days`;
  return `${when}${where}${device}, ${often}. Anyone who submits never sees it again.`;
}
