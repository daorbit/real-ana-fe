export type PopupTrigger = "delay" | "scroll" | "exit";
export type PopupLayout = "modal" | "slide";
export type PopupDevices = "all" | "desktop" | "mobile";
export type PopupPageMode = "all" | "include" | "exclude";

export type PopupInput = {
  name: string;
  siteId: string;
  formId: string;
  formTitle: string;
  enabled: boolean;
  trigger: { type: PopupTrigger; delaySeconds: number; scrollPercent: number };
  layout: PopupLayout;
  showAgainDays: number;
  pages: { mode: PopupPageMode; patterns: string[] };
  devices: PopupDevices;
};

export type Popup = PopupInput & {
  id: string;
  stats: { views: number; submits: number };
  createdAt: string;
};

export type PopupsResponse = { popups: Popup[]; statsDays: number };

export type FormOption = { _id: string; title?: string; name?: string; status: string };
