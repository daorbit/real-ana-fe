import { useState } from "react";
import { AppShell } from "@/app/AppShell";
import { useTitle } from "@/shared/lib/useTitle";
import { DemoCallModal } from "@/app/shell/DemoCallModal";
import { DocHero } from "../components/DocHero";
import { DocBlocks } from "../components/DocBlocks";
import { WHY_SECTIONS, WHY_TITLE } from "../lib/whyQuantalog";
import classes from "../components/Doc.module.css";

export default function WhyQuantalog() {
  useTitle(WHY_TITLE);
  const [callOpen, setCallOpen] = useState(false);

  return (
    <AppShell>
      <div className={classes.page}>
        <DocHero onBookDemo={() => setCallOpen(true)} />
        {WHY_SECTIONS.map((section, i) => (
          <section key={section.id} id={section.id} className={classes.section}>
            <div className={classes.sectionAside}>
              <span className={classes.sectionNumber}>{String(i + 1).padStart(2, "0")}</span>
              <h2 className={classes.h2}>{section.title}</h2>
            </div>
            <div className={classes.sectionBody}>
              <DocBlocks blocks={section.blocks} />
            </div>
          </section>
        ))}
      </div>
      <DemoCallModal opened={callOpen} onClose={() => setCallOpen(false)} />
    </AppShell>
  );
}
