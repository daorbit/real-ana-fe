import { Button, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { BarChart3, FileSearch, Lock, RefreshCcw, Search, Sparkles, type LucideIcon } from "lucide-react";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import classes from "./connect.module.css";

export type ConnectVariant = "connect" | "ask-admin" | "upgrade" | "not-configured" | "reconnect";

const COPY: Record<ConnectVariant, { title: string; body: string }> = {
  connect: {
    title: "See how Google shows your site",
    body: "Connect Google Search Console to bring clicks, impressions, rankings and index status into Quantalog.",
  },
  "ask-admin": {
    title: "Search visibility isn't connected",
    body: "A workspace admin can connect Google Search Console to show clicks, impressions and the queries people search for.",
  },
  upgrade: {
    title: "Search visibility is on paid plans",
    body: "Upgrade this workspace to see Google's clicks, impressions, average position and top queries for your sites.",
  },
  "not-configured": {
    title: "Search visibility isn't available yet",
    body: "Google Search Console hasn't been set up on this deployment. An administrator needs to add the Google credentials.",
  },
  reconnect: {
    title: "Reconnect Search visibility",
    body: "Google access for this workspace stopped working. Reconnect to keep seeing search data.",
  },
};

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: BarChart3, title: "Performance", text: "Clicks, impressions, CTR and position over 16 months." },
  { icon: Search, title: "Queries & pages", text: "What people search and which pages Google shows." },
  { icon: FileSearch, title: "Index status", text: "Check any page is on Google, and why not if it isn't." },
];

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
    <div className={classes.card}>
      <div className={classes.hero}>
        <span className={classes.mark}>
          <GoogleMark size={26} />
        </span>
        <Text className={classes.title}>{copy.title}</Text>
        <Text className={classes.body}>{message || copy.body}</Text>

        {canConnect && (
          <Button
            size="md"
            mt={4}
            leftSection={variant === "reconnect" ? <RefreshCcw size={16} /> : <GoogleMark size={17} />}
            loading={connecting}
            onClick={onConnect}
            className={classes.cta}
          >
            {variant === "reconnect" ? "Reconnect Google" : "Connect with Google"}
          </Button>
        )}

        {variant === "upgrade" && (
          <Button size="md" mt={4} component={Link} to="/app/billing" leftSection={<Sparkles size={16} />}>
            See plans
          </Button>
        )}

        {canConnect && (
          <Text className={classes.note}>
            <Lock size={12} /> Read-only access. Quantalog can't change anything in Search Console.
          </Text>
        )}
      </div>

      {variant === "connect" && (
        <div className={classes.features}>
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className={classes.feature}>
                <span className={classes.featureIcon}>
                  <Icon size={16} />
                </span>
                <div>
                  <Text fw={650} size="sm">
                    {f.title}
                  </Text>
                  <Text size="xs" c="dimmed" mt={2}>
                    {f.text}
                  </Text>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
