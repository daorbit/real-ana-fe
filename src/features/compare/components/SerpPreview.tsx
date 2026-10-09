import type { SeoCompareSnapshot } from "@/shared/types";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import classes from "./Compare.module.css";

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function displayUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "");
    return `${u.hostname.replace(/^www\./, "")}${path ? ` › ${path.split("/").filter(Boolean).join(" › ")}` : ""}`;
  } catch {
    return url;
  }
}

function Result({ who, snapshot }: { who: string; snapshot: SeoCompareSnapshot }) {
  const url = snapshot.finalUrl || snapshot.url;
  return (
    <div className={classes.serp}>
      <span className={classes.serpWho}>{who}</span>
      <div className={classes.serpUrl}>
        <SiteFavicon domain={url} size={14} />
        <span>{displayUrl(url)}</span>
      </div>
      <div className={classes.serpTitle} data-missing={!snapshot.title || undefined}>
        {snapshot.title ? clip(snapshot.title, TITLE_MAX) : "No title tag"}
      </div>
      <p className={classes.serpDesc} data-missing={!snapshot.description || undefined}>
        {snapshot.description
          ? clip(snapshot.description, DESCRIPTION_MAX)
          : "No meta description — Google writes its own snippet from the page."}
      </p>
      <div className={classes.serpMeta}>
        <span data-off={snapshot.titleLength < 30 || snapshot.titleLength > TITLE_MAX || undefined}>
          Title {snapshot.titleLength} chars
        </span>
        <span data-off={snapshot.descriptionLength < 70 || snapshot.descriptionLength > DESCRIPTION_MAX || undefined}>
          Description {snapshot.descriptionLength} chars
        </span>
      </div>
    </div>
  );
}

export function SerpPreview({
  mine,
  theirs,
  label,
}: {
  mine: SeoCompareSnapshot;
  theirs: SeoCompareSnapshot;
  label: string;
}) {
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div>
          <h3 className={classes.cardTitle}>What searchers see</h3>
          <p className={classes.cardSub}>
            The title and description each page actually ships, as a search result would show them. Google sometimes rewrites these.
          </p>
        </div>
      </div>
      <div className={classes.serpGrid}>
        <Result who="Your page" snapshot={mine} />
        <Result who={label} snapshot={theirs} />
      </div>
    </section>
  );
}
