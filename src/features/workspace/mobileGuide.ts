/**
 * Install + usage guide for an app site (web or mobile) — shown in place of
 * the framework picker when the wizard's platform step is set to "app".
 *
 * One call per action: trace(userId, action, src?, dest?). No identify()
 * step and no client-held state — the user id is passed fresh on every call,
 * so there's nothing to go stale after a logout the SDK never heard about.
 * The example below is a full journey rather than one call, so a reader sees
 * where the user id actually comes from before writing their own.
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

const journeyExample = `// User taps into the dashboard from Home
<Button onPress={() => {
  analytics.trace(user.id, "dashboard_opened", "home", "dashboard");
  navigation.navigate("Dashboard");
}}>
  Open dashboard
</Button>

// User taps "Add widget" on the Dashboard
<Button onPress={() => {
  analytics.trace(user.id, "add_widget_clicked", "dashboard", "widget_modal");
  openAddWidgetModal();
}}>
  Add widget
</Button>`;

function mobileGuide(siteId: string, apiUrl: string): MobileStep[] {
  return [
    {
      id: "install",
      title: "1. Install",
      blurb: "Add the SDK.",
      filename: "terminal",
      code: `npm install @real-ana/react-native`,
    },
    {
      id: "client",
      title: "2. Create the client once",
      blurb: "Create it at the app root and import this same instance everywhere.",
      filename: "src/analytics.ts",
      code: `import { createRealAna } from "@real-ana/react-native";

export const analytics = createRealAna({
  siteId: "${siteId}",
  apiUrl: "${apiUrl}",
});`,
    },
    {
      id: "journey",
      title: "3. A full journey",
      blurb: "One call per action — the user id comes from wherever your app already keeps it (session, auth context), passed fresh every time. This is exactly what shows up on that user's timeline in the dashboard.",
      filename: "App journey",
      code: journeyExample,
      note: "src/dest are optional — omit them and only the action is recorded, useful for one-off events that aren't really a step between two places.",
    },
  ];
}

function webGuide(siteId: string, apiUrl: string): MobileStep[] {
  return [
    {
      id: "trace-fn",
      title: "1. One function, no install",
      blurb: "No SDK needed — a plain fetch call is the whole thing. Put it wherever your other API helpers live.",
      filename: "trace.ts",
      code: `async function trace(userId: string, action: string, src?: string, dest?: string) {
  if (!userId) return;
  await fetch("${apiUrl}/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ siteId: "${siteId}", appUserId: userId, action, src, dest }),
  }).catch(() => {});
}`,
    },
    {
      id: "journey",
      title: "2. A full journey",
      blurb: "Call it right where the action happens, with the user id you already have in your app's auth state.",
      filename: "App journey",
      code: journeyExample.replace(/analytics\.trace/g, "trace"),
      note: "src/dest are optional — omit them and only the action is recorded, useful for one-off events that aren't really a step between two places.",
    },
  ];
}

export function mobileSteps(siteId: string, apiUrl: string, appKind: "web" | "mobile" = "mobile"): MobileStep[] {
  return appKind === "web" ? webGuide(siteId, apiUrl) : mobileGuide(siteId, apiUrl);
}
