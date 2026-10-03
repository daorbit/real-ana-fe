import { ActionIcon } from "@mantine/core";
import { CircleCheck, CircleMinus, X } from "lucide-react";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import type { FoundLink, PageCheckResult as Result } from "../types";
import { pathOf } from "../utils/labels";
import { RelBadge } from "./LinkBadges";
import classes from "./Backlinks.module.css";

function Row({ domain, link, you }: { domain: string; link: FoundLink | null; you?: boolean }) {
  const Mark = link ? CircleCheck : CircleMinus;
  return (
    <div className={classes.resultRow} data-you={you || undefined}>
      <Mark size={16} className={classes.mark} data-found={link ? true : undefined} />
      <span className={classes.listMain}>
        <SiteFavicon domain={domain} size={16} />
        <span className={classes.domain}>{you ? `${domain} (you)` : domain}</span>
      </span>
      <span className={`${classes.anchor} ${classes.muted}`}>
        {link ? `"${link.anchorText || (link.isImage ? "image" : "no text")}" → ${pathOf(link.targetUrl)}` : "Not linked"}
      </span>
      {link ? <RelBadge rel={link.rel} /> : <span />}
    </div>
  );
}

export function PageCheckResult({ result, myDomain, onClose }: { result: Result; myDomain: string; onClose: () => void }) {
  const linked = result.competitors.filter((c) => c.link).length;
  const verdict = result.you
    ? "This page already links to you."
    : linked > 0
      ? `Links to ${linked} of your competitors but not to you. Worth reaching out.`
      : "Links to neither you nor your competitors.";

  return (
    <div className={classes.result}>
      <div className={classes.resultHead}>
        <span>
          <a className={classes.path} href={result.url} target="_blank" rel="noopener noreferrer">
            <span className={classes.pathText}>{result.url}</span>
          </a>
          {" · "}
          {verdict}
        </span>
        <ActionIcon variant="subtle" color="gray" size="sm" onClick={onClose} aria-label="Dismiss result">
          <X size={14} />
        </ActionIcon>
      </div>
      <Row domain={myDomain} link={result.you} you />
      {result.competitors.map((c) => (
        <Row key={c.competitorId} domain={c.label || c.domain} link={c.link} />
      ))}
    </div>
  );
}
