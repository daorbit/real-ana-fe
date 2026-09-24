import { Globe, Smartphone } from "lucide-react";

export type Platform = "web" | "app";
export type AppKind = "web" | "mobile";

export interface WizardStep {
  label: string;
  title: string;
  description: string;
}

export const WEB_STEPS: WizardStep[] = [
  { label: "Platform", title: "What are you tracking?", description: "This decides which install guide you get. Either way the data lands in the same dashboard." },
  { label: "Site", title: "Site details", description: "Tell us where the tracker will run and what the site is built with." },
  { label: "Tracking", title: "Tracking options", description: "These become attributes on your script tag. The defaults suit most sites." },
  { label: "Install", title: "Install the tracker", description: "Add the snippet to your site, then check that data is arriving." },
];

export const APP_STEPS: WizardStep[] = [
  { label: "Platform", title: "What are you tracking?", description: "This decides which install guide you get. Either way the data lands in the same dashboard." },
  { label: "App", title: "App details", description: "Name the app so you can recognise it in the dashboard." },
  { label: "Install", title: "Install the SDK", description: "Add the trace() call to the actions that matter in your app." },
];

export const PLATFORM_CHOICES = [
  {
    id: "web" as const,
    icon: Globe,
    title: "Website or landing page",
    blurb: "One script tag in the head. Starts collecting immediately.",
    points: [
      "Anonymous visitors, no cookie banner needed",
      "Pageviews, clicks, referrers and Core Web Vitals",
      "Best for marketing sites, blogs and docs",
    ],
  },
  {
    id: "app" as const,
    icon: Smartphone,
    title: "App with signed-in users",
    blurb: "A trace() call on the actions that matter, tied to your own user ids.",
    points: [
      "Per-user journeys you can open and replay",
      "Works for web apps and React Native alike",
      "Best for products behind a login",
    ],
  },
];
