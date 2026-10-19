import { useEffect, useState, type ReactNode } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Loader, Title, Text } from "@mantine/core";
import { Bot, LockKeyhole, TriangleAlert } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { AuthBrand } from "@/features/auth/components/AuthBrand";
import { useAuthorizationRequest } from "@/features/connectors/hooks/useAuthorizationRequest";
import { PermissionList } from "@/features/connectors/components/PermissionList";
import { WorkspacePicker } from "@/features/connectors/components/WorkspacePicker";
import { assistantForHost } from "@/features/integrations/lib/aiAssistants";
import { rememberReturnPath } from "@/shared/lib/session";
import { useTitle } from "@/shared/lib/useTitle";
import classes from "./ConnectAuthorize.module.css";

const PENDING_KEY = "pendingInvite";

function setPending(path: string | null) {
  try {
    if (path) sessionStorage.setItem(PENDING_KEY, path);
    else sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* private mode */
  }
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-split">
      <AuthBrand />
      <div className="auth-panel">
        <motion.div
          className={`auth-form ${classes.form}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

function Problem({ title, body }: { title: string; body: string }) {
  return (
    <div className={classes.problem}>
      <span className={classes.problemIcon}>
        <TriangleAlert size={22} />
      </span>
      <Title order={2}>{title}</Title>
      <Text mt={8}>{body}</Text>
      <Button component={Link} to="/app" variant="default" fullWidth mt={28}>
        Go to Quantalog
      </Button>
    </div>
  );
}

function ClientMark({ host }: { host: string }) {
  const assistant = assistantForHost(host);
  return (
    <span className={classes.mark}>
      {assistant ? <img src={assistant.logo} alt="" className={classes.markImage} /> : <Bot size={26} />}
    </span>
  );
}

export default function ConnectAuthorize() {
  useTitle("Connect an app");
  const { user, loading: authLoading, logout } = useAuth();
  const location = useLocation();
  const [params] = useSearchParams();
  const requestId = params.get("request") ?? "";
  const signedIn = Boolean(user) && !user?.demo && !user?.impersonating;

  const { request, loadError, loading, deciding, decide } = useAuthorizationRequest(requestId, signedIn);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    if (signedIn) setPending(null);
  }, [signedIn]);

  useEffect(() => {
    if (request?.workspaces.length && !workspaceId) setWorkspaceId(request.workspaces[0].id);
  }, [request, workspaceId]);

  useEffect(() => {
    if (authLoading || user) return;
    const here = location.pathname + location.search;
    rememberReturnPath(here);
    setPending(here);
  }, [authLoading, user, location.pathname, location.search]);

  if (authLoading) {
    return (
      <Shell>
        <div className={classes.loading}>
          <Loader size="sm" />
        </div>
      </Shell>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!requestId) return <Shell><Problem title="Nothing to connect" body="Start the connection again from Claude." /></Shell>;
  if (!signedIn) {
    return (
      <Shell>
        <Problem title="Use your own account" body="Apps can't be connected from the demo or a support session." />
      </Shell>
    );
  }
  if (loading) {
    return (
      <Shell>
        <div className={classes.loading}>
          <Loader size="sm" />
        </div>
      </Shell>
    );
  }
  if (loadError || !request) {
    return <Shell><Problem title="This link has expired" body={loadError ?? "Start the connection again from Claude."} /></Shell>;
  }
  if (request.workspaces.length === 0) {
    return <Shell><Problem title="No workspace yet" body="Create a workspace first, then connect again from Claude." /></Shell>;
  }

  const clientName = request.client.name;
  const busy = deciding !== null;

  return (
    <Shell>
      <div className={classes.marks} aria-hidden>
        <ClientMark host={request.client.redirectHost} />
        <span className={classes.dots}>
          <i />
          <i />
          <i />
        </span>
        <span className={classes.mark}>
          <img src="/brand-mark.png" alt="" className={classes.markImage} />
        </span>
      </div>

      <Title order={2} ta="center">
        Connect {clientName}
      </Title>
      <Text ta="center" mt={8}>
        {clientName} wants read-only access to one of your workspaces.
      </Text>

      <section className={classes.section}>
        <p className={classes.label}>Choose a workspace</p>
        <WorkspacePicker
          workspaces={request.workspaces}
          value={workspaceId}
          disabled={busy}
          onChange={setWorkspaceId}
        />
      </section>

      <section className={classes.section}>
        <p className={classes.label}>{clientName} will be able to see</p>
        <PermissionList scopes={request.scopes} />
        <p className={classes.assure}>
          <LockKeyhole size={14} />
          Read-only. Nothing can be created, changed or deleted.
        </p>
      </section>

      <div className={classes.actions}>
        <Button
          className="auth-submit"
          fullWidth
          loading={deciding === "approve"}
          disabled={!workspaceId || busy}
          onClick={() => workspaceId && decide("approve", workspaceId)}
        >
          Allow access
        </Button>
        <Button variant="default" fullWidth loading={deciding === "deny"} disabled={busy} onClick={() => decide("deny")}>
          Cancel
        </Button>
      </div>

      <p className={classes.meta}>
        You&apos;ll return to {request.client.redirectHost || "the app"}. Disconnect any time in Quantalog → Apps.
      </p>
      <p className={classes.meta}>
        Signed in as <span className={classes.email}>{user.email}</span> ·{" "}
        <button type="button" className={classes.switch} onClick={logout} disabled={busy}>
          Not you?
        </button>
      </p>
    </Shell>
  );
}
