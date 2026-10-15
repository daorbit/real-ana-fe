import { useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetFormsAppsQuery,
  useGetFormsCalendarQuery,
  useGetFormsPaymentsQuery,
  useGetFormsSheetsQuery,
  useGetFormsWebhookQuery,
} from "@/app/store";
import { buildSections } from "../lib/catalog";

export function useFormsIntegrations(workspaceId: string | null) {
  const arg = workspaceId ?? skipToken;
  const apps = useGetFormsAppsQuery(arg);
  const payments = useGetFormsPaymentsQuery(arg);
  const calendar = useGetFormsCalendarQuery(arg);
  const sheets = useGetFormsSheetsQuery(arg);
  const webhook = useGetFormsWebhookQuery(arg);

  const appList = apps.currentData;
  const paymentSettings = payments.currentData;
  const calendarStatus = calendar.currentData;
  const sheetsStatus = sheets.currentData;
  const webhookEnabled = Boolean(webhook.currentData?.enabled);

  const sections = useMemo(
    () => buildSections(appList, paymentSettings, calendarStatus, sheetsStatus, webhookEnabled),
    [appList, paymentSettings, calendarStatus, sheetsStatus, webhookEnabled],
  );

  return {
    sections,
    apps: appList,
    payments: paymentSettings,
    calendar: calendarStatus,
    sheets: sheetsStatus,
    loading: apps.isLoading || payments.isLoading || calendar.isLoading || sheets.isLoading || webhook.isLoading,
    failed: apps.isError,
    error: apps.error,
    refetchCalendar: calendar.refetch,
    refetchSheets: sheets.refetch,
    refetchAll: () => {
      void apps.refetch();
      void payments.refetch();
      void calendar.refetch();
      void sheets.refetch();
      void webhook.refetch();
    },
  };
}
