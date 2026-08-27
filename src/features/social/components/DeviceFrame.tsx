import classes from "./DeviceFrame.module.css";

export type DeviceId = "macbook" | "iphone";

interface DeviceSpec {
  id: DeviceId;
  width: number;
  height: number;
  bezel: number;
  chromeBelow: number;
}

/** Bezels mirror each chassis's own padding in DeviceFrame.module.css. */
const DEVICE_SPECS: Record<DeviceId, DeviceSpec> = {
  macbook: { id: "macbook", width: 1152, height: 720, bezel: 9, chromeBelow: 14 },
  iphone: { id: "iphone", width: 402, height: 874, bezel: 10, chromeBelow: 0 },
};

/** The camera strip above the screen on the lid. */
const CAMERA_STRIP = 14;
/** How far the laptop's base sticks out past its lid on each side. */
const MACBOOK_BASE_OVERHANG = 26;

/** Outer size of the whole mock, chassis included — what the fit-to-stage scale measures against. */
export function frameSize(device: DeviceId): { width: number; height: number } {
  const spec = DEVICE_SPECS[device];
  const cameraStrip = device === "iphone" ? 0 : CAMERA_STRIP;
  const baseOverhang = device === "macbook" ? MACBOOK_BASE_OVERHANG * 2 : 0;
  return {
    width: spec.width + spec.bezel * 2 + baseOverhang,
    height: spec.height + spec.bezel * 2 + spec.chromeBelow + cameraStrip,
  };
}

interface Props {
  device: DeviceId;
  /** Shrinks the whole frame to fit the available space; the page inside still renders at full size. */
  scale: number;
  hidden?: boolean;
  children: React.ReactNode;
}

/**
 * A hardware mock around the previewed post.
 *
 * The screen renders at the device's true CSS viewport and is then scaled
 * down to fit — scaling the frame rather than narrowing it keeps the preview
 * honest at whatever room the pane has.
 */
export function DeviceFrame({ device, scale, hidden, children }: Props) {
  const spec = DEVICE_SPECS[device];
  const size = frameSize(device);
  const screenStyle = { width: spec.width, height: spec.height };

  return (
    <div
      className={classes.frame}
      style={{
        width: size.width * scale,
        height: size.height * scale,
        visibility: hidden ? "hidden" : undefined,
      }}
    >
      <div
        className={classes.inner}
        style={{ width: size.width, height: size.height, transform: `scale(${scale})` }}
      >
        {device === "macbook" && (
          <div key="macbook" className={`${classes.macbook} ${classes.chassis}`}>
            <div className={classes.macbookLid}>
              <div className={classes.macbookCamera} />
              <div className={`${classes.screen} ${classes.macbookScreen}`} style={screenStyle}>
                {children}
              </div>
            </div>
            <div className={classes.macbookBase} />
          </div>
        )}

        {device === "iphone" && (
          <div key="iphone" className={`${classes.iphone} ${classes.chassis}`}>
            <span className={`${classes.buttonLeft} ${classes.silenceSwitch}`} />
            <span className={`${classes.buttonLeft} ${classes.volumeUp}`} />
            <span className={`${classes.buttonLeft} ${classes.volumeDown}`} />
            <span className={classes.buttonRight} />
            <div className={classes.island} />
            <div className={`${classes.screen} ${classes.iphoneScreen}`} style={screenStyle}>
              {children}
            </div>
            <div className={classes.homeIndicator} />
          </div>
        )}
      </div>
    </div>
  );
}
