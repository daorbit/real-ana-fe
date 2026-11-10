import { Link } from "react-router-dom";
import { ArrowUpRightIcon, CheckIcon, CircleCheckIcon, InfoIcon, LightbulbIcon, TriangleAlertIcon } from "lucide-react";
import type { DocBlock } from "../lib/whyQuantalog";
import classes from "./Doc.module.css";

const CALLOUT_ICONS = { note: InfoIcon, tip: LightbulbIcon, warn: TriangleAlertIcon };

function isInternal(href: string) {
  return href.startsWith("/");
}

function DocLink({ label, href, text }: { label: string; href: string; text: string }) {
  const body = (
    <>
      <span className={classes.linkLabel}>
        {label}
        <ArrowUpRightIcon size={15} className={classes.linkIcon} />
      </span>
      <span className={classes.linkText}>{text}</span>
    </>
  );
  return isInternal(href) ? (
    <Link to={href} className={classes.linkCard}>
      {body}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noreferrer" className={classes.linkCard}>
      {body}
    </a>
  );
}

function Block({ block }: { block: DocBlock }) {
  switch (block.kind) {
    case "p":
      return <p className={classes.p}>{block.text}</p>;
    case "h3":
      return <h3 className={classes.h3}>{block.text}</h3>;
    case "list":
      return (
        <ul className={classes.list}>
          {block.items.map((item) => (
            <li key={item} className={classes.listItem}>
              <CircleCheckIcon size={16} className={classes.bullet} />
              {item}
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className={classes.steps}>
          {block.items.map((step, i) => (
            <li key={step.title} className={classes.step}>
              <span className={classes.stepNumber}>{i + 1}</span>
              <div>
                <p className={classes.stepTitle}>{step.title}</p>
                <p className={classes.stepText}>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                {block.head.map((cell) => (
                  <th key={cell}>{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map(([need, ours, theirs]) => (
                <tr key={need}>
                  <td>{need}</td>
                  <td>
                    <span className={classes.ours}>
                      <CheckIcon size={14} className={classes.oursCheck} />
                      {ours}
                    </span>
                  </td>
                  <td>{theirs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout": {
      const Icon = CALLOUT_ICONS[block.tone];
      return (
        <div className={classes.callout} data-tone={block.tone}>
          <Icon size={17} className={classes.calloutIcon} />
          <div>
            <p className={classes.calloutTitle}>{block.title}</p>
            <p className={classes.calloutText}>{block.text}</p>
          </div>
        </div>
      );
    }
    case "links":
      return (
        <div className={classes.links}>
          {block.items.map((item) => (
            <DocLink key={item.label} {...item} />
          ))}
        </div>
      );
  }
}

export function DocBlocks({ blocks }: { blocks: DocBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </>
  );
}
