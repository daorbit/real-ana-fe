import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { UnstyledButton } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";
import classes from "./StartScreen.module.css";

export function StartScreen({ children }: { children: ReactNode }) {
  return <div className={classes.start}>{children}</div>;
}

export function StartHero({
  id,
  icon,
  title,
  text,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  text: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className={classes.hero} aria-labelledby={id}>
      <div className={classes.heroGrid} aria-hidden />
      <div className={classes.heroMain}>
        <span className={classes.heroMark} aria-hidden>
          {icon}
        </span>
        <h2 id={id} className={classes.heroTitle}>{title}</h2>
        <p className={classes.heroText}>{text}</p>
        {children && <div className={classes.heroBody}>{children}</div>}
      </div>
    </section>
  );
}

export function StartChips({
  label,
  items,
  active,
  onPick,
}: {
  label?: string;
  items: { label: string; value: string }[];
  active?: string;
  onPick: (value: string) => void;
}) {
  return (
    <div className={classes.chips}>
      {label && <span className={classes.chipsLabel}>{label}</span>}
      {items.map((item) => (
        <UnstyledButton
          key={item.value}
          className={classes.chip}
          data-active={active === item.value || undefined}
          onClick={() => onPick(item.value)}
        >
          {item.label}
        </UnstyledButton>
      ))}
    </div>
  );
}

export function StartSection({
  id,
  title,
  sub,
  columns = 4,
  children,
}: {
  id: string;
  title: string;
  sub?: string;
  columns?: 3 | 4;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id}>
      <div className={classes.sectionHead}>
        <h3 id={id} className={classes.sectionTitle}>{title}</h3>
        {sub && <p className={classes.sectionSub}>{sub}</p>}
      </div>
      <div className={classes.cards} data-columns={columns}>
        {children}
      </div>
    </section>
  );
}

export function StartSteps({
  label,
  steps,
}: {
  label: string;
  steps: { icon: ReactNode; title: string; text: ReactNode }[];
}) {
  return (
    <ol className={classes.steps} aria-label={label}>
      {steps.map((step, i) => (
        <li key={step.title} className={classes.step}>
          <span className={classes.stepTop}>
            <span className={classes.stepNumber}>{i + 1}</span>
            <span className={classes.stepIcon}>{step.icon}</span>
          </span>
          <span className={classes.stepTitle}>{step.title}</span>
          <span className={classes.stepText}>{step.text}</span>
        </li>
      ))}
    </ol>
  );
}

export function StartCard({
  icon,
  title,
  text,
  preview,
  meta,
  to,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  preview: ReactNode;
  meta?: ReactNode;
  to?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className={classes.cardPreview} aria-hidden>
        {preview}
      </span>
      <span className={classes.cardBody}>
        <span className={classes.cardHead}>
          <span className={classes.cardIcon}>{icon}</span>
          <span className={classes.cardTitle}>{title}</span>
          {(to || onClick) && <ArrowUpRight size={15} className={classes.cardArrow} />}
        </span>
        <span className={classes.cardText}>{text}</span>
        {meta && <span className={classes.cardMeta}>{meta}</span>}
      </span>
    </>
  );

  if (to) {
    return (
      <UnstyledButton component={Link} to={to} className={classes.card} data-interactive>
        {content}
      </UnstyledButton>
    );
  }

  if (onClick) {
    return (
      <UnstyledButton className={classes.card} data-interactive onClick={onClick}>
        {content}
      </UnstyledButton>
    );
  }

  return <article className={classes.card}>{content}</article>;
}
