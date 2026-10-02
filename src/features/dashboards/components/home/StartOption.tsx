import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { UnstyledButton } from "@mantine/core";
import { ArrowRight } from "lucide-react";
import classes from "@/features/dashboards/components/home/Home.module.css";

export function StartOption({
  icon,
  title,
  text,
  cta,
  badge,
  to,
  onClick,
  primary = false,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  cta: string;
  badge?: string;
  to?: string;
  onClick?: () => void;
  primary?: boolean;
}) {
  const content = (
    <>
      {badge && <span className={classes.optionBadge}>{badge}</span>}
      <span className={classes.optionIcon}>{icon}</span>
      <span className={classes.optionTitle}>{title}</span>
      <span className={classes.optionText}>{text}</span>
      <span className={classes.optionCta}>{cta} <ArrowRight size={14} /></span>
    </>
  );

  if (to) {
    return (
      <UnstyledButton component={Link} to={to} className={classes.option} data-primary={primary || undefined}>
        {content}
      </UnstyledButton>
    );
  }

  return (
    <UnstyledButton className={classes.option} data-primary={primary || undefined} onClick={onClick}>
      {content}
    </UnstyledButton>
  );
}
