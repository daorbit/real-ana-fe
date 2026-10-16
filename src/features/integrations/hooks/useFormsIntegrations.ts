import { useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetFormsAppsQuery,
  useGetFormsCalendarQuery,
  useGetFormsPaymentsQuery,
  useGetFormsSheetsQuery,
  useGetFormsWebhookQuery,
  useGetTelegramStatusQuery,
  useGetWhatsAppStatusQuery,
} from "@/app/store";
import { buildSections } from "../lib/catalog";

export function useFormsIntegrations(workspaceId: string | null) {
  const arg = workspaceId ?? skipToken;
  const apps = useGetFormsAppsQuery(arg);
  const payments = useGetFormsPaymentsQuery(arg);
  const calendar = useGetFormsCalendarQuery(arg);
  const sheets = useGetFormsSheetsQuery(arg);
  const webhook = useGetFormsWebhookQuery(arg);
  const telegram = useGetTelegramStatusQuery(arg);
  const whatsapp = useGetWhatsAppStatusQuery(arg);

  const appList = apps.currentData;
  const paymentSettings = payments.currentData;
  const calendarStatus = calendar.currentData;
  const sheetsStatus = sheets.currentData;
  const telegramStatus = telegram.currentData;
  const whatsappStatus = whatsapp.currentData;
  const webhookEnabled = Boolean(webhook.currentData?.enabled);

  const sections = useMemo(
    () => buildSections(appList, paymentSettings, calendarStatus, sheetsStatus, telegramStatus, whatsappStatus, webhookEnabled),
    [appList, paymentSettings, calendarStatus, sheetsStatus, telegramStatus, whatsappStatus, webhookEnabled],
  );

  return {
    sections,
    apps: appList,
    payments: paymentSettings,
    calendar: calendarStatus,
    sheets: sheetsStatus,
    telegram: telegramStatus,
    whatsapp: whatsappStatus,
    loading: apps.isLoading || payments.isLoading || calendar.isLoading || sheets.isLoading || webhook.isLoading || telegram.isLoading || whatsapp.isLoading,
    failed: apps.isError,
    error: apps.error,
    refetchApps: apps.refetch,
    refetchCalendar: calendar.refetch,
    refetchSheets: sheets.refetch,
    appsFetching: apps.isFetching,
    calendarFetching: calendar.isFetching,
    sheetsFetching: sheets.isFetching,
    refetchAll: () => {
      void apps.refetch();
      void payments.refetch();
      void calendar.refetch();
      void sheets.refetch();
      void webhook.refetch();
      void telegram.refetch();
      void whatsapp.refetch();
    },
  };
}
