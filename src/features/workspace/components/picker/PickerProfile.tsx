import { UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/context";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import classes from "./WorkspacePicker.module.css";

export function PickerProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const name = user?.firstName?.trim();

  return (
    <div className={classes.profile}>
      <UserAvatar
        src={user?.avatarUrl}
        size={76}
        radius="xl"
        className={classes.avatar}
        alt={name ?? ""}
      >
        <UserRound size={34} strokeWidth={1.6} />
      </UserAvatar>
      <span className={classes.greeting}>
        {name ? t("workspaces.picker.greeting", { name }) : t("workspaces.picker.greetingNoName")}
      </span>
    </div>
  );
}
