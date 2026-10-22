import type { BioPagesResponse } from "@/features/bio/types";

export function demoBioPages(): BioPagesResponse {
  const updatedAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  return {
    statsDays: 30,
    pages: [
      {
        id: "demo-bio-1",
        slug: "acme-studio",
        title: "Acme Studio",
        bio: "Design and growth for early-stage SaaS.\nNew case study every Thursday.",
        avatarUrl: "",
        links: [
          { id: "demo-link-1", label: "Book a free 20-minute call", url: "https://example.com/call", enabled: true },
          { id: "demo-link-2", label: "Read the latest case study", url: "https://example.com/case-study", enabled: true },
          { id: "demo-link-3", label: "Join the weekly newsletter", url: "https://example.com/newsletter", enabled: true },
          { id: "demo-link-4", label: "Free landing page checklist", url: "https://example.com/checklist", enabled: false },
        ],
        socials: [
          { network: "instagram", url: "https://instagram.com/acme" },
          { network: "linkedin", url: "https://linkedin.com/company/acme" },
          { network: "x", url: "https://x.com/acme" },
          { network: "email", url: "mailto:hello@example.com" },
        ],
        theme: { appearance: "light", accent: "#2f6bff", buttonStyle: "rounded" },
        published: true,
        stats: {
          views: 2480,
          clicks: 913,
          linkClicks: { "demo-link-1": 402, "demo-link-2": 318, "demo-link-3": 193 },
        },
        updatedAt,
      },
    ],
  };
}
