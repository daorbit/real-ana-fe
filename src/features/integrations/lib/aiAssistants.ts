export type AssistantId = "claude" | "chatgpt";

export interface AssistantInfo {
  id: AssistantId;
  name: string;
  logo: string;
  hosts: string[];
  description: string;
  connectorsUrl: string;
  connectorsLabel: string;
  steps: string[];
  note?: string;
}

export const AI_ASSISTANTS: AssistantInfo[] = [
  {
    id: "claude",
    name: "Claude",
    logo: "/apps/claude.svg",
    hosts: ["claude.ai", "claude.com"],
    description: "Ask Claude about your forms, leads, bookings and website traffic. Read-only, per workspace.",
    connectorsUrl: "https://claude.ai/settings/connectors",
    connectorsLabel: "Open Claude connectors",
    steps: [
      "In Claude, open Settings → Connectors.",
      "Choose Add custom connector, name it Quantalog and paste the URL above.",
      "Click Connect, sign in to Quantalog and pick this workspace.",
      "Ask Claude about your forms, leads, bookings or traffic.",
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    logo: "/apps/openai-chatgpt.svg",
    hosts: ["chatgpt.com", "chat.openai.com"],
    description: "Ask ChatGPT about your forms, leads, bookings and website traffic. Read-only, per workspace.",
    connectorsUrl: "https://chatgpt.com/#settings/Connectors",
    connectorsLabel: "Open ChatGPT settings",
    steps: [
      "In ChatGPT, open Settings → Apps & Connectors → Advanced and turn on Developer mode.",
      "Back in Apps & Connectors, choose Create, name it Quantalog, paste the URL above and pick OAuth.",
      "Click Connect, sign in to Quantalog and pick this workspace.",
      "In a new chat, add Quantalog from the + menu and ask about your forms, leads or traffic.",
    ],
    note: "Custom connectors need a ChatGPT plan that includes developer mode, such as Plus, Pro, Business or Enterprise.",
  },
];

export const ASSISTANT_PROMPTS = [
  "Which of my forms got the most responses this month?",
  "Show my 10 newest leads from the contact form.",
  "How many bookings are coming up this week?",
  "Summarise my website traffic for the last 7 days.",
];

export const ASSISTANT_CAN_READ = [
  "Workspace name, your role and tracked sites",
  "Forms, their questions and form analytics",
  "Form responses and the lead pipeline",
  "Booking counts and upcoming booked slots",
  "Website traffic summaries",
];

export function assistantForHost(host: string): AssistantInfo | undefined {
  const bare = host.toLowerCase().replace(/:\d+$/, "");
  return AI_ASSISTANTS.find((a) => a.hosts.includes(bare));
}
