export type LinkRel = "follow" | "nofollow" | "ugc" | "sponsored";
export type BacklinkOrigin = "referral" | "manual" | "index" | "scan";
export type BacklinkStatus = "pending" | "live" | "unverified" | "lost" | "page-gone" | "unreachable";
export type AnchorKind = "branded" | "keyword" | "url" | "generic" | "image";
export type SourceKind = "editorial" | "directory" | "community" | "social";

export type Backlink = {
  _id: string;
  siteId: string;
  sourceUrl: string;
  sourceDomain: string;
  targetUrl: string;
  anchorText: string;
  rel: LinkRel;
  isImage: boolean;
  origin: BacklinkOrigin;
  status: BacklinkStatus;
  httpStatus: number | null;
  authority: number | null;
  referralVisits: number;
  lastReferralAt: string | null;
  lastLiveAt: string | null;
  lostAt: string | null;
  lastCheckedAt: string | null;
  lastError: string;
  createdAt: string;
};

export type CompetitorBacklink = {
  _id: string;
  competitorId: string;
  sourceUrl: string;
  sourceDomain: string;
  targetUrl: string;
  anchorText: string;
  rel: LinkRel;
  isImage: boolean;
  origin: "index" | "scan";
  status: "live" | "lost";
  authority: number | null;
  lastSeenAt: string;
};

export type ProfileInsight = {
  id: string;
  tone: "strength" | "risk" | "neutral";
  title: string;
  detail: string;
};

export type LinkProfile = {
  totalLinks: number;
  referringDomains: number;
  followShare: number;
  avgAuthority: number | null;
  rel: Record<LinkRel, number>;
  anchors: Record<AnchorKind, number>;
  sources: Record<SourceKind, number>;
  topAnchors: { text: string; count: number; kind: AnchorKind }[];
  topDomains: { domain: string; links: number; authority: number | null; kind: SourceKind }[];
  insights: ProfileInsight[];
};

export type GapRow = {
  domain: string;
  kind: SourceKind;
  authority: number | null;
  competitors: { competitorId: string; label: string }[];
  sampleUrl: string;
  sampleAnchor: string;
};

export type CompetitorProfile = {
  competitorId: string;
  label: string;
  domain: string;
  profile: LinkProfile;
};

export type BacklinkOverview = {
  indexAvailable: boolean;
  summary: {
    total: number;
    live: number;
    referringDomains: number;
    followShare: number;
    lost: number;
    lostRecently: number;
    newRecently: number;
    awaiting: number;
    referralVisits: number;
    opportunities: number;
  };
  profiles: {
    mine: LinkProfile;
    competitors: CompetitorProfile[];
  };
  gap: {
    opportunities: GapRow[];
    shared: GapRow[];
    uniqueToYou: number;
  };
};

export type FoundLink = {
  targetUrl: string;
  anchorText: string;
  rel: LinkRel;
  isImage: boolean;
};

export type PageCheckResult = {
  url: string;
  httpStatus: number;
  you: FoundLink | null;
  competitors: { competitorId: string; label: string; domain: string; link: FoundLink | null }[];
};

export type VerifySummary = { checked: number; live: number; lost: number; failed: number };

export type DiscoverResult = {
  discovered: number;
  added: number;
  verified: VerifySummary;
  remaining: number;
};

export type IndexSyncResult = {
  mine: number;
  competitors: { competitorId: string; label: string; links: number; error: string }[];
};

export type SiteArgs = { workspaceId: string; siteId: string };
