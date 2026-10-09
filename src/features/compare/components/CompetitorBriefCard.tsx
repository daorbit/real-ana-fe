import { useEffect, useState } from "react";
import { Alert, Button, Skeleton, Tooltip } from "@mantine/core";
import { RefreshCw, Info } from "lucide-react";
import type { SeoCompetitorBrief } from "@/shared/types";
import { useGetCompetitorBriefMutation } from "@/app/store";
import { notifyError } from "@/shared/lib/notify";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import "@/shared/ui/RunningDialog.css";
import classes from "./Brief.module.css";

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className={classes.sectionTitle}>{title}</div>
      <p className={classes.sectionBody}>{body}</p>
    </div>
  );
}

export function CompetitorBriefCard({
  workspaceId,
  siteId,
  competitorId,
  label,
  recommendations,
  briefAvailable,
}: {
  workspaceId: string;
  siteId: string;
  competitorId: string;
  label: string;
  recommendations: string[];
  briefAvailable: boolean;
}) {
  const [generate, { isLoading }] = useGetCompetitorBriefMutation();
  const [brief, setBrief] = useState<SeoCompetitorBrief | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    setBrief(null);
    setFailed(null);
  }, [competitorId]);

  const run = async () => {
    setFailed(null);
    try {
      const result = await generate({ workspaceId, siteId, competitorId }).unwrap();
      setBrief(result.brief);
    } catch (e) {
      const message =
        typeof e === "object" && e && "data" in e
          ? String((e.data as { error?: string })?.error ?? "The briefing could not be generated")
          : "The briefing could not be generated";
      setFailed(message);
      notifyError(e, "Briefing failed");
    }
  };

  return (
    <section className={`${classes.card} glass`}>
      <div className={classes.body}>
        <div className={classes.head}>
          <div className={classes.titleRow}>
            <OrbitMark size={18} />
            <h3 className={classes.title}>What would close the gap</h3>
            {briefAvailable && (
              <Tooltip
                label="Orbit is given only the measured numbers. It is not told anything else about this competitor, and cannot see their traffic, rankings or backlinks."
                withArrow
                multiline
                w={290}
              >
                <Info size={13} className={classes.hint} />
              </Tooltip>
            )}
          </div>
          {!briefAvailable ? null : brief ? (
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              leftSection={<RefreshCw size={13} />}
              loading={isLoading}
              onClick={run}
            >
              Regenerate
            </Button>
          ) : (
            <Button
              size="xs"
              variant="light"
              color="emerald"
              leftSection={<OrbitMark size={14} />}
              loading={isLoading}
              onClick={run}
            >
              Read the gap
            </Button>
          )}
        </div>

        {isLoading && (
          <div className={`${classes.stack} orbit-thinking`}>
            <Skeleton height={12} radius="sm" width="70%" animate={false} />
            <Skeleton height={34} radius="sm" animate={false} />
            <Skeleton height={34} radius="sm" animate={false} />
            <Skeleton height={12} radius="sm" width="55%" animate={false} />
          </div>
        )}

        {!isLoading && failed && (
          <Alert color="orange" variant="light" radius="md" p="sm">
            {failed}
          </Alert>
        )}

        {!isLoading && !failed && brief && (
          <div className={classes.stack}>
            <p className={classes.headline}>{brief.headline}</p>
            <Section title={`What ${label} is optimising for`} body={brief.theirStrategy} />
            <Section title="The move worth making first" body={brief.topMove} />
            <Section title="Where you are already ahead" body={brief.yourEdge} />
            <p className={classes.foot}>Orbit's reading of the measured comparison. Check it against the numbers before acting.</p>
          </div>
        )}

        {!isLoading && !failed && !brief && (
          <div className={classes.stack}>
            <ol className={classes.list}>
              {recommendations.map((rec, i) => (
                <li key={i} className={classes.item}>
                  <span className={classes.num}>{i + 1}</span>
                  <span className={classes.itemText}>{rec}</span>
                </li>
              ))}
            </ol>
            <p className={classes.foot}>
              {briefAvailable
                ? "Measured from the comparison. Ask Orbit to read what they add up to."
                : "Measured from the comparison."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
