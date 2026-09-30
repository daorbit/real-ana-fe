import { GalleryIntro } from "@/features/dashboards/components/GalleryIntro";
import { TemplateBrowser } from "@/features/dashboards/components/TemplateBrowser";
import classes from "@/features/dashboards/components/Dashboards.module.css";

export function DashboardsWelcome({ workspaceId, canEdit }: { workspaceId: string; canEdit: boolean }) {
  return (
    <div className={classes.gallery}>
      <GalleryIntro
        title="Build your first dashboard"
        text="Pick a starting layout and preview it before you commit. Every widget can be moved, resized or swapped later."
        showCount={false}
      />
      {canEdit ? (
        <TemplateBrowser workspaceId={workspaceId} />
      ) : (
        <p className={classes.galleryText}>Ask an editor in this workspace to create one.</p>
      )}
    </div>
  );
}
