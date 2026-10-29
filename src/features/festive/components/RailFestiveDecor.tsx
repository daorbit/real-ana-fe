import { isDiwaliSeason } from "../lib/season";
import { FestiveFirework } from "./FestiveFirework";
import { FestiveLights } from "./FestiveLights";
import classes from "./Festive.module.css";

const SEASON_ON = isDiwaliSeason();

export function RailFestiveDecor() {
  if (!SEASON_ON) return null;

  return (
    <div className={classes.decor} aria-hidden="true">
      <FestiveLights />
      <FestiveFirework tone="gold" className={classes.burstA} />
      <FestiveFirework tone="rose" className={classes.burstB} />
      <FestiveFirework tone="marigold" className={classes.burstC} />
    </div>
  );
}
