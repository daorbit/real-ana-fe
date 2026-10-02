import { Link } from "react-router-dom";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { OrbitChatComposer } from "@/features/searchConsole/components/OrbitChatComposer";
import { StudioSuggestions } from "@/features/dashboards/components/studio/StudioSuggestions";
import { ORBIT_STARTERS } from "@/features/dashboards/orbitStarters";
import type { DashboardStudio } from "@/features/dashboards/hooks/useDashboardStudio";
import classes from "@/features/dashboards/components/studio/Studio.module.css";

export function StudioLanding({ studio }: { studio: DashboardStudio }) {
  const { orbit } = studio;

  return (
    <div className={classes.landing}>
      <div className={classes.landingInner}>
        <div className={classes.landingHead}>
          <OrbitMark size={52} />
          <h2 className={classes.landingTitle}>What should your dashboard show?</h2>
          <p className={classes.landingText}>
            Describe who it's for and what you want to track. Orbit chooses the widgets and lays them out with
            your live data, and nothing is created until you say so.
          </p>
        </div>

        <OrbitChatComposer
          value={orbit.input}
          onChange={orbit.setInput}
          onSend={() => orbit.send()}
          onStop={orbit.stop}
          thinking={orbit.thinking}
          started={false}
          placeholder="e.g. A weekly report on organic traffic and Google rankings for a client"
          disclaimer="Orbit uses one question from your plan for each request."
        />

        <StudioSuggestions starters={ORBIT_STARTERS.create} onPick={(p) => orbit.send(p)} />

        <div className={classes.landingAlt}>
          Prefer to pick widgets yourself?
          <Link to="/app/dashboards/new" className={classes.altLink}>Browse templates</Link>
        </div>
      </div>
    </div>
  );
}
