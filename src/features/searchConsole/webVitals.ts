import type { SearchVitalsDevice } from "@/shared/types";

const DEVICE_LABELS: Record<SearchVitalsDevice, string> = {
  mobile: "on mobile",
  desktop: "on desktop",
  all: "across all devices",
};

export function vitalsDeviceLabel(device: SearchVitalsDevice): string {
  return DEVICE_LABELS[device];
}
