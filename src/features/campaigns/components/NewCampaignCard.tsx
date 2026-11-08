import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import classes from "./CampaignCard.module.css";

export function NewCampaignCard() {
  return (
    <Link to="/app/campaigns/templates" className={classes.newCard}>
      <span className={classes.newIcon}>
        <Plus size={20} aria-hidden />
      </span>
      <span className={classes.newTitle}>New campaign</span>
      <span className={classes.newHint}>Start from a template</span>
    </Link>
  );
}
