import { Link } from "react-router-dom";
import { Button, Text } from "@mantine/core";
import { FolderSearch, Images, MousePointerClick, Upload } from "lucide-react";
import { StartHero, StartScreen, StartSteps } from "@/shared/ui/start/StartScreen";
import { settingsPath } from "@/features/auth/components/settings/settingsSections";
import classes from "./MediaStart.module.css";

export function MediaStartPanel({
  canEdit,
  workspaceName,
  onUpload,
}: {
  canEdit: boolean;
  workspaceName: string;
  onUpload: () => void;
}) {
  return (
    <StartScreen>
      <StartHero
        id="media-start-title"
        icon={<Images size={28} />}
        title={canEdit ? "Your media library" : "No files yet"}
        text={
          canEdit
            ? `Upload images, video and files for ${workspaceName} once, then reuse them anywhere — social posts, your logo, your profile photo — without uploading again.`
            : "Nobody has uploaded anything to this workspace yet. Editors can add images, video and files here."
        }
      >
        {canEdit && (
          <div className={classes.drop}>
            <span className={classes.dropIcon}>
              <Upload size={20} />
            </span>
            <Text fw={600} size="sm">
              Drag files anywhere on this page
            </Text>
            <Button color="emerald" leftSection={<Upload size={15} />} onClick={onUpload}>
              Choose files
            </Button>
            <Text size="xs" c="dimmed">
              Images, video, PDFs and more · up to 25 MB each
            </Text>
          </div>
        )}
      </StartHero>

      <StartSteps
        label="How the media library works"
        steps={[
          {
            icon: <Upload size={18} />,
            title: "Upload once",
            text: "Drop in images, video and documents. Several at a time is fine.",
          },
          {
            icon: <MousePointerClick size={18} />,
            title: "Pick it anywhere",
            text: (
              <>
                Choose from the library in <Link to="/app/social">social posts</Link>,{" "}
                <Link to="/app/branding">branding</Link> and your{" "}
                <Link to={settingsPath("profile")}>profile photo</Link>.
              </>
            ),
          },
          {
            icon: <FolderSearch size={18} />,
            title: "Find it again",
            text: "Search by name, filter by images, video or files, and rename anything as it grows.",
          },
        ]}
      />
    </StartScreen>
  );
}
