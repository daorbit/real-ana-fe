import { Link } from "react-router-dom";
import { Tooltip } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import { TipText } from "@/shared/ui/InfoTip";
import { dateTime, timeAgo } from "@/shared/lib/format";
import type { WorkspaceMember } from "@/shared/types";
import type { useOpportunityActions } from "../../hooks/useOpportunityActions";
import { CATEGORY_ICON, CATEGORY_LABEL, ENTITY_SOURCE_LABEL } from "../../lib/labels";
import { NOT_DETECTED_HELP, SECTION_HELP } from "../../lib/help";
import { entityHref } from "../../lib/format";
import type { OpportunityDetail } from "../../types";
import { PriorityLabel } from "../PriorityLabel";
import { StatusText } from "../StatusText";
import { EvidencePanel } from "./EvidencePanel";
import { FactorList } from "./FactorList";
import { TextListPanel } from "./TextListPanel";
import { OwnerPanel } from "./OwnerPanel";
import { OutcomePanel } from "./OutcomePanel";
import { RadarNotes } from "./RadarNotes";
import { ActivityLog } from "./ActivityLog";
import { Panel } from "./Panel";
import classes from "../Opportunity.module.css";

type Actions = ReturnType<typeof useOpportunityActions>;

function MetaBar({ o }: { o: OpportunityDetail }) {
  const Icon = CATEGORY_ICON[o.category];
  return (
    <div className={classes.metaBar}>
      <PriorityLabel level={o.priority} reason={o.priorityReason} />
      <StatusText card={o} />
      <span className={classes.metaItem}>
        <Icon size={14} aria-hidden />
        {CATEGORY_LABEL[o.category]}
      </span>
      <Tooltip label={`First found ${dateTime(o.firstDetectedAt)}`} withArrow>
        <span className={classes.metaItem}>Found {timeAgo(o.firstDetectedAt)}</span>
      </Tooltip>
      <span className={classes.metaItem}>
        {o.detected ? (
          `Last seen ${timeAgo(o.lastDetectedAt)}`
        ) : (
          <TipText label={NOT_DETECTED_HELP}>Not seen in the latest check</TipText>
        )}
      </span>
    </div>
  );
}

export function OpportunityBody({
  opportunity,
  members,
  canEdit,
  actions,
}: {
  opportunity: OpportunityDetail;
  members: WorkspaceMember[];
  canEdit: boolean;
  actions: Actions;
}) {
  const o = opportunity;

  return (
    <>
      <MetaBar o={o} />
      <div className={classes.layout}>
        <div className={classes.main}>
          <Panel id="radar-noticed" title="What we noticed" help={SECTION_HELP.noticed}>
            <p className={classes.lead}>{o.summary}</p>
            {o.explainedBy === "orbit" && (
              <span className={classes.byline}>
                <TipText label={`${SECTION_HELP.orbit} Rule-based wording: ${o.templateSummary}`} width={320}>
                  Worded by Orbit
                </TipText>
              </span>
            )}
            <Link to={entityHref(o.entity)} className={classes.link}>
              {ENTITY_SOURCE_LABEL[o.entity.type]}
              <ChevronRight size={15} />
            </Link>
          </Panel>

          <EvidencePanel opportunity={o} />

          {o.whyItMatters && (
            <Panel id="radar-why" title="Why it matters" help={SECTION_HELP.why}>
              <p className={classes.body}>{o.whyItMatters}</p>
            </Panel>
          )}

          <TextListPanel id="radar-steps" title="What to check next" help={SECTION_HELP.steps} items={o.nextSteps} ordered />
          <TextListPanel id="radar-limits" title="What this can't tell you" help={SECTION_HELP.limits} items={o.limitations} />
        </div>

        <aside className={classes.side}>
          <FactorList priority={o.priority} factors={o.factors} />
          {(canEdit || o.assignee) && (
            <OwnerPanel
              assignee={o.assignee}
              members={members}
              canEdit={canEdit}
              busy={actions.busy}
              onChange={(assigneeId) => void actions.patch({ assigneeId }, assigneeId ? "Owner set" : "Owner removed")}
            />
          )}
          <OutcomePanel opportunity={o} canEdit={canEdit} busy={actions.recording} onRecord={actions.recordAction} />
          <RadarNotes notes={o.notes} canEdit={canEdit} busy={actions.noting} onAdd={actions.note} />
          <ActivityLog activity={o.activity} />
        </aside>
      </div>
    </>
  );
}
