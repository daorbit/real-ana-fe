import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import classes from "./Funnels.module.css";

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className={classes.back}>
      <ArrowLeft size={14} />
      {label}
    </Link>
  );
}
