import { useState } from "react";
import {
  Alert, Button, Group, Loader, Menu, Paper, Stack, Text,
} from "@mantine/core";
import { AlertTriangle, MoreVertical, RefreshCw, Star, Unlink } from "lucide-react";
import { modals } from "@mantine/modals";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useTitle } from "@/shared/lib/useTitle";
import { notify, notifyError, errMessage } from "@/shared/lib/notify";
import {
  useConnectGoogleLocationMutation,
  useDisconnectGoogleReviewsMutation,
  useGetGoogleAvailableLocationsQuery,
  useGetGoogleReviewsQuery,
  useGetGoogleReviewsStatusQuery,
  useSyncGoogleLocationMutation,
} from "@/app/store";
import { useGoogleConnect } from "@/features/reviews/useGoogleConnect";
import { RatingSummary } from "@/features/reviews/components/RatingSummary";
import { ReviewList } from "@/features/reviews/components/ReviewList";
import { SelectBusiness } from "@/features/reviews/components/SelectBusiness";

/**
 * Google Reviews.
 *
 * Four states, in the order a workspace passes through them: not configured on
 * this deployment, configured but not connected, connected with no business
 * chosen yet, and connected with reviews to show. They are separated because
 * each needs a different action from a different person — an administrator adds
 * credentials, an admin member authorises, and anyone can then read.
 */
