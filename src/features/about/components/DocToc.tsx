import { useEffect, useState } from "react";
import type { DocSection } from "../lib/whyQuantalog";
import classes from "./Doc.module.css";

export function DocToc({ sections }: { sections: DocSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  return (
    <nav className={classes.toc} aria-label="On this page">
      <p className={classes.tocTitle}>On this page</p>
      <ul className={classes.tocList}>
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={classes.tocLink}
              data-active={active === section.id || undefined}
              onClick={go(section.id)}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
