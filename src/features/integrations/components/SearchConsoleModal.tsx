import { useMemo } from "react";
import { Badge, Button, Group, Text } from "@mantine/core";
import { Check, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSites } from "@/features/workspace/useSites";
import type { SearchConsoleStatus } from "@/shared/types";
import { IntegrationStudio } from "./studio/IntegrationStudio";
import { AsideBlock, SecureNote, StudioHero, StudioSection } from "./studio/StudioParts";
import { SitesTable } from "./searchConsole/SitesTable";
import { appGuideUrl } from "../lib/links";
import classes from "./SearchConsoleModal.module.css";

const SEARCH_VISIBILITY_PATH = "/app/search-visibility";

const GIVES_YOU = [
  "Clicks, impressions, CTR and average position over time",
  "The searches people use to find each site",
  "Which pages rank, and where they are climbing or slipping",
  "Sitemap status, and URL inspection for any page",
];

interface Props {
  opened: boolean;
  workspaceId: string;
  status: SearchConsoleStatus | undefined;
  busy: boolean;
  canManage: boolean;
  onClose: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

function Aside() {
  return (
    <>
      <AsideBlock label="What you get">
        <ul className={classes.list}>
          {GIVES_YOU.map((item) => (
            <li key={item}>
              <Check size={14} className={classes.check} />
              {item}
            </li>
          ))}
        </ul>
      </AsideBlock>
      <AsideBlock label="Security">
        <SecureNote>
          Quantalog reads your Search Console data and only changes sitemaps you submit from it. Tokens are encrypted,
          and disconnecting deletes the saved search data.
        </SecureNote>
      </AsideBlock>
    </>
  );
}

function ConnectedBody({
  workspaceId,
  status,
  expired,
  canManage,
}: {
  workspaceId: string;
  status: SearchConsoleStatus;
  expired: boolean;
  canManage: boolean;
}) {
  const { sites } = useSites(workspaceId);
  const webSites = useMemo(() => sites.filter((site) => site.platform !== "app"), [sites]);
  const links = useMemo(() => new Map(status.links.map((link) => [link.siteId, link.propertyUrl])), [status.links]);
  const linked = webSites.filter((site) => links.has(site._id)).length;

  return (
    <>
      <StudioHero
        state={expired ? "saved" : "live"}
        pill={expired ? "Sign-in expired" : undefined}
        title={expired ? "Sign in to Google again" : "Search Console is connected"}
        description={
          expired
            ? status.connection?.statusMessage ||
              "Your Google sign-in expired. Sign in again to keep seeing search data; your linked websites are kept."
            : linked === webSites.length && webSites.length > 0
              ? "Every website is linked. Search visibility shows Google data for all of them."
              : "Link each website to its Search Console property to see its search data in Search visibility."
        }
        stats={[
          { label: "Websites", value: webSites.length },
          { label: "Linked to Search Console", value: linked, tone: linked ? "ok" : undefined },
          {
            label: "Need a property",
            value: webSites.length - linked,
            tone: webSites.length - linked ? "warn" : undefined,
          },
        ]}
      />
      <SitesTable workspaceId={workspaceId} sites={webSites} links={links} canManage={canManage && !expired} />
    </>
  );
}

function DisconnectedBody({ canManage }: { canManage: boolean }) {
  return (
    <>
      <StudioHero
        state="off"
        title="Connect Google Search Console"
        description={
          canManage
            ? "See the searches that bring visitors, the pages that rank, and where you are climbing or slipping, straight from Google."
            : "Only workspace admins can connect Google Search Console. Ask an admin to connect it here."
        }
      />
      <StudioSection title="Google will ask you to allow" description="A Google window opens to finish the connection.">
        <Text size="sm" fw={550}>
          View and manage Search Console data for your verified sites
        </Text>
        <Text size="xs" c="dimmed" mt={4}>
          Use the Google account that is an owner or user of your properties in Search Console. Google sometimes shows
          this permission unticked; tick it before you continue.
        </Text>
      </StudioSection>
    </>
  );
}

export function SearchConsoleModal({
  opened,
  workspaceId,
  status,
  busy,
  canManage,
  onClose,
  onConnect,
  onDisconnect,
}: Props) {
  const navigate = useNavigate();
  const connection = status?.connection;
  const active = Boolean(status?.connected && connection?.status === "active");
  const expired = Boolean(connection) && !active;
  const openSearchVisibility = () => {
    onClose();
    navigate(SEARCH_VISIBILITY_PATH);
  };

  const footer = (
    <Group justify="space-between" wrap="nowrap">
      {canManage && (active || expired) ? (
        <Button type="button" variant="subtle" color="red" onClick={onDisconnect} disabled={busy}>
          Disconnect
        </Button>
      ) : (
        <Button type="button" variant="default" onClick={onClose}>
          {active ? "Close" : "Cancel"}
        </Button>
      )}
      <Group gap="xs" wrap="nowrap">
        {active && canManage && (
          <Button type="button" variant="default" onClick={onConnect} disabled={busy}>
            Switch account
          </Button>
        )}
        {active ? (
          <Button type="button" rightSection={<ExternalLink size={15} />} onClick={openSearchVisibility}>
            Open Search visibility
          </Button>
        ) : (
          canManage && (
            <Button type="button" onClick={onConnect} loading={busy}>
              {expired ? "Sign in to Google again" : "Continue to Google"}
            </Button>
          )
        )}
      </Group>
    </Group>
  );

  return (
    <IntegrationStudio
      opened={opened}
      onClose={onClose}
      brand="search-console"
      title="Google Search Console"
      docsUrl={appGuideUrl("search-console")}
      subtitle={connection?.googleEmail || "Search data for your websites"}
      badge={
        active ? (
          <Badge color="teal" variant="light" size="sm">
            Connected
          </Badge>
        ) : expired ? (
          <Badge color="orange" variant="light" size="sm">
            Sign-in expired
          </Badge>
        ) : (
          <Badge color="gray" variant="light" size="sm">
            Not connected
          </Badge>
        )
      }
      aside={<Aside />}
      footer={footer}
    >
      {status && connection ? (
        <ConnectedBody workspaceId={workspaceId} status={status} expired={expired} canManage={canManage} />
      ) : (
        <DisconnectedBody canManage={canManage} />
      )}
    </IntegrationStudio>
  );
}
