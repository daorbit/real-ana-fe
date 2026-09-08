import { getDevice, type DeviceId as FrameDeviceId } from "da-frame-set";

export type DeviceId = "macbook" | "iphone";

export const DEVICE_ORDER: DeviceId[] = ["macbook", "iphone"];

interface DeviceEntry {
  label: string;
  frameId: FrameDeviceId;
}

export const DEVICES: Record<DeviceId, DeviceEntry> = {
  macbook: { label: "Desktop", frameId: "macbook-pro-16" },
  iphone: { label: "Mobile", frameId: "iphone-pro" },
};

export const frameId = (device: DeviceId): FrameDeviceId => DEVICES[device].frameId;

export const frameSpec = (device: DeviceId) => getDevice(frameId(device));
