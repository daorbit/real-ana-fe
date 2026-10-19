import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { Button, Loader, Select, Text, ThemeIcon, Title } from "@mantine/core";
import { AlertTriangle, ArrowLeftRight, Bot } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { useAuthorizationRequest } from "@/features/connectors/hooks/useAuthorizationRequest";
import { ScopeList } from "@/features/connectors/components/ScopeList";
import { rememberReturnPath } from "@/shared/lib/session";
import { useTitle } from "@/shared/lib/useTitle";
import classes from "./ConnectAuthorize.module.css";

const PENDING_KEY = "pendingInvite";

function forgetReturn() {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* private mode */
  }
}

function StateCard({ title, body }: { title: string; body: string }) {
  return (
    <div className={classes.state}>
      <ThemeIcon variant="light" color="red" size="xl" radius="md">
        <AlertTriangle size={20} />
      </ThemeIcon>
      <Title order={4}>{title}</Title>
      <Text size="sm" c="dimmed">
        {body}
      </Text>
      <Button component={Link} to="/app" variant="light" mt="sm">
        Go to Quantalog
      </Button>
    </div>
  );
}

export default function ConnectAuthorize() {
  useTitle("Connect an app");
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [params] = useSearchParams();
  const requestId = params.get("request") ?? "";
  const signedIn = Boolean(user) && !user?.demo && !user?.impersonating;

  const { request, loadError, loading, deciding, decide } = useAuthorizationRequest(requestId, signedIn);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    if (signedIn) forgetReturn();
  }, [signedIn]);

  useEffect(() => {
    if (request?.workspaces.length && !workspaceId) setWorkspaceId(request.workspaces[0].id);
  }, [request, workspaceId]);

  const workspaceOptions = useMemo(
    () => (request?.workspaces ?? []).map((w) => ({ value: w.id, label: `${w.name} · ${w.role}` })),
    [request],
  );

  if (authLoading) {
    return (
      <main className={classes.page}>
        <Loader size="sm" />
      </main>
    );
  }

  if (!user) {
    const here = location.pathname + location.search;
    rememberReturnPath(here);
    try {
      sessionStorage.setItem(PENDING_KEY, here);
    } catch {
      /* private mode */
    }
    return <Navigate to="/login" replace />;
  }

  const clientName = request?.client.name ?? "This app";

  return (
    <main className={classes.page}>
      <section className={classes.card} aria-busy={loading}>
        {!requestId ? (
          <StateCard title="Missing connection request" body="Start the connection again from Claude." />
        ) : !signedIn ? (
          <StateCard
            title="Not available here"
            body="Sign in with your own account (not the demo or a support session) to connect an app."
          />
        ) : loading ? (
          <div className={classes.state}>
            <Loader size="sm" />
          </div>
        ) : loadError || !request ? (
          <StateCard title="This request isn't valid" body={loadError ?? "Start the connection again from Claude."} />
        ) : request.workspaces.length === 0 ? (
          <StateCard title="No workspace to connect" body="Create a workspace first, then start the connection again." />
        ) : (
          <>
            <div className={classes.marks} aria-hidden="true">
              <span className={classes.mark}>
                {/claude/i.test(clientName) ? (
                  <img src="/apps/claude.svg" alt="" className={classes.markImage} />
                ) : (
                  <Bot size={24} />
                )}
              </span>
              <ArrowLeftRight size={18} className={classes.link} />
              <span className={classes.mark}>
                <img src="/brand-mark.png" alt="" className={classes.markImage} />
              </span>
            </div>

            <h1 className={classes.title}>Allow {clientName} to read your Quantalog data?</h1>
            <p className={classes.lead}>
              {clientName} is asking for read-only access to one workspace. After you decide, you&apos;ll return to{" "}
              {request.client.redirectHost || "the app"}.
            </p>

            <div className={classes.section}>
              <p className={classes.sectionLabel}>Workspace</p>
              <Select
                data={workspaceOptions}
                value={workspaceId}
                onChange={setWorkspaceId}
                allowDeselect={false}
                disabled={workspaceOptions.length < 2}
                aria-label="Workspace to connect"
              />
            </div>

            <div className={classes.section}>
              <p className={classes.sectionLabel}>It will be able to</p>
              <ScopeList scopes={request.scopes} />
              <p className={classes.note}>
                It can&apos;t create, change or delete anything. Disconnect at any time in Apps → Claude.
              </p>
            </div>

            <div className={classes.actions}>
              <Button
                variant="default"
                loading={deciding === "deny"}
                disabled={deciding !== null}
                onClick={() => decide("deny")}
              >
                Cancel
              </Button>
              <Button
                loading={deciding === "approve"}
                disabled={!workspaceId || deciding !== null}
                onClick={() => workspaceId && decide("approve", workspaceId)}
              >
                Allow access
              </Button>
            </div>

            <p className={classes.account}>
              Signed in as <span className={classes.accountEmail}>{user.email}</span>
            </p>
          </>
        )}
      </section>
    </main>
  );
}
