export type GoogleKind = "calendar" | "sheets";

export const GOOGLE_NAMES: Record<GoogleKind, string> = {
  calendar: "Google Calendar",
  sheets: "Google Sheets",
};

const OTHERS_STAY = "Your other Google apps in Quantalog stay connected.";

export const GOOGLE_DISCONNECT_COPY: Record<GoogleKind, string> = {
  calendar: `Booking fields stop checking your busy times and stop adding events. Events already on your calendar are not removed. ${OTHERS_STAY}`,
  sheets: `New responses stop going to Google Sheets. Existing spreadsheets stay in your Drive, but if you reconnect, each form starts a new spreadsheet. ${OTHERS_STAY}`,
};
