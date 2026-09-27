import { Button, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { Check, Lock, RefreshCcw, ShieldCheck, Sparkles } from "lucide-react";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import { SearchConsolePreview } from "./SearchConsolePreview";
import classes from "./connect.module.css";

export type ConnectVariant = "connect" | "ask-admin" | "upgrade" | "not-configured" | "reconnect";

const COPY: Record<ConnectVariant, { eyebrow: string; title: string; body: string }> = {
  connect: {
    eyebrow: "Google Search Console",
    title: "Know exactly how people find you on Google",
    body: "See the searches that bring visitors, the pages that rank, where you're climbing or slipping — and whether each page is even on Google.",
  },
  "ask-admin": {
    eyebrow: "Google Search Console",
    title: "Search visibility isn't connected yet",
    body: "A workspace admin can connect Google Search Console to show clicks, impressions, rankings and the queries people search for.",
  },
  upgrade: {
    eyebrow: "Paid plans",
    title: "Unlock your Google search performance",
    body: "Upgrade this workspace to see Google's clicks, impressions, rankings, top queries and page index status for every site.",
  },
  "not-configured": {
    eyebrow: "Google Search Console",
    title: "Search visibility isn't available yet",
    body: "Google Search Console hasn't been set up on this deployment. An administrator needs to add the Google credentials.",
  },
  reconnect: {
    eyebrow: "Connection lost",
    title: "Reconnect Google to keep your data flowing",
    body: "Google access for this workspace stopped working. Reconnect to keep seeing search data — nothing you've set up is lost.",
  },
};

const BENEFITS = [
  "Clicks, impressions, CTR and position — up to 16 months",
  "Opportunities: queries one push away from page 1",
  "Index status for any page, with Google's reason",
];

const STEPS = ["Sign in with Google", "Pick your property", "See your data instantly"];

export function SearchConsoleConnectCard({
  variant,
  message,
  onConnect,
  connecting = false,
}: {
  variant: ConnectVariant;
  message?: string;
  onConnect?: () => void;
  connecting?: boolean;
}) {
  const copy = COPY[variant];
  const canConnect = (variant === "connect" || variant === "reconnect") && onConnect;

  return (
    <div className={classes.hero}>
      <div className={classes.pitch}>
        <span className={classes.eyebrow}>
          <GoogleMark size={14} />
          {copy.eyebrow}
        </span>

        <Text component="h2" className={classes.title}>
          {copy.title}
        </Text>
        <Text className={classes.body}>{message || copy.body}</Text>

        {variant !== "not-configured" && (
          <ul className={classes.benefits}>
            {BENEFITS.map((b) => (
              <li key={b}>
                <span className={classes.benefitCheck}>
                  <Check size={12} strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>
        )}

        <div className={classes.actions}>
          {canConnect && (
            <Button
              size="md"
              variant="default"
              leftSection={variant === "reconnect" ? <RefreshCcw size={16} /> : <GoogleMark size={18} />}
              loading={connecting}
              onClick={onConnect}
              className={`${classes.cta} ${classes.googleButton}`}
              classNames={{ label: classes.googleLabel }}
            >
              {variant === "reconnect" ? "Reconnect Google" : "Connect with Google"}
            </Button>
          )}
          {variant === "upgrade" && (
            <Button size="md" component={Link} to="/app/billing" leftSection={<Sparkles size={16} />} className={classes.cta}>
              See plans
            </Button>
          )}
          {canConnect && (
            <span className={classes.trust}>
              <ShieldCheck size={14} />
              Read-only · Disconnect anytime
            </span>
          )}
        </div>

        {canConnect && variant === "connect" && (
          <ol className={classes.steps}>
            {STEPS.map((step, i) => (
              <li key={step}>
                <span className={classes.stepNum}>{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        )}

        {variant === "ask-admin" && (
          <span className={classes.trust}>
            <Lock size={13} />
            Only workspace admins can connect Google accounts.
          </span>
        )}
      </div>

      <div className={classes.visual}>
        <SearchConsolePreview />
      </div>
    </div>
  );
}
