import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { prefetchRoute } from "@/app/routePrefetch";
import classes from "./MobileMoreSheet.module.css";

export function isActivePath(pathname: string, to: string): boolean {
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function MobileNavRow({
  to,
  label,
  icon,
  active,
  child,
}: {
  to: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  child?: boolean;
}) {
  return (
    <Link
      to={to}
      className={classes.row}
      data-active={active || undefined}
      data-child={child || undefined}
      aria-current={active ? "page" : undefined}
      onTouchStart={() => void prefetchRoute(to)}
      onFocus={() => void prefetchRoute(to)}
    >
      <span className={classes.icon}>{icon}</span>
      <span className={classes.label}>{label}</span>
      <ChevronRight size={16} className={classes.chevron} />
    </Link>
  );
}
