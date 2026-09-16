import { useEffect, useState } from "react";
import { DeviceFrame, frameSize, getDevice, useFitScale } from "da-frame-set";
import { Starfield } from "@/shared/ui/Starfield";
import { BG_STYLES, readThemePrefs } from "@/shared/lib/theme";
import s from "./ThemePreview.module.css";

/**
 * The app as it will look under the theme being chosen, inside a laptop mock.
 *
 * Everything inside is painted from the same custom properties the real shell
 * reads, and every control in `AppearanceSection` writes those properties on
 * the document root the moment it's clicked — so this repaints with no props
 * and no subscription of its own.
 *
 * Bars and blocks rather than real widgets: a copy of the actual dashboard
 * would be unreadable at this size and would have to be kept in step with the
 * dashboard forever. Accent, background, radius and density are what these
 * controls change, and all four read fine as shapes.
 */

const FRAME_ID = "macbook-air" as const;

const NAV = ["Overview", "Realtime", "Pages", "Sources", "SEO"];

const STATS = [
  { label: "Visitors", value: "2,481" },
  { label: "Pageviews", value: "18.4k" },
  { label: "Avg. time", value: "3m 02s" },
];

/** Bar heights as percentages of the chart box. */
const BARS = [38, 62, 45, 80, 55, 92, 70];

/** Row widths as percentages, longest first. */
const ROWS = [72, 54, 38];

/**
 * The starfield backgrounds are the one preset CSS variables can't express on
 * their own — they need real elements, exactly as the app shell renders them.
 * `applyTheme` fires this event on every preference change.
 */
function useStarfieldPreset(): boolean {
  const read = () => BG_STYLES.find((b) => b.id === readThemePrefs().bg)?.kind === "stars";
  const [on, setOn] = useState(read);
  useEffect(() => {
    const sync = () => setOn(read());
    window.addEventListener("quantalog-theme-change", sync);
    return () => window.removeEventListener("quantalog-theme-change", sync);
  }, []);
  return on;
}

export function ThemePreview() {
  const stars = useStarfieldPreset();
  const size = frameSize(getDevice(FRAME_ID));
  const { ref, scale, measured } = useFitScale({
    contentWidth: size.width,
    contentHeight: size.height,
    padding: { x: 8, y: 8 },
  });

  return (
    <div className={s.stage} ref={ref} aria-hidden="true">
      <DeviceFrame device={FRAME_ID} scale={scale} hidden={!measured}>
        <div className={s.app}>
          <div className={s.bg}>{stars && <Starfield variant="app" count={40} />}</div>

          <div className={s.body}>
            <aside className={s.nav}>
              <div className={s.brand}>
                <span className={s.mark} />
                <span className={s.wordmark} />
              </div>
              {NAV.map((label, i) => (
                <div key={label} className={s.navItem} data-active={i === 0 || undefined}>
                  <span className={s.navIcon} />
                  <span className={s.navLabel}>{label}</span>
                </div>
              ))}
            </aside>

            <main className={s.main}>
              <div className={s.head}>
                <span className={s.title} />
                <span className={s.cta} />
              </div>

              <div className={s.stats}>
                {STATS.map((stat) => (
                  <div key={stat.label} className={`${s.card} ${s.stat}`}>
                    <span className={s.statLabel}>{stat.label}</span>
                    <span className={s.statValue}>{stat.value}</span>
                  </div>
                ))}
              </div>

              <div className={`${s.card} ${s.chart}`}>
                {BARS.map((h, i) => (
                  <span
                    key={i}
                    className={s.bar}
                    style={{ height: `${h}%` }}
                    data-lead={i === BARS.length - 2 || undefined}
                  />
                ))}
              </div>

              <div className={`${s.card} ${s.table}`}>
                {ROWS.map((w, i) => (
                  <div key={i} className={s.row}>
                    <span className={s.rowLabel} style={{ width: `${w * 0.55}%` }} />
                    <span className={s.rowBar} style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </DeviceFrame>
    </div>
  );
}
