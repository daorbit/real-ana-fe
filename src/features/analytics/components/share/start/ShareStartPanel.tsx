import { Button, Text } from "@mantine/core";
import { EyeOff, Link2, Lock, RefreshCw, Share2, SlidersHorizontal } from "lucide-react";
import { StartHero, StartScreen } from "@/shared/ui/start/StartScreen";
import classes from "./ShareStart.module.css";

const CONTROLS = [
  {
    icon: SlidersHorizontal,
    title: "You pick every panel",
    text: "Turn sections on or off. Anything off is never sent to the public page at all.",
  },
  {
    icon: EyeOff,
    title: "Private stays private",
    text: "Site keys, workspace settings, team members and raw events are never shared.",
  },
  {
    icon: RefreshCw,
    title: "Replace or switch off any time",
    text: "Get a fresh link in one click, or turn sharing off and the old link stops working.",
  },
];

const BARS = [4, 5, 4, 6, 5, 7, 6, 8, 7, 8];

export function ShareStartPanel({
  workspace,
  busy,
  onEnable,
}: {
  workspace: string;
  busy: boolean;
  onEnable: () => void;
}) {
  return (
    <StartScreen>
      <StartHero
        id="share-start-title"
        icon={<Share2 size={28} />}
        title="Share a live dashboard with anyone"
        text={`Give clients or your team a read-only view of ${workspace || "this workspace"}'s traffic at a private link. No account needed, and the numbers stay live.`}
      >
        <Button size="md" color="emerald" leftSection={<Link2 size={16} />} loading={busy} onClick={onEnable}>
          Turn on public link
        </Button>
        <Text size="xs" c="dimmed" ta="center">
          You choose what's visible before you send it to anyone.
        </Text>
      </StartHero>

      <section className={classes.split} aria-label="How public dashboards work">
        <div className={classes.browserPane} aria-hidden>
          <div className={classes.browser}>
            <div className={classes.browserBar}>
              <span className={classes.dots}>
                <i />
                <i />
                <i />
              </span>
              <span className={classes.address}>
                <Lock size={10} />
                {window.location.host}/share/…
              </span>
            </div>
            <div className={classes.page}>
              <div className={classes.pageHead}>
                <span className={classes.pageLogo} />
                <span className={classes.pageName}>{workspace || "Your workspace"}</span>
                <span className={classes.live}>
                  <span className={classes.liveDot} />
                  Live
                </span>
              </div>
              <div className={classes.stats}>
                {["Visitors", "Pageviews", "Live now"].map((label) => (
                  <span key={label} className={classes.stat}>
                    <span className={classes.statValue} />
                    <span className={classes.statLabel}>{label}</span>
                  </span>
                ))}
              </div>
              <div className={classes.chart}>
                {BARS.map((h, i) => (
                  <span key={i} className={classes.bar} data-h={h} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={classes.controls}>
          <h3 className={classes.controlsTitle}>You stay in control</h3>
          <ul className={classes.controlList}>
            {CONTROLS.map(({ icon: Icon, title, text }) => (
              <li key={title} className={classes.control}>
                <span className={classes.controlIcon}>
                  <Icon size={16} />
                </span>
                <span className={classes.controlText}>
                  <span className={classes.controlTitle}>{title}</span>
                  <span className={classes.controlBody}>{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </StartScreen>
  );
}
