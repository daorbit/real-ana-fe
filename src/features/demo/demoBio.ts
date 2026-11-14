import { sampleBioStats, summaryStats } from "@/features/bio/lib/sampleBioStats";
import type { BioPage, BioPageInput, BioPageStatsDetail, BioPagesResponse } from "@/features/bio/types";

const DEMO_STATS_DAYS = 30;
const DEMO_MAX_DAYS = 365;

type DemoSeed = { id: string; scale: number; input: BioPageInput };

const DEMO_SEEDS: DemoSeed[] = [
  {
    id: "demo-bio-1",
    scale: 82,
    input: {
      kind: "profile",
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
        { id: "demo-social-1", network: "instagram", url: "https://instagram.com/acme" },
        { id: "demo-social-2", network: "linkedin", url: "https://linkedin.com/company/acme" },
        { id: "demo-social-3", network: "x", url: "https://x.com/acme" },
        { id: "demo-social-4", network: "email", url: "mailto:hello@example.com" },
      ],
      release: null,
      theme: { appearance: "light", accent: "#1d1d1f", buttonStyle: "rounded", background: "plain", layout: "classic", font: "sans" },
      published: true,
    },
  },
  {
    id: "demo-bio-2",
    scale: 146,
    input: {
      kind: "release",
      slug: "k3x9qa",
      title: "Night Drive",
      bio: "",
      avatarUrl: "",
      links: [],
      socials: [],
      release: {
        artworkUrl: "",
        subtitle: "Choose music service",
        releaseDate: "",
        rows: [
          { id: "demo-row-1", service: "spotify", name: "Spotify", url: "https://open.spotify.com/track/demo", action: "Play", enabled: true },
          { id: "demo-row-2", service: "apple-music", name: "Apple Music", url: "https://music.apple.com/in/album/demo", action: "Play", enabled: true },
          { id: "demo-row-3", service: "youtube-music", name: "YouTube Music", url: "https://music.youtube.com/watch?v=demo", action: "Play", enabled: true },
          { id: "demo-row-4", service: "youtube", name: "YouTube", url: "https://youtube.com/watch?v=demo", action: "Watch", enabled: true },
          { id: "demo-row-5", service: "jiosaavn", name: "JioSaavn", url: "https://www.jiosaavn.com/song/demo", action: "Play", enabled: true },
          { id: "demo-row-6", service: "amazon-music", name: "Amazon Music", url: "https://music.amazon.in/albums/demo", action: "Play", enabled: true },
          { id: "demo-row-7", service: "itunes", name: "iTunes Store", url: "https://itunes.apple.com/in/album/demo", action: "Download", enabled: true },
        ],
      },
      theme: { appearance: "light", accent: "#1d1d1f", buttonStyle: "rounded", background: "plain", layout: "list", font: "sans" },
      published: true,
    },
  },
];

export function demoBioSeeds(): DemoSeed[] {
  return DEMO_SEEDS.map((seed) => ({ ...seed, input: structuredClone(seed.input) }));
}

function demoUpdatedAt(): string {
  return new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
}

export function demoBioPages(): BioPagesResponse {
  const updatedAt = demoUpdatedAt();
  const pages: BioPage[] = DEMO_SEEDS.map(({ id, scale, input }) => ({
    ...input,
    id,
    updatedAt,
    stats: summaryStats(sampleBioStats(id, input, DEMO_STATS_DAYS, DEMO_MAX_DAYS, scale)),
  }));
  return { statsDays: DEMO_STATS_DAYS, pages };
}

export function demoBioStats(pageId: string, days: number): BioPageStatsDetail | null {
  const seed = DEMO_SEEDS.find((s) => s.id === pageId);
  if (!seed) return null;
  return sampleBioStats(seed.id, seed.input, days, DEMO_MAX_DAYS, seed.scale);
}
