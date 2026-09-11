import { DeviceFrame as FrameSet, frameSize as frameSetSize, getDevice } from "da-frame-set";

/** The one chassis the media preview draws. */
const FRAME_ID = "macbook-pro-16" as const;

/** Outer size of the mock, chassis included — what a fit-to-container scale measures against. */
export function frameSize(): { width: number; height: number } {
  return frameSetSize(getDevice(FRAME_ID));
}

interface Props {
  /** Shrinks the whole frame to fit the stage; the page inside still renders at full size. */
  scale: number;
  hidden?: boolean;
  children: React.ReactNode;
}

/** A MacBook Pro 16" mock around the previewed file, drawn by da-frame-set. */
export function DeviceFrame({ scale, hidden, children }: Props) {
  return (
    <FrameSet device={FRAME_ID} scale={scale} hidden={hidden}>
      {children}
    </FrameSet>
  );
}
