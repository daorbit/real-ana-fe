/**
 * Install + usage guide for a mobile ("app") site — the React Native SDK,
 * shown in place of the framework picker when the wizard's platform step is
 * set to "app".
 *
 * Unlike the web tracker, every event needs a real user id: identify() is
 * called once per load, and track() is dropped if it hasn't been. The
 * example below is deliberately a full journey rather than one call, so a
 * reader sees where identify() goes relative to a screen view and a tap
 * before they write their own.
 */
export type MobileStep = {
  id: string;
  title: string;
  /** One or two sentences of context before the code. */
  blurb: string;
  filename: string;
  code: string;
  /** Anything worth knowing after pasting — gotchas, timing. */
  note?: string;
};

export function mobileSteps(siteId: string, apiUrl: string): MobileStep[] {
  return [
    {
      id: "install",
      title: "1. Install",
      blurb: "Add the SDK and its one peer dependency.",
      filename: "terminal",
      code: `npm install @real-ana/react-native @react-native-async-storage/async-storage`,
    },
    {
      id: "client",
      title: "2. Create the client once",
      blurb: "Create it at the app root and import this same instance everywhere — it holds the install id and the current session.",
      filename: "src/analytics.ts",
      code: `import { createRealAna } from "@real-ana/react-native";

export const analytics = createRealAna({
  siteId: "${siteId}",
  apiUrl: "${apiUrl}",
});`,
    },
    {
      id: "identify",
      title: "3. Identify on login",
      blurb: "Call identify() once per load, as soon as you know who's logged in. track() is dropped silently until this has run — that's what keeps every event tied to a real user instead of landing anonymously.",
      filename: "App.tsx",
      code: `useEffect(() => {
  if (user?.id) analytics.identify(user.id);
  else analytics.reset(); // on logout
}, [user?.id]);`,
      note: "reset() on logout stops later events being attributed to that user — call it the moment the session ends, not before.",
    },
    {
      id: "journey",
      title: "4. A full journey",
      blurb: "Screen views and taps, in the order they'd actually fire — this is exactly what shows up on that user's timeline in the dashboard.",
      filename: "App journey",
      code: `// Home screen loads
function HomeScreen() {
  useEffect(() => { analytics.screen("Home"); }, []);
  ...
}

// User taps into the dashboard
<Button onPress={() => {
  analytics.track("dashboard_opened", { source: "home", destination: "dashboard" });
  navigation.navigate("Dashboard");
}}>
  Open dashboard
</Button>

// Dashboard screen loads
function DashboardScreen() {
  useEffect(() => { analytics.screen("Dashboard"); }, []);
  ...
}

// User taps "Add widget"
<Button onPress={() => {
  analytics.track("add_widget_clicked", { source: "dashboard", destination: "widget_modal" });
  openAddWidgetModal();
}}>
  Add widget
</Button>`,
    },
  ];
}
