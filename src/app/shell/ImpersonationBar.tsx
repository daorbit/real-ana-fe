import { useState } from "react";
import { UnstyledButton } from "@mantine/core";
import { Eye, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/context";
import { notify, errMessage } from "@/shared/lib/notify";
import classes from "./ImpersonationBar.module.css";

export function ImpersonationBar() {
  const { t } = useTranslation();
  const { user, exitImpersonation } = useAuth();
  const [leaving, setLeaving] = useState(false);

  if (!user?.impersonating) return null;

  const leave = async () => {
    setLeaving(true);
    try {
      await exitImpersonation();
      notify.info(t("nav.backToAccount"));
    } catch (e) {
      notify.error(errMessage(e, t("nav.exitImpersonationError")));
    } finally {
      setLeaving(false);
    }
  };

  return (
    <aside className={classes.card} role="status">
      <span className={classes.icon}>
        <Eye size={15} />
      </span>
      <span className={classes.text}>
        <span className={classes.title}>{t("nav.viewingAs")}</span>
        <span className={classes.email} title={user.email}>
          {user.email}
        </span>
      </span>
      <UnstyledButton className={classes.exit} onClick={() => void leave()} disabled={leaving}>
        <LogOut size={13} />
        {t("nav.exit")}
      </UnstyledButton>
    </aside>
  );
}
