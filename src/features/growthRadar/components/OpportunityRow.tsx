import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { shortDate } from "@/shared/lib/format";
import { CATEGORY_ICON, CATEGORY_LABEL } from "../lib/labels";
import { periodLabel, primaryOf } from "../lib/format";
import type { OpportunityCard } from "../types";
import { MetricChip } from "./MetricChip";
import { PriorityLabel } from "./PriorityLabel";
import { StatusText } from "./StatusText";
import rows from "./Rows.module.css";

export function OpportunityRow({ card, closed = false }: { card: OpportunityCard; closed?: boolean }) {
  const Icon = CATEGORY_ICON[card.category];
  const primary = primaryOf(card);

  return (
    <Link to={`/app/growth-radar/${card.id}`} className={rows.row}>
      <span className={rows.icon} aria-hidden>
        <Icon size={17} strokeWidth={2} />
      </span>
      <span className={rows.main}>
        <span className={rows.title}>{card.title}</span>
        <span className={rows.meta}>
          <span>{CATEGORY_LABEL[card.category]}</span>
          {card.entity.type !== "workspace" && <span>{card.entity.label}</span>}
          <span>{closed && card.closedAt ? `Closed ${shortDate(card.closedAt)}` : periodLabel(card.period)}</span>
        </span>
      </span>
      <span className={rows.aside}>
        {primary && <MetricChip metric={primary} />}
        <span className={rows.asideLine}>
          <StatusText card={card} />
          {!closed && <PriorityLabel level={card.priority} reason={card.priorityReason} />}
        </span>
      </span>
      <ChevronRight size={16} className={rows.chevron} aria-hidden />
    </Link>
  );
}

export function OpportunityGroup({ cards, closed = false }: { cards: OpportunityCard[]; closed?: boolean }) {
  return (
    <div className={rows.group}>
      {cards.map((card) => (
        <OpportunityRow key={card.id} card={card} closed={closed} />
      ))}
    </div>
  );
}
