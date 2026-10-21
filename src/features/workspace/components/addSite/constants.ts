export interface WizardStep {
  label: string;
  title: string;
  description: string;
}

export const WEB_STEPS: WizardStep[] = [
  { label: "Site", title: "Which site are you tracking?", description: "Type the address you want to measure. You can rename it any time." },
  { label: "Framework", title: "What is it built with?", description: "Only changes the install instructions you get at the end. The tracker is the same everywhere." },
  { label: "Tracking", title: "Tracking options", description: "These become attributes on your script tag. The defaults suit most sites." },
  { label: "Install", title: "Install the tracker", description: "Add the snippet to your site, then check that data is arriving." },
];