export default function Reviews() {
  useTitle("Google Reviews");
  const { active } = useWorkspace();
  const { canAdmin } = usePermissions();
  const workspaceId = active?._id ?? "";

  const { data: status, isLoading, refetch } = useGetGoogleReviewsStatusQuery(workspaceId, {
    skip: !workspaceId,
  });

  const connected = !!status?.connected;
  const hasLocations = !!status?.locations.length;

  const { data: reviewData, isLoading: reviewsLoading } = useGetGoogleReviewsQuery(
    { workspaceId },
    { skip: !workspaceId || !hasLocations },
  );

  // Only fetched at the one moment it is needed: after authorising, before a
  // business has been picked. It is a live Google call, so asking for it on
  // every page load would spend quota to render nothing.
  const needsPicker = connected && !hasLocations;
  const {
    data: available,
    isLoading: availableLoading,
    error: availableError,
  } = useGetGoogleAvailableLocationsQuery(workspaceId, {
    skip: !workspaceId || !needsPicker || !canAdmin,
  });

  const [connectLocation, { isLoading: connectingLocation }] = useConnectGoogleLocationMutation();
  const [syncLocation, { isLoading: syncing }] = useSyncGoogleLocationMutation();
  const [disconnect] = useDisconnectGoogleReviewsMutation();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const { connect, connecting } = useGoogleConnect(workspaceId, refetch);

  const handleSync = async (locationId: string) => {
    setSyncingId(locationId);
    try {
      const result = await syncLocation({ workspaceId, locationId }).unwrap();
      notify.success(
        result.added || result.updated
          ? `Synced — ${result.added} new, ${result.updated} updated`
          : "Reviews are up to date",
      );
    } catch (e) {
      notifyError(e);
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnect = () => {
    modals.openConfirmModal({
      title: "Disconnect Google",
      // Says plainly that the cached reviews go too. Someone who expects a
      // reconnect to restore them would otherwise find the dashboard empty and
      // read it as data loss.
      children: (
        <Text size="sm">
          This removes the Google connection and every review cached for this workspace. Your
          reviews on Google are not affected, and reconnecting will fetch them again.
        </Text>
      ),
      labels: { confirm: "Disconnect", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await disconnect(workspaceId).unwrap();
          notify.success("Google disconnected");
        } catch (e) {
          notifyError(e);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <AppShell>
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Google Reviews"
        description="Sync reviews from your Google Business Profile and serve them through the Quantalog API."
        actions={
          connected && canAdmin ? (
            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <Button variant="default" leftSection={<MoreVertical size={15} />}>
                  Manage
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  color="red"
                  leftSection={<Unlink size={14} />}
                  onClick={handleDisconnect}
                >
                  Disconnect Google
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : undefined
        }
      />

      <Stack gap="lg">
        {/* An administrator has not added the Google credentials to this
            deployment. Nothing the person reading this can fix themselves, so
            it says who can. */}
        {status && !status.configured && (
          <Alert color="yellow" icon={<AlertTriangle size={16} />} title="Google is not set up yet">
            Google Reviews is not configured on this deployment. An administrator needs to add the
            Google Business Profile credentials before this can be connected.
          </Alert>
        )}

        {/* The authorisation existed and has stopped working — revoked from the
            Google account, or a refresh that will never succeed again. The only
            recovery is authorising afresh. */}
        {status?.connection && status.connection.status !== "active" && (
          <Alert color="red" icon={<AlertTriangle size={16} />} title="Google needs reconnecting">
            <Stack gap="sm" align="flex-start">
              <Text size="sm">
                {status.connection.statusMessage ||
                  "Google access is no longer working. Reconnect to continue syncing reviews."}
              </Text>
              {canAdmin && (
                <Button size="xs" loading={connecting} onClick={connect}>
                  Reconnect Google
                </Button>
              )}
            </Stack>
          </Alert>
        )}

        {!connected && status?.configured && (
          <EmptyState
            icon={Star}
            title="Connect your Google Business Profile"
            description="Authorise Google to fetch and manage your reviews inside Quantalog."
            action={
              canAdmin
                ? { label: "Connect Google", onClick: connect, loading: connecting }
                : undefined
            }
            actionNote={
              canAdmin
                ? undefined
                : "You need admin access to this workspace to connect Google."
            }
          />
        )}

        {needsPicker && canAdmin && (
          <Paper withBorder p="lg" radius="md">
            <SelectBusiness
              data={available}
              loading={availableLoading}
              error={availableError ? errMessage(availableError) : undefined}
              connecting={connectingLocation}
              onConnect={async (location) => {
                try {
                  const result = await connectLocation({ workspaceId, ...location }).unwrap();
                  // A sync failure does not fail the connection — the business
                  // is attached either way — so it is reported separately
                  // rather than as a failed connect.
                  if (result.syncError) notify.error(result.syncError);
                  else notify.success(`${location.title} connected`);
                } catch (e) {
                  notifyError(e);
                }
              }}
            />
          </Paper>
        )}

        {/* Connected, but the person looking has no admin rights and no
            business has been chosen. Nothing for them to do here. */}
        {needsPicker && !canAdmin && (
          <EmptyState
            icon={Star}
            title="No business connected yet"
            description="An admin of this workspace needs to choose which Google business to sync."
            compact
          />
        )}

        {hasLocations && (
          <>
            <Stack gap="sm">
              {status!.locations.map((location) => (
                <Paper key={location.id} withBorder p="md" radius="md">
                  <Group justify="space-between" wrap="wrap" gap="sm">
                    <Stack gap={2} style={{ minWidth: 0 }}>
                      <Text fw={600} size="sm">
                        {location.title}
                      </Text>
                      {location.address && (
                        <Text size="xs" c="dimmed">
                          {location.address}
                        </Text>
                      )}
                      {location.lastSyncError && (
                        <Text size="xs" c="red">
                          {location.lastSyncError}
                        </Text>
                      )}
                    </Stack>

                    {canAdmin && (
                      <Button
                        variant="light"
                        size="xs"
                        leftSection={<RefreshCw size={14} />}
                        loading={syncing && syncingId === location.id}
                        onClick={() => handleSync(location.id)}
                      >
                        Sync reviews
                      </Button>
                    )}
                  </Group>
                </Paper>
              ))}
            </Stack>

            {reviewsLoading ? (
              <Group justify="center" py="xl">
                <Loader size="sm" />
              </Group>
            ) : reviewData?.reviews.length ? (
              <>
                <RatingSummary
                  locations={status!.locations}
                  breakdown={reviewData.breakdown}
                />
                <div>
                  <Text fw={600} mb="sm">
                    Latest reviews
                  </Text>
                  <ReviewList reviews={reviewData.reviews} />
                </div>
              </>
            ) : (
              // Connected with nothing to show. Most often a business that has
              // no reviews yet, which is not a problem to solve — so this does
              // not offer a fix, only says which it is.
              <EmptyState
                icon={Star}
                title="No reviews yet"
                description="This business has no Google reviews to show. New reviews appear here after the next sync."
                compact
              />
            )}
          </>
        )}
      </Stack>
    </AppShell>
  );
}
