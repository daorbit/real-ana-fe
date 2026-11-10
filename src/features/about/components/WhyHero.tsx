import { Link } from "react-router-dom";
import { Button } from "@mantine/core";
import { ArrowRightIcon, BookOpenIcon, CalendarIcon } from "lucide-react";
import { DOCS_BASE_URL } from "@/shared/lib/docsSlugs";
import { WHY_FACTS, WHY_HERO } from "../lib/whyQuantalog";
import classes from "./Why.module.css";

export function WhyHero({ onBookDemo }: { onBookDemo: () => void }) {
  return (
    <>
      <header className={classes.hero}>
        <span className={classes.eyebrow}>{WHY_HERO.eyebrow}</span>
        <h1 className={classes.heroTitle}>{WHY_HERO.title}</h1>
        <p className={classes.heroLead}>{WHY_HERO.lead}</p>
        <div className={classes.heroActions}>
          <Button radius={10} leftSection={<CalendarIcon size={16} />} onClick={onBookDemo}>
            Book a demo
          </Button>
          <Button component={Link} to="/app" variant="default" radius={10} rightSection={<ArrowRightIcon size={16} />}>
            Start free
          </Button>
          <Button
            component="a"
            href={DOCS_BASE_URL}
            target="_blank"
            rel="noreferrer"
            variant="default"
            radius={10}
            leftSection={<BookOpenIcon size={16} />}
          >
            Read the docs
          </Button>
        </div>
      </header>

      <div className={classes.facts}>
        {WHY_FACTS.map((fact) => (
          <div key={fact.value} className={classes.fact}>
            <span className={classes.factValue}>{fact.value}</span>
            <span className={classes.factLabel}>{fact.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
