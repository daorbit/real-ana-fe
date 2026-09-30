import { Button, Text } from "@mantine/core";
import { Lock, ShieldCheck } from "lucide-react";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import classes from "./connect.module.css";

export type ConnectVariant = "connect" | "ask-admin" | "not-configured" | "reconnect";

const COPY: Record<ConnectVariant, { title: string; body: string }> = {
  connect: {
    title: "Connect Google Search Console",
    body: "See the searches that bring visitors, the pages that rank, and where you're climbing or slipping — straight from Google.",
  },
  "ask-admin": {
    title: "Search visibility isn't connected yet",
    body: "A workspace admin can connect Google Search Console to show clicks, impressions, rankings and the queries people search for.",
  },
  "not-configured": {
    title: "Search visibility isn't available yet",
    body: "Google Search Console hasn't been set up on this deployment. An administrator needs to add the Google credentials.",
  },
  reconnect: {
    title: "Sign in to Google again",
    body: "Your Google Search Console sign-in has expired. Sign in again to keep seeing search data — your linked properties and settings are kept.",
  },
};

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
        <span className={classes.mark} aria-hidden>
          <GoogleMark size={30} />
        </span>

        <Text component="h2" className={classes.title}>
          {copy.title}
        </Text>
        <Text className={classes.body}>{message || copy.body}</Text>

        {canConnect && (
          <Button
            size="md"
            variant="default"
            leftSection={<GoogleMark size={18} />}
            loading={connecting}
            onClick={onConnect}
            className={`${classes.cta} ${classes.googleButton}`}
            classNames={{ label: classes.googleLabel }}
          >
            {variant === "reconnect" ? "Sign in with Google" : "Connect with Google"}
          </Button>
        )}

        {canConnect && (
          <span className={classes.trust}>
            <ShieldCheck size={13} />
            Only sitemaps you submit are changed · Disconnect anytime
          </span>
        )}

        {variant === "ask-admin" && (
          <span className={classes.trust}>
            <Lock size={13} />
            Only workspace admins can connect Google accounts.
          </span>
        )}
      </div>
    </div>
  );
}
