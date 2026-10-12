import { useState } from "react";
import { InsetList, InsetRow } from "@/shared/ui/InsetList";
import type { AdminUser } from "@/shared/types";
import type { AdminUserActions } from "../../useAdminUserActions";
import { AdminUserAvatar } from "./AdminUserAvatar";
import { UserSheet } from "./UserSheet";
import classes from "../Admin.module.css";

interface Props {
  users: AdminUser[];
  fetching: boolean;
  actions: AdminUserActions;
}

export function UserMobileList({ users, fetching, actions }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = users.find((u) => u.id === selectedId) ?? null;

  return (
    <div className={classes.userList} data-fetching={fetching || undefined}>
      <InsetList>
        {users.map((u) => (
          <InsetRow
            key={u.id}
            onClick={() => setSelectedId(u.id)}
            leading={<AdminUserAvatar user={u} />}
            title={u.name}
            subtitle={u.email}
            trailing={<span className={classes.planTag} data-tone={planTone(u)}>{u.plan?.name ?? "No plan"}</span>}
            chevron
          />
        ))}
      </InsetList>

      <UserSheet user={selected} actions={actions} onClose={() => setSelectedId(null)} />
    </div>
  );
}

function planTone(u: AdminUser) {
  if (!u.plan) return "none";
  if (u.plan.expired) return "expired";
  return u.plan.slug === "pro" ? "pro" : "free";
}
