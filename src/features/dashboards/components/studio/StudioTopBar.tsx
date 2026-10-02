import { Link } from "react-router-dom";
import { Button, Tooltip } from "@mantine/core";
import { ArrowLeft, Check, Plus } from "lucide-react";
import type { DashboardStudio } from "@/features/dashboards/hooks/useDashboardStudio";
import classes from "@/features/dashboards/components/studio/Studio.module.css";

export function StudioTopBar({
  studio,
  backTo,
  title,
  showActions,
}: {
  studio: DashboardStudio;
  backTo: string;
  title: string;
  showActions: boolean;
}) {
  const edit = studio.mode === "edit";

  return (
    <header className={classes.topBar}>
      <div className={classes.topLeft}>
        <Link to={backTo} className={classes.back} aria-label={edit ? "Back to the dashboard" : "Back to dashboards"}>
          <ArrowLeft size={16} />
        </Link>
        <div className={classes.topTitles}>
          <h1 className={classes.topTitle}>{title}</h1>
        </div>
      </div>

      {showActions && (
        <div className={classes.topActions}>
          {studio.orbit.started && (
            <Button variant="default" onClick={studio.startOver}>
              Start over
            </Button>
          )}
          {edit && (
            <Button component={Link} to={backTo} variant="default">
              Cancel
            </Button>
          )}
          <Tooltip
            label={edit ? "Ask Orbit for a change first" : "Wait for Orbit's first version"}
            withArrow
            disabled={studio.canSubmit}
          >
            <span>
              <Button
                color="emerald"
                leftSection={edit ? <Check size={15} /> : <Plus size={15} />}
                disabled={!studio.canSubmit}
                loading={studio.submitting}
                onClick={() => void studio.submit()}
              >
                {edit ? "Apply changes" : "Create dashboard"}
              </Button>
            </span>
          </Tooltip>
        </div>
      )}
    </header>
  );
}
