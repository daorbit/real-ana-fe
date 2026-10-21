import { UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useAdminToolsAccess } from "@/features/auth/context";
import { adminGroupsFor, type AdminSectionId } from "../../lib/adminSections";
import classes from "./AdminLayout.module.css";

export function AdminNav({ active, onSelect }: { active: AdminSectionId; onSelect: (id: AdminSectionId) => void }) {
  const { t } = useTranslation();
  const groups = adminGroupsFor(useAdminToolsAccess());

  return (
    <nav className={classes.nav} aria-label={t("nav.adminTools", "Admin tools")}>
      {groups.map((group) => (
        <div key={group.label} className={classes.group} role="group" aria-label={group.label}>
          <span className={classes.groupLabel}>{group.label}</span>
          {group.sections.map(({ id, label, icon: Icon, tone }) => (
            <UnstyledButton
              key={id}
              className={classes.item}
              data-active={id === active || undefined}
              aria-current={id === active ? "page" : undefined}
              onClick={() => onSelect(id)}
            >
              <span className={classes.tile} data-tone={tone} aria-hidden>
                <Icon size={14} strokeWidth={2.2} />
              </span>
              {label}
            </UnstyledButton>
          ))}
        </div>
      ))}
    </nav>
  );
}
