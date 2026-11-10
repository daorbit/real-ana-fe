import { Anchor } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import classes from "./picker.module.css";

export function PickerTopBar() {
  return (
    <div className={classes.topBar}>
      <Anchor component={Link} to="/app" size="sm" c="dimmed" className={classes.back}>
        <ArrowLeft size={14} /> Back to dashboard
      </Anchor>
    </div>
  );
}
