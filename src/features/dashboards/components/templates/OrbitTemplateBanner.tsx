import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { AskOrbitSearchButton } from "@/features/searchConsole/components/AskOrbitSearchButton";
import classes from "@/features/dashboards/components/templates/Templates.module.css";

export function OrbitTemplateBanner({ onStart }: { onStart: () => void }) {
  return (
    <section className={classes.orbitBanner} aria-label="Build with Orbit AI">
      <span className={classes.orbitBannerMark}><OrbitMark size={22} /></span>
      <div className={classes.orbitBannerText}>
        <div className={classes.orbitBannerTitle}>Not finding the right fit?</div>
        <div className={classes.orbitBannerSub}>Describe the dashboard you need and Orbit lays it out with your live data.</div>
      </div>
      <AskOrbitSearchButton label="Build with Orbit" onClick={onStart} />
    </section>
  );
}
