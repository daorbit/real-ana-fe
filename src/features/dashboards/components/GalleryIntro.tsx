import { LayoutDashboard } from "lucide-react";
import { TEMPLATES } from "@/features/dashboards/templates";
import classes from "@/features/dashboards/components/Dashboards.module.css";

export function GalleryIntro({
  title,
  text,
  showCount = true,
}: {
  title: string;
  text: string;
  showCount?: boolean;
}) {
  return (
    <div className={classes.galleryIntro}>
      {showCount && (
        <span className={classes.galleryEyebrow}>
          <LayoutDashboard size={13} />
          {TEMPLATES.length} templates
        </span>
      )}
      <h2 className={classes.galleryTitle}>{title}</h2>
      <p className={classes.galleryText}>{text}</p>
    </div>
  );
}
