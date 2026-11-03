import { Button } from "@mantine/core";
import { Lock, ShieldCheck } from "lucide-react";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import { StartHero, StartScreen } from "@/shared/ui/start/StartScreen";
import { SearchStartGuide } from "./start/SearchStartGuide";
import classes from "./connect.module.css";

export type ConnectVariant = "connect" | "ask-admin" | "not-configured" | "reconnect";

const COPY: Record<ConnectVariant, { title: string; body: string }> = {
  connect: {
    title: "See how people find you on Google",
    body: "Connect Google Search Console to see the searches that bring visitors in, where you rank for them, and which pages Google has indexed, right next to your traffic.",
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
    body: "Your Google Search Console sign-in has expired. Sign in again to keep seeing search data. Your linked properties and settings are kept.",
  },
};

const WITH_GUIDE: ConnectVariant[] = ["connect", "ask-admin"];

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
    <StartScreen>
      <StartHero id="search-connect-title" icon={<GoogleMark size={28} />} title={copy.title} text={message || copy.body}>
        {canConnect && (
          <Button
            size="md"
            radius="xl"
            variant="default"
            leftSection={<GoogleMark size={18} />}
            loading={connecting}
            onClick={onConnect}
            className={`${classes.cta} ${classes.googleButton}`}
          >
            {variant === "reconnect" ? "Sign in with Google" : "Connect Search Console"}
          </Button>
        )}

        {canConnect && (
          <span className={classes.trust}>
            <ShieldCheck size={13} />
            Data comes straight from Google · Only sitemaps you submit are changed · Disconnect anytime
          </span>
        )}

        {variant === "ask-admin" && (
          <span className={classes.trust}>
            <Lock size={13} />
            Only workspace admins can connect Google accounts.
          </span>
        )}
      </StartHero>

      {WITH_GUIDE.includes(variant) && <SearchStartGuide />}
    </StartScreen>
  );
}
