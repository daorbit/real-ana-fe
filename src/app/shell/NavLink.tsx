import { Link, useLocation } from "react-router-dom";
import { Text, Tooltip, UnstyledButton } from "@mantine/core";
import type { Home } from "lucide-react";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";

/**
 * One row of the rail.
 *
 * Collapsed it is an icon in a square target, and the label it loses moves
 * into a tooltip — a tooltip repeating text already on screen would be noise,
 * so it exists only in the state where the text does not.
 */
export function NavLink({
  to,
  label,
  icon: Icon,
  active,
  collapsed,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
  collapsed?: boolean;
}) {
  const location = useLocation();
  const { user } = useAuth();

  const link = (
    <UnstyledButton
      component={Link}
      to={to}
      className="nav-link"
      data-active={active}
      data-collapsed={collapsed || undefined}
      aria-current={active ? "page" : undefined}
      // Named explicitly: collapsed, the visible label is gone and the icon
      // alone is not a name anyone can read out.
      aria-label={collapsed ? label : undefined}
      // One choke point for every sidebar click — traces navigation across
      // the whole rail without wiring each destination page separately.
      onClick={() => trace(user?.id, "nav_clicked", location.pathname, to)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "8px 10px",
        marginBottom: 2,
        justifyContent: collapsed ? "center" : undefined,
        color: active ? "var(--text)" : "var(--text-2)",
      }}
    >
      <Icon size={17} style={{ flexShrink: 0, color: active ? "var(--violet-2)" : undefined }} />
      {!collapsed && (
        <Text size="sm" fw={active ? 600 : 500} truncate>
          {label}
        </Text>
      )}
    </UnstyledButton>
  );

  return collapsed ? (
    <Tooltip label={label} position="right" withArrow openDelay={200}>
      {link}
    </Tooltip>
  ) : (
    link
  );
}

/**
 * A rail row that is a button rather than a destination — search, the
 * workspace switch, leaving an impersonated session.
 *
 * Same shape as `NavLink` deliberately: collapsed they sit in the same column
 * as the links, and a row that looked different there would read as a control
 * that had escaped from somewhere else.
 */
export function NavAction({
  label,
  tooltip,
  icon: Icon,
  collapsed,
  color,
  onClick,
  disabled,
  mb,
}: {
  label: string;
  /** What the tooltip says, when it should say more than the label. */
  tooltip?: string;
  icon: typeof Home;
  collapsed?: boolean;
  color?: string;
  onClick?: () => void;
  disabled?: boolean;
  mb?: number;
}) {
  const button = (
    <UnstyledButton
      className="nav-link"
      data-collapsed={collapsed || undefined}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "8px 10px",
        marginBottom: mb,
        color: color ?? "var(--text-2)",
      }}
    >
      <Icon size={17} />
    </UnstyledButton>
  );

  return (
    <Tooltip label={tooltip ?? label} position="right" withArrow openDelay={200}>
      {button}
    </Tooltip>
  );
}
