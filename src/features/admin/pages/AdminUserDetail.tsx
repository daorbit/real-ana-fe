import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { useGetAdminUserOverviewQuery } from "@/app/store";
import { useIsPlatformAdmin } from "@/features/auth/context";
import { SuperAdminOnly } from "@/features/referralAdmin/components/SuperAdminOnly";
import { useTitle } from "@/shared/lib/useTitle";
import { num, timeAgo } from "@/shared/lib";
import { ErrorState } from "@/shared/ui/ErrorState";
import { StatTile, StatTileGrid } from "@/shared/ui/StatTile";
import type { AdminUser } from "@/shared/types";
import { useAdminUserActions } from "../useAdminUserActions";
import { EmailComposer } from "../components/EmailComposer";
import { AdminPlanDialog } from "../components/AdminPlanDialog";
import { UserDetailHeader } from "../components/userDetail/UserDetailHeader";
import { UserActivityChart } from "../components/userDetail/UserActivityChart";
import { SignInsCard } from "../components/userDetail/SignInsCard";
import { WorkspaceCard } from "../components/userDetail/WorkspaceCard";
import { adminSectionPath } from "../lib/adminSections";
import classes from "../components/userDetail/userDetail.module.css";

export default function AdminUserDetail() {
  const { userId = "" } = useParams<{ userId: string }>();
  const isAdmin = useIsPlatformAdmin();
  const actions = useAdminUserActions();
  const { data, isLoading, isFetching, isError, refetch } = useGetAdminUserOverviewQuery(userId, {
    skip: !isAdmin || !userId,
  });

  const user = useMemo<AdminUser | null>(
    () =>
      data
        ? {
            ...data.user,
            workspaceCount: data.totals.workspaces,
            siteCount: data.totals.sites,
            eventCount: data.totals.events30d,
          }
        : null,
    [data],
  );

  useTitle(user ? `${user.name || user.email} · Admin` : "User · Admin");

  if (!isAdmin) {
    return (
      <AppShell>
        <SuperAdminOnly />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={classes.page}>
        <Link to={adminSectionPath("users")} className={classes.back}>
          <ArrowLeft size={14} aria-hidden />
          All users
        </Link>

        {isLoading ? (
          <Center py="xl">
            <Loader size="sm" />
          </Center>
        ) : isError || !data || !user ? (
          <ErrorState compact title="Couldn't load this user" onRetry={refetch} />
        ) : (
          <>
            <EmailComposer
              key={actions.messaging?.id}
              opened={Boolean(actions.messaging)}
              user={actions.messaging}
              onClose={actions.closeMessage}
            />
            <AdminPlanDialog user={actions.planUser} onClose={actions.closePlan} />

            <UserDetailHeader user={user} actions={actions} refreshing={isFetching} onRefresh={refetch} />

            <StatTileGrid>
              <StatTile
                label="Workspaces"
                value={String(data.totals.workspaces)}
                note={`${data.totals.owned} owned · ${data.totals.shared} shared`}
              />
              <StatTile label="Sites" value={String(data.totals.sites)} />
              <StatTile label="Events · 30 days" value={num(data.totals.events30d)} />
              <StatTile label="Last event" value={user.lastEventAt ? timeAgo(user.lastEventAt) : "Never"} />
            </StatTileGrid>

            <div className={classes.grid}>
              <UserActivityChart trend={data.trend} total={data.totals.events30d} />
              <SignInsCard signIns={data.signIns} />
            </div>

            <div className={classes.sectionHead}>
              <span className={classes.sectionTitle}>Workspaces</span>
              <span className={classes.eyebrow}>{data.workspaces.length} total</span>
            </div>

            {data.workspaces.length ? (
              <div className={classes.workspaces}>
                {data.workspaces.map((ws) => (
                  <WorkspaceCard key={ws.id} workspace={ws} />
                ))}
              </div>
            ) : (
              <div className={`${classes.card} ${classes.empty}`}>This user isn't in any workspace.</div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
