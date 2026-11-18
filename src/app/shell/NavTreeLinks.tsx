import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UnstyledButton } from "@mantine/core";
import type { LucideIcon } from "lucide-react";
import { prefetchRoute } from "@/app/routePrefetch";
import { isPlainLeftClick, transitionTo } from "@/app/viewTransition";
import classes from "./FavouriteLinks.module.css";

export type NavTreeLink = {
  key: string;
  to: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  trailing?: ReactNode;
  onIntent?: () => void;
};

export function NavTreeLinks({
  pathname,
  links,
  ariaLabel,
  footer,
}: {
  pathname: string;
  links: NavTreeLink[];
  ariaLabel: string;
  footer?: ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <ul className={classes.tree} role="group" aria-label={ariaLabel}>
      {links.map(({ key, to, label, icon: Icon, active: activeOverride, trailing, onIntent }) => {
        const active = activeOverride ?? (pathname === to || pathname.startsWith(`${to}/`));
        const intent = () => {
          void prefetchRoute(to);
          onIntent?.();
        };
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
              onMouseEnter={intent}
              onFocus={intent}
            >
              <Icon size={13} className={classes.icon} />
              <span className={classes.name}>{label}</span>
              {trailing}
            </UnstyledButton>
          </li>
        );
      })}
      {footer && <li className={classes.branch}>{footer}</li>}
    </ul>
  );
}
