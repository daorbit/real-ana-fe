export type ServiceCategory = "music" | "video" | "podcast" | "social" | "chat" | "shop" | "app" | "game" | "book" | "tickets" | "web";

export type BioService = {
  id: string;
  name: string;
  category: ServiceCategory;
  action: string;
  hosts: string[];
  logo?: boolean;
};

export const CUSTOM_SERVICE_ID = "custom";

export const BIO_SERVICES: BioService[] = [
  { id: "spotify", name: "Spotify", category: "music", action: "Play", hosts: ["open.spotify.com", "spotify.link"], logo: true },
  { id: "apple-music", name: "Apple Music", category: "music", action: "Play", hosts: ["music.apple.com"], logo: true },
  { id: "youtube-music", name: "YouTube Music", category: "music", action: "Play", hosts: ["music.youtube.com"], logo: true },
  { id: "youtube", name: "YouTube", category: "video", action: "Watch", hosts: ["youtube.com", "youtu.be", "m.youtube.com"], logo: true },
  { id: "jiosaavn", name: "JioSaavn", category: "music", action: "Play", hosts: ["jiosaavn.com"], logo: true },
  { id: "gaana", name: "Gaana", category: "music", action: "Play", hosts: ["gaana.com"] },
  { id: "wynk", name: "Wynk Music", category: "music", action: "Play", hosts: ["wynk.in"] },
  { id: "amazon-music", name: "Amazon Music", category: "music", action: "Play", hosts: ["music.amazon.com", "music.amazon.in"], logo: true },
  { id: "itunes", name: "iTunes Store", category: "music", action: "Buy", hosts: ["itunes.apple.com"] },
  { id: "deezer", name: "Deezer", category: "music", action: "Play", hosts: ["deezer.com", "deezer.page.link"], logo: true },
  { id: "tidal", name: "Tidal", category: "music", action: "Play", hosts: ["tidal.com", "listen.tidal.com"], logo: true },
  { id: "soundcloud", name: "SoundCloud", category: "music", action: "Play", hosts: ["soundcloud.com", "on.soundcloud.com"], logo: true },
  { id: "audiomack", name: "Audiomack", category: "music", action: "Play", hosts: ["audiomack.com"], logo: true },
  { id: "bandcamp", name: "Bandcamp", category: "music", action: "Buy", hosts: ["bandcamp.com"], logo: true },
  { id: "pandora", name: "Pandora", category: "music", action: "Play", hosts: ["pandora.com"] },
  { id: "boomplay", name: "Boomplay", category: "music", action: "Play", hosts: ["boomplay.com"] },
  { id: "anghami", name: "Anghami", category: "music", action: "Play", hosts: ["anghami.com"] },
  { id: "beatport", name: "Beatport", category: "music", action: "Buy", hosts: ["beatport.com"] },
  { id: "napster", name: "Napster", category: "music", action: "Play", hosts: ["napster.com"] },
  { id: "apple-podcasts", name: "Apple Podcasts", category: "podcast", action: "Listen", hosts: ["podcasts.apple.com"], logo: true },
  { id: "spotify-podcasts", name: "Spotify Podcasts", category: "podcast", action: "Listen", hosts: [] },
  { id: "instagram", name: "Instagram", category: "social", action: "Follow", hosts: ["instagram.com", "instagr.am"], logo: true },
  { id: "facebook", name: "Facebook", category: "social", action: "Follow", hosts: ["facebook.com", "fb.com", "fb.me", "m.facebook.com"], logo: true },
  { id: "whatsapp", name: "WhatsApp", category: "chat", action: "Chat", hosts: ["wa.me", "whatsapp.com", "api.whatsapp.com", "chat.whatsapp.com"], logo: true },
  { id: "x", name: "X", category: "social", action: "Follow", hosts: ["x.com", "twitter.com"], logo: true },
  { id: "threads", name: "Threads", category: "social", action: "Follow", hosts: ["threads.net", "threads.com"], logo: true },
  { id: "linkedin", name: "LinkedIn", category: "social", action: "Follow", hosts: ["linkedin.com", "lnkd.in"], logo: true },
  { id: "tiktok", name: "TikTok", category: "social", action: "Follow", hosts: ["tiktok.com", "vm.tiktok.com"], logo: true },
  { id: "snapchat", name: "Snapchat", category: "social", action: "Add", hosts: ["snapchat.com"], logo: true },
  { id: "telegram", name: "Telegram", category: "chat", action: "Join", hosts: ["t.me", "telegram.me", "telegram.org"], logo: true },
  { id: "netflix", name: "Netflix", category: "video", action: "Watch", hosts: ["netflix.com"], logo: true },
  { id: "prime-video", name: "Prime Video", category: "video", action: "Watch", hosts: ["primevideo.com"] },
  { id: "app-store", name: "App Store", category: "app", action: "Download", hosts: ["apps.apple.com"], logo: true },
  { id: "google-play", name: "Google Play", category: "app", action: "Download", hosts: ["play.google.com"], logo: true },
  { id: "google-play-books", name: "Google Play Books", category: "book", action: "Read", hosts: [] },
  { id: "steam", name: "Steam", category: "game", action: "Play", hosts: ["store.steampowered.com", "steampowered.com"] },
  { id: "amazon", name: "Amazon", category: "shop", action: "Buy", hosts: ["amazon.in", "amazon.com", "amzn.to", "amzn.in"], logo: true },
  { id: "flipkart", name: "Flipkart", category: "shop", action: "Buy", hosts: ["flipkart.com", "fkrt.it"] },
  { id: "myntra", name: "Myntra", category: "shop", action: "Shop", hosts: ["myntra.com"] },
  { id: "meesho", name: "Meesho", category: "shop", action: "Shop", hosts: ["meesho.com"] },
  { id: "nykaa", name: "Nykaa", category: "shop", action: "Shop", hosts: ["nykaa.com"] },
  { id: "shopify", name: "Online store", category: "shop", action: "Shop", hosts: ["myshopify.com"] },
  { id: "bookmyshow", name: "BookMyShow", category: "tickets", action: "Tickets", hosts: ["bookmyshow.com", "in.bookmyshow.com"] },
  { id: "district", name: "District", category: "tickets", action: "Tickets", hosts: ["district.in"] },
  { id: "ticketmaster", name: "Ticketmaster", category: "tickets", action: "Tickets", hosts: ["ticketmaster.com", "ticketmaster.co.uk"] },
  { id: "website", name: "Website", category: "web", action: "Visit", hosts: [] },
  { id: CUSTOM_SERVICE_ID, name: "Custom", category: "web", action: "Open", hosts: [] },
];

export const BIO_ACTIONS = [
  "Play", "Listen", "Watch", "Trailer", "Buy", "Shop", "Order", "Download", "Tickets", "Read", "Follow", "Subscribe", "Chat", "Ask",
  "Join", "Add", "Visit", "Open",
];

const BY_ID = new Map(BIO_SERVICES.map((s) => [s.id, s]));

export function serviceById(id: string): BioService {
  return BY_ID.get(id) ?? BY_ID.get(CUSTOM_SERVICE_ID)!;
}

function hostOf(url: string): string | null {
  try {
    const parsed = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    return parsed.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function detectService(url: string): BioService | null {
  const host = hostOf(url.trim());
  if (!host) return null;
  const match = BIO_SERVICES.find((s) => s.hosts.some((h) => host === h || host.endsWith(`.${h}`)));
  if (match?.id === "spotify" && /\/(show|episode)\//.test(url)) return serviceById("spotify-podcasts");
  return match ?? null;
}

export function looksLikeUrl(value: string): boolean {
  const host = hostOf(value.trim());
  return Boolean(host && host.includes("."));
}

export const SERVICE_SELECT_DATA = BIO_SERVICES.map((s) => ({ value: s.id, label: s.name }));
