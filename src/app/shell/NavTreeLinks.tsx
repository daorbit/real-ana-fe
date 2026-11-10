import { Link, useNavigate } from "react-router-dom";
import { UnstyledButton } from "@mantine/core";
import type { LucideIcon } from "lucide-react";
import { prefetchRoute } from "@/app/routePrefetch";
import { isPlainLeftClick, transitionTo } from "@/app/viewTransition";
import classes from "./FavouriteLinks.module.css";

export type NavTreeLink = { key: string; to: string; label: string; icon: LucideIcon };

export function NavTreeLinks({ pathname, links, ariaLabel }: { pathname: string; links: NavTreeLink[]; ariaLabel: string }) {
  const navigate = useNavigate();

  return (
    <ul className={classes.tree} role="group" aria-label={ariaLabel}>
      {links.map(({ key, to, label, icon: Icon }) => {
        const active = pathname === to || pathname.startsWith(`${to}/`);
        return (
          <li key={key} className={classes.branch}>
            <UnstyledButton
              component={Link}
              to={to}
              className={classes.link}
              data-active={active || undefined}
              aria-current={active ? "page" : undefined}
              title={label}
              onClick={(e: React.MouseEvent) => {
                if (!isPlainLeftClick(e)) return;
                e.preventDefault();
                transitionTo(navigate, to);
              }}
              onMouseEnter={() => void prefetchRoute(to)}
              onFocus={() => void prefetchRoute(to)}
            >
              <Icon size={13} className={classes.icon} />
              <span className={classes.name}>{label}</span>
            </UnstyledButton>
          </li>
        );
      })}
    </ul>
  );
}
