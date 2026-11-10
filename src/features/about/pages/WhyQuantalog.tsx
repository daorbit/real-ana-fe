import { useState } from "react";
import { Button } from "@mantine/core";
import { CalendarIcon } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { useTitle } from "@/shared/lib/useTitle";
import { DemoCallModal } from "@/app/shell/DemoCallModal";
import { DocBlocks } from "../components/DocBlocks";
import { DocToc } from "../components/DocToc";
import { WHY_LEAD, WHY_SECTIONS, WHY_TITLE, WHY_UPDATED } from "../lib/whyQuantalog";
import classes from "../components/Doc.module.css";

export default function WhyQuantalog() {
  useTitle(WHY_TITLE);
  const [callOpen, setCallOpen] = useState(false);

  return (
    <AppShell>
      <PageHeader
        title={WHY_TITLE}
        description={WHY_LEAD}
        actions={
          <Button radius={10} leftSection={<CalendarIcon size={16} />} onClick={() => setCallOpen(true)}>
            Book a demo
          </Button>
        }
      />

      <div className={classes.layout}>
        <article className={classes.article}>
          <p className={classes.updated}>{WHY_UPDATED}</p>
          {WHY_SECTIONS.map((section, i) => (
            <section key={section.id} id={section.id} className={classes.section}>
              <h2 className={classes.h2}>
                <span className={classes.h2Number}>{String(i + 1).padStart(2, "0")}</span>
                {section.title}
              </h2>
              <DocBlocks blocks={section.blocks} />
            </section>
          ))}
        </article>
        <DocToc sections={WHY_SECTIONS} />
      </div>

      <DemoCallModal opened={callOpen} onClose={() => setCallOpen(false)} />
    </AppShell>
  );
}
