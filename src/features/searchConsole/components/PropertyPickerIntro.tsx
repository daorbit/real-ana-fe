import { Anchor, Text, UnstyledButton } from "@mantine/core";
import { Check, ExternalLink, Globe, Link2 } from "lucide-react";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import { PickerTopBar } from "./PickerTopBar";
import classes from "./picker.module.css";

export function PropertyPickerIntro({
  workspaceId,
  siteId,
  domain,
  googleEmail,
  onSwitchAccount,
  switching,
}: {
  workspaceId: string;
  siteId: string;
  domain: string;
  googleEmail: string;
  onSwitchAccount: () => void;
  switching: boolean;
}) {
  return (
    <div className={classes.intro}>
      <PickerTopBar workspaceId={workspaceId} siteId={siteId} />

      <ol className={classes.stepper}>
        <li className={classes.stepDone}>
          <span className={classes.stepDot}>
            <Check size={11} strokeWidth={3} />
          </span>
          Google connected
        </li>
        <li className={classes.stepLine} aria-hidden />
        <li className={classes.stepCurrent}>
          <span className={classes.stepDot}>2</span>
          Link a property
        </li>
      </ol>

      <div>
        <Text component="h2" className={classes.title}>
          Which Search Console property is <span className={classes.titleAccent}>{domain}</span>?
        </Text>
        <Text className={classes.lead}>
          Quantalog reads clicks, queries and index status from the property you pick. You can change it any time.
        </Text>
      </div>

      <div className={classes.account}>
        <GoogleMark size={16} />
        <span className={classes.accountText}>
          <span className={classes.accountLabel}>Signed in to Google as</span>
          <span className={classes.accountEmail}>{googleEmail || "your Google account"}</span>
        </span>
        <UnstyledButton className={classes.switch} onClick={onSwitchAccount} disabled={switching}>
          Switch account
        </UnstyledButton>
      </div>

      <div className={classes.guide}>
        <Text className={classes.guideTitle}>Which one should I pick?</Text>
        <div className={classes.guideRow}>
          <span className={classes.guideIcon}>
            <Globe size={14} />
          </span>
          <Text size="xs" c="dimmed">
            <b>Domain property</b> covers every subdomain and protocol — the most complete data.
          </Text>
        </div>
        <div className={classes.guideRow}>
          <span className={classes.guideIcon}>
            <Link2 size={14} />
          </span>
          <Text size="xs" c="dimmed">
            <b>URL-prefix property</b> covers only addresses starting with that exact URL.
          </Text>
        </div>
      </div>

      <Text size="xs" c="dimmed">
        Don't see your site?{" "}
        <Anchor href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" size="xs">
          Add it in Search Console <ExternalLink size={11} />
        </Anchor>
      </Text>
    </div>
  );
}
