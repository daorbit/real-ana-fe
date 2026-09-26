import { Button, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { RefreshCcw, Sparkles } from "lucide-react";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import classes from "./searchConsole.module.css";

export type ConnectVariant = "connect" | "ask-admin" | "upgrade" | "not-configured" | "reconnect";

const COPY: Record<ConnectVariant, { title: string; body: string }> = {
  connect: {
    title: "Connect Google Search Console",
    body: "See the clicks, impressions, average position and exact search queries Google reports for this site. Read-only — Quantalog can't change anything in your Search Console.",
  },
  "ask-admin": {
    title: "Search Console isn't connected",
    body: "A workspace admin can connect Google Search Console to show clicks, impressions and the queries people search for.",
  },
  upgrade: {
    title: "Search Console is on paid plans",
    body: "Upgrade this workspace to see Google's clicks, impressions, average position and top queries for your sites.",
  },
  "not-configured": {
    title: "Search Console isn't available yet",
    body: "Google Search Console hasn't been set up on this deployment. An administrator needs to add the Google credentials.",
  },
  reconnect: {
    title: "Reconnect Search Console",
    body: "Google access for this workspace stopped working. Reconnect to keep seeing search data.",
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

  return (
    <div className={classes.connect}>
      <span className={classes.connectMark}>
        <GoogleMark size={24} />
      </span>
      <Text fw={650} size="md">
        {copy.title}
      </Text>
      <Text className={classes.connectText}>{message || copy.body}</Text>

      {(variant === "connect" || variant === "reconnect") && onConnect && (
        <Button
          mt={6}
          variant="default"
          leftSection={variant === "reconnect" ? <RefreshCcw size={15} /> : <GoogleMark size={16} />}
          loading={connecting}
          onClick={onConnect}
        >
          {variant === "reconnect" ? "Reconnect Google" : "Connect with Google"}
        </Button>
      )}

      {variant === "upgrade" && (
        <Button mt={6} component={Link} to="/app/billing" leftSection={<Sparkles size={15} />}>
          See plans
        </Button>
      )}
    </div>
  );
}
