import {
  DeviceFrame as FrameSet,
  frameSize as frameSetSize,
} from "da-frame-set";
import { DEVICE_ORDER, DEVICES, frameId, frameSpec, type DeviceId } from "./devices";

export type { DeviceId };
export { DEVICE_ORDER };

/** Kept for the device switch: the labels the picker shows. */
export const DEVICE_SPECS: Record<DeviceId, { id: DeviceId; label: string }> = {
  macbook: { id: "macbook", label: DEVICES.macbook.label },
  iphone: { id: "iphone", label: DEVICES.iphone.label },
};

/** Outer size of the mock for the given device, chassis included. */
export function frameSize(device: DeviceId): { width: number; height: number } {
  return frameSetSize(frameSpec(device));
}

interface Props {
  device: DeviceId;
  /** Shrinks the whole frame to fit the available space; the page inside still renders at full size. */
  scale: number;
  hidden?: boolean;
  children: React.ReactNode;
}

/** A hardware mock around the previewed post, drawn by da-frame-set. */
export function DeviceFrame({ device, scale, hidden, children }: Props) {
  return (
    <FrameSet device={frameId(device)} scale={scale} hidden={hidden}>
      {children}
    </FrameSet>
  );
}
