import { useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetFormsAppsQuery,
  useGetFormsCalendarQuery,
  useGetFormsPaymentsQuery,
  useGetFormsWebhookQuery,
} from "@/app/store";
import { buildSections } from "../lib/catalog";

export function useFormsIntegrations(workspaceId: string | null) {
  const arg = workspaceId ?? skipToken;
  const apps = useGetFormsAppsQuery(arg);
  const payments = useGetFormsPaymentsQuery(arg);
  const calendar = useGetFormsCalendarQuery(arg);
  const webhook = useGetFormsWebhookQuery(arg);

  const appList = apps.currentData;
  const paymentSettings = payments.currentData;
  const calendarStatus = calendar.currentData;
  const webhookEnabled = Boolean(webhook.currentData?.enabled);

  const sections = useMemo(
    () => buildSections(appList, paymentSettings, calendarStatus, webhookEnabled),
    [appList, paymentSettings, calendarStatus, webhookEnabled],
  );

  return {
    sections,
    apps: appList,
    payments: paymentSettings,
    calendar: calendarStatus,
    loading: apps.isLoading || payments.isLoading || calendar.isLoading || webhook.isLoading,
    failed: apps.isError,
    error: apps.error,
    refetchCalendar: calendar.refetch,
    refetchAll: () => {
      void apps.refetch();
      void payments.refetch();
      void calendar.refetch();
      void webhook.refetch();
    },
  };
}
