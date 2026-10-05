import type { GoogleReviewsStatus, GoogleReviewsList, GoogleReviewLocation } from "@/shared/types";

/**
 * A believable set of Google Business reviews for Acme, in the same spirit as
 * `demoStats`: deterministic, display-only, shaped like what the Google
 * Reviews endpoints actually return.
 */

const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
const DAY = 86_400_000;

const demoLocation: GoogleReviewLocation = {
  id: "demo-location-1",
  title: "Acme Inc. — HQ",
  address: "500 Market Street, San Francisco, CA",
  status: "connected",
  averageRating: 4.6,
  totalReviewCount: 128,
  lastSyncedAt: iso(3 * 3_600_000),
};

export function demoGoogleReviewsStatus(): GoogleReviewsStatus {
  return {
    configured: true,
    connected: true,
    connection: {
      googleEmail: "team@acme.example",
      status: "active",
      statusMessage: "",
      connectedAt: iso(60 * DAY),
    },
    locations: [demoLocation],
  };
}

const demoReviews: GoogleReviewsList["reviews"] = [
  {
    id: "demo-review-1",
    author: "Priya Nair",
    photo: "",
    rating: 5,
    comment: "Deployed our first project in minutes. The dashboard is genuinely a pleasure to use.",
    reply: "Thank you, Priya! Glad the onboarding landed well for your team.",
    createdAt: iso(2 * DAY),
  },
  {
    id: "demo-review-2",
    author: "Marcus Webb",
    photo: "",
    rating: 5,
    comment: "Support replied within the hour when we hit a snag with webhooks. Rare these days.",
    createdAt: iso(6 * DAY),
  },
  {
    id: "demo-review-3",
    author: "Elena Fischer",
    photo: "",
    rating: 4,
    comment: "Solid product. Would love more granular permissions for larger teams.",
    createdAt: iso(11 * DAY),
  },
  {
    id: "demo-review-4",
    author: "Tomás Rivera",
    photo: "",
    rating: 5,
    comment: "Switched from a bigger competitor and haven't looked back. Pricing is honest too.",
    reply: "Really appreciate you saying so, Tomás — welcome aboard.",
    createdAt: iso(18 * DAY),
  },
  {
    id: "demo-review-5",
    author: "Grace Holloway",
    photo: "",
    rating: 3,
    comment: "Good core product. The mobile experience could use some polish.",
    createdAt: iso(27 * DAY),
  },
  {
    id: "demo-review-6",
    author: "Daniel Okafor",
    photo: "",
    rating: 5,
    comment: "",
    createdAt: iso(34 * DAY),
  },
];

export function demoGoogleReviewsList(): GoogleReviewsList {
  return {
    reviews: demoReviews,
    breakdown: [
      { stars: 5, count: 86 },
      { stars: 4, count: 28 },
      { stars: 3, count: 9 },
      { stars: 2, count: 3 },
      { stars: 1, count: 2 },
    ],
  };
}
