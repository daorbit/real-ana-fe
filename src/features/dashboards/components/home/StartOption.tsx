import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { UnstyledButton } from "@mantine/core";
import { ArrowRight } from "lucide-react";
import classes from "@/features/dashboards/components/home/Home.module.css";

export function StartOption({
  icon,
  title,
  text,
  to,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  to?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className={classes.altIcon}>{icon}</span>
      <span className={classes.altBody}>
        <span className={classes.altTitle}>{title}</span>
        <span className={classes.altText}>{text}</span>
      </span>
      <ArrowRight size={16} className={classes.altArrow} />
    </>
  );

  if (to) {
    return (
      <UnstyledButton component={Link} to={to} className={classes.alt}>
        {content}
      </UnstyledButton>
    );
  }

  return (
    <UnstyledButton className={classes.alt} onClick={onClick}>
      {content}
    </UnstyledButton>
  );
}
