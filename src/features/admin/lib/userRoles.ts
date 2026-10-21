import type { Role } from "@/shared/types";

export const ROLE_LABELS: Record<Role, string> = {
  user: "User",
  admin: "Admin",
  super_admin: "Super admin",
};

export const ROLE_OPTIONS: { role: Role; hint: string }[] = [
  { role: "user", hint: "Their own workspaces only" },
  { role: "admin", hint: "Staff account that can't be deleted or opened. No admin tools" },
  { role: "super_admin", hint: "Full control, including changing roles" },
];
