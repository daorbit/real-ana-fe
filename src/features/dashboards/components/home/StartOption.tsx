import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { UnstyledButton } from "@mantine/core";
import { ArrowUpRight, LayoutGrid } from "lucide-react";
import { MiniWindow } from "@/features/dashboards/components/MiniWindow";
import type { DashboardTemplate } from "@/features/dashboards/templates";
import shared from "@/features/dashboards/components/Dashboards.module.css";
import classes from "@/features/dashboards/components/home/Home.module.css";

/** A ready-made layout, previewed, that opens its template preview. */
export function StartTemplate({ template, onOpen }: { template: DashboardTemplate; onOpen: () => void }) {
  const Icon = template.icon;

  return (
    <UnstyledButton className={`${classes.alt} ${shared.accent}`} data-accent={template.accent} onClick={onOpen}>
      <span className={classes.altPreview}>
        <MiniWindow layout={template.layout} limit={8} />
      </span>
      <span className={classes.altBody}>
        <span className={classes.altHead}>
          <span className={classes.altIcon}><Icon size={14} /></span>
          <span className={classes.altTitle}>{template.name}</span>
        </span>
        <span className={classes.altText}>{template.tagline}</span>
        <span className={classes.altMeta}>
          <LayoutGrid size={12} />
          {template.layout.length} widgets
          {template.category && <span className={classes.altDot}>·</span>}
          {template.category}
        </span>
      </span>
    </UnstyledButton>
  );
}

/** A start that is not a template: the blank canvas, or the full gallery. */
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
      <span className={classes.plainIcon}>{icon}</span>
      <span className={classes.plainTitle}>{title}</span>
      <span className={classes.plainText}>{text}</span>
      <ArrowUpRight size={16} className={classes.plainArrow} />
    </>
  );

  if (to) {
    return (
      <UnstyledButton component={Link} to={to} className={classes.plain}>
        {content}
      </UnstyledButton>
    );
  }

  return (
    <UnstyledButton className={classes.plain} onClick={onClick}>
      {content}
    </UnstyledButton>
  );
}
