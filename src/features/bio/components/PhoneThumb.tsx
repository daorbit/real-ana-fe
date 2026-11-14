import type { PublicBioPage } from "@/features/bio/types";
import { BioPageView } from "./BioPageView";
import classes from "./PhoneThumb.module.css";

export function PhoneThumb({ page, size = "lg", className }: { page: PublicBioPage; size?: "sm" | "lg"; className?: string }) {
  return (
    <div className={className ? `${classes.phone} ${className}` : classes.phone} data-size={size} aria-hidden inert>
      <div className={classes.screen}>
        <BioPageView page={page} variant="preview" />
      </div>
    </div>
  );
}
