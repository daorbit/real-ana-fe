import { useState } from "react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { OrbitChatComposer } from "@/features/searchConsole/components/OrbitChatComposer";
import { StudioSuggestions } from "@/features/dashboards/components/studio/StudioSuggestions";
import { ORBIT_STARTERS } from "@/features/dashboards/orbitStarters";
import classes from "@/features/dashboards/components/home/Home.module.css";

export function OrbitBanner({ onStart }: { onStart: (prompt?: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <section className={classes.banner} aria-labelledby="orbit-banner-title">
      <div className={classes.bannerMain}>
        <h2 id="orbit-banner-title" className={classes.bannerTitle}>Build a dashboard with Orbit AI</h2>
        <p className={classes.bannerText}>Say what you want to track. Orbit picks the widgets and lays them out.</p>

        <div className={classes.bannerComposer}>
          <OrbitChatComposer
            variant="hero"
            value={value}
            onChange={setValue}
            onSend={() => value.trim() && onStart(value)}
            onStop={() => undefined}
            thinking={false}
            started={false}
            placeholder="e.g. A weekly report on organic traffic and Google rankings"
            disclaimer="You review everything before it's created."
          />
        </div>

        <StudioSuggestions align="start" starters={ORBIT_STARTERS.create} onPick={onStart} />
      </div>

      <div className={classes.bannerArt} aria-hidden>
        <OrbitMark size={200} />
      </div>
    </section>
  );
}
