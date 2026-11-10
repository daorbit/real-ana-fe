import { Button } from "@mantine/core";
import { BookOpenIcon, CalendarIcon } from "lucide-react";
import { DOCS_BASE_URL } from "@/shared/lib/docsSlugs";
import { WHY_FACTS, WHY_LEAD, WHY_TITLE, WHY_UPDATED } from "../lib/whyQuantalog";
import classes from "./Doc.module.css";

export function DocHero({ onBookDemo }: { onBookDemo: () => void }) {
  return (
    <header className={classes.hero}>
      <div className={classes.heroMain}>
        <span className={classes.eyebrow}>Guide · {WHY_UPDATED}</span>
        <h1 className={classes.heroTitle}>{WHY_TITLE}</h1>
        <p className={classes.heroLead}>{WHY_LEAD}</p>
        <div className={classes.heroActions}>
          <Button radius={10} leftSection={<CalendarIcon size={16} />} onClick={onBookDemo}>
            Book a demo
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
      </div>
      <dl className={classes.facts}>
        {WHY_FACTS.map((fact) => (
          <div key={fact.value} className={classes.fact}>
            <dt className={classes.factValue}>{fact.value}</dt>
            <dd className={classes.factLabel}>{fact.label}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
