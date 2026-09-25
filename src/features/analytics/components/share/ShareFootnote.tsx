import { ShieldCheck } from "lucide-react";
import classes from "./Share.module.css";

export function ShareFootnote({ title, body }: { title: string; body: string }) {
  return (
    <p className={classes.footnote}>
      <ShieldCheck size={14} className={classes.footnoteIcon} />
      <span>
        <strong>{title}:</strong> {body}
      </span>
    </p>
  );
}
