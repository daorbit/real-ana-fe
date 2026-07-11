export type User = { id: string; email: string; name: string };

export type Workspace = {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type Site = {
  _id: string;
  workspaceId: string;
  name: string;
  domain: string;
  framework: string;
  siteId: string;
  createdAt: string;
};

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt?: string;
  createdAt: string;
  key?: string; // only present right after creation
};

export type Bucket = { key: string; count: number };

export type Stats = {
  range: string;
  pageviews: number;
  visitors: number;
  live: number;
  topPages: Bucket[];
  topReferrers: Bucket[];
  devices: Bucket[];
  countries: Bucket[];
  utmSources: Bucket[];
  timeseries: { bucket: string; views: number }[];
  siteCount?: number;
};
