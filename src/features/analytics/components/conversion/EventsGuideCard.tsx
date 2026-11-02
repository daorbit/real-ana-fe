import { Link } from "react-router-dom";
import { Button, CopyButton, Group } from "@mantine/core";
import { Check, Copy } from "lucide-react";
import { RankCard } from "@/shared/ui/rank/RankCard";
import classes from "./Conversion.module.css";

const SNIPPET = `rta.track("checkout_completed", {
  value: 2499,
  plan: "pro"
});`;

export function EventsGuideCard() {
  return (
    <RankCard title="Send an event" subtitle="One line of code" tone="violet">
      <p className={classes.guideText}>
        Call this from your site after a signup, purchase or any action you care about. Pass a value to see it as
        revenue here.
      </p>
      <pre className={classes.snippet}>{SNIPPET}</pre>
      <Group gap="sm" mt="md">
        <CopyButton value={SNIPPET}>
          {({ copied, copy }) => (
            <Button
              variant="default"
              size="sm"
              leftSection={copied ? <Check size={14} /> : <Copy size={14} />}
              onClick={copy}
            >
              {copied ? "Copied" : "Copy snippet"}
            </Button>
          )}
        </CopyButton>
        <Button component={Link} to="/app/developers" variant="subtle" size="sm">
          Events guide
        </Button>
      </Group>
    </RankCard>
  );
}
