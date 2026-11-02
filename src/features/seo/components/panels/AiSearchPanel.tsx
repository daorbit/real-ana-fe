import { Anchor, Text } from "@mantine/core";
import type { AiCrawlerAccess, SeoAiSearch } from "@/shared/types";
import { scoreLabel } from "@/features/seo/components/ScoreRing";
import { Empty } from "@/features/seo/components/shared/Panel";
import { Gauge } from "@/features/seo/components/shared/Gauge";
import { SeoCard } from "@/features/seo/components/shared/SeoCard";
import { Pill, SeverityIcon, StatusMark } from "@/features/seo/components/shared/Pill";
import { ListHead, ListRow, ListTitle, SeoList } from "@/features/seo/components/shared/SeoList";
import { scoreTone, type Tone } from "@/features/seo/components/shared/tone";
import { bandHex } from "@/features/seo/components/utils";
import sharedClasses from "@/features/seo/components/shared/seoUi.module.css";
import classes from "./site/site.module.css";

const PURPOSE: Record<AiCrawlerAccess["purpose"], string> = {
  answers: "Cites pages in live answers",
  training: "Trains a model",
  both: "Search and AI answers",
};

function accessTone(c: AiCrawlerAccess): Tone {
  if (c.allowed) return "good";
  return c.purpose === "training" ? "neutral" : "bad";
}

export function AiSearchPanel({ aiSearch }: { aiSearch?: SeoAiSearch | null }) {
  if (!aiSearch) {
    return <Empty>This report predates the AI search check. Run a new audit to see how answer engines read this page.</Empty>;
  }

  const { crawlers, llmsTxt, answerReadiness: ready, findings, score } = aiSearch;
  const blocked = crawlers.filter((c) => !c.allowed && c.purpose !== "training");
  const checks = [
    { label: "Enough substance to summarise", ok: ready.wordCount >= 300, state: `${ready.wordCount} words` },
    { label: "Question headings", ok: ready.questionHeadings > 0, state: `${ready.questionHeadings} found` },
    { label: "Organization or WebSite schema", ok: ready.hasOrganizationSchema },
    { label: "Article schema", ok: ready.hasArticleSchema },
    { label: "FAQ or Q&A schema", ok: ready.hasFaqSchema },
    { label: "Machine-readable author", ok: ready.hasAuthor },
    { label: "Publish or update date", ok: ready.hasDate },
  ];

  return (
    <div className={classes.stack}>
      <div className="seo-bento">
        <SeoCard className={`col-4 ${classes.readiness}`}>
          <Gauge value={score} size={112} thickness={10} color={bandHex(score)}>
            <Text className="g-num" fz={32}>{score}</Text>
          </Gauge>
          <span className={sharedClasses.cardTitle}>AI readiness</span>
          <Pill tone={scoreTone(score)}>{scoreLabel(score)}</Pill>
          <p className={`${classes.readinessText} ${blocked.length ? classes.readinessBlocked : ""}`}>
            {blocked.length
              ? `robots.txt blocks ${blocked.map((c) => c.agent).join(", ")}, so this page cannot be quoted in their answers.`
              : "Crawler access is most of this score. Structure helps answer engines quote what they find."}
          </p>
        </SeoCard>

        <SeoList className="col-8">
          <ListTitle>Answer readiness</ListTitle>
          {checks.map((c) => (
            <ListRow
              key={c.label}
              lead={<StatusMark ok={c.ok} />}
              title={c.label}
              aside={c.state ? <span className={sharedClasses.rowMeta}>{c.state}</span> : undefined}
            />
          ))}
          {ready.quotableSchemaTypes.length > 0 && (
            <div className={classes.chips}>
              {ready.quotableSchemaTypes.map((t) => (
                <Pill key={t} tone="good" mono>{t}</Pill>
              ))}
            </div>
          )}
        </SeoList>
      </div>

      <SeoList>
        <ListHead>
          <span className={classes.colPath}>Crawler</span>
          <span className={classes.colGrow}>Used for</span>
          <span className={classes.colStatus}>Access</span>
        </ListHead>
        {crawlers.map((c) => (
          <div key={c.agent} className={sharedClasses.row}>
            <span className={`${classes.colPath} ${sharedClasses.rowMain}`}>
              <span className={sharedClasses.rowTitle}>{c.label}</span>
              <span className={`${sharedClasses.rowSub} ${sharedClasses.mono}`}>
                {c.agent}
                {c.explicit ? "" : " · via *"}
              </span>
            </span>
            <span className={`${classes.colGrow} ${sharedClasses.rowSub}`}>{PURPOSE[c.purpose]}</span>
            <span className={classes.colStatus}>
              <Pill tone={accessTone(c)}>{c.allowed ? "Allowed" : "Blocked"}</Pill>
            </span>
          </div>
        ))}
      </SeoList>

      <SeoList>
        <ListRow
          lead={<StatusMark ok={llmsTxt.present} tone={llmsTxt.present ? "good" : "neutral"} />}
          title={llmsTxt.present ? llmsTxt.title || "llms.txt" : "No llms.txt file"}
          sub={
            llmsTxt.present ? (
              <Anchor href={llmsTxt.url} target="_blank" rel="noopener noreferrer" size="xs">
                {llmsTxt.url}
              </Anchor>
            ) : (
              "An optional file pointing AI assistants at the pages you want quoted."
            )
          }
          aside={
            llmsTxt.present ? (
              <span className={sharedClasses.rowMeta}>
                {llmsTxt.linkCount} link{llmsTxt.linkCount === 1 ? "" : "s"}
              </span>
            ) : (
              <Pill>Optional</Pill>
            )
          }
        />
      </SeoList>

      {findings.length > 0 && (
        <SeoList>
          <ListTitle>What to change</ListTitle>
          {findings.map((f, i) => (
            <ListRow key={`${f.severity}-${i}`} top lead={<SeverityIcon severity={f.severity} />} title={f.message} />
          ))}
        </SeoList>
      )}
    </div>
  );
}
