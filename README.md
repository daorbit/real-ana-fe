# Quantalog Dashboard

The web app for [Quantalog](https://quantalog.daorbit.in), where customers see real-time analytics, run SEO audits, build dashboards, schedule reports and posts, and chat with Orbit AI.

- **Stack:** React 19, Vite 8, TypeScript, Mantine 9, Redux Toolkit Query, React Router 7, i18next
- **Production:** `https://studio-quantalog.daorbit.in`, deployed to Vercel as a static single-page app
- **Product docs:** https://quantalog.daorbit.in/docs

## Getting started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api` to the backend on `http://localhost:4000`. Start the backend from `../real-ana-be`, or run `npm run dev` in the parent `real-time-analytics` folder to start everything at once.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Vite dev server |
| `npm run build` | Type-checks, then builds to `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Lints with oxlint |
| `npm run test:e2e` | Runs the Playwright end-to-end tests (`test:e2e:ui` for the interactive runner) |

## Environment variables

Set them in `.env.development` / `.env.production` locally and in the Vercel project for deploys. Everything here ships to the browser, so never put a secret in these files.

| Variable | Purpose |
|---|---|
| `VITE_API_BASE` | Backend origin. Leave empty in development to use the `/api` proxy |
| `VITE_GOOGLE_CLIENT_ID` | Google sign-in |
| `CLOUDFLARE_SITE_KEY` | Cloudflare Turnstile site key (bot protection on login) |
| `VITE_LEAD_FORMS_URL` | Origin of the embedded forms service |
| `VITE_SENTRY_DSN` | Optional. Turns on error tracking |
| `VITE_RELEASE` | Optional. Release name attached to error reports |

## Project structure

```
src/main.tsx            Providers and app boot
src/app/                Routes (App.tsx), app shell, RTK Query API (store/api.ts), startup prefetch
src/features/<feature>/ Feature code: pages, components, hooks, lib
src/shared/             Cross-feature UI, hooks, utilities and types
src/lib/i18n/           Translations (en, es, hi, ja)
e2e/                    Playwright tests
public/                 Static assets, service worker and embed.js
```

## How it stays fast

- Only the auth pages and Home are in the first bundle. Every other page is lazy-loaded and pre-loaded when you hover its link.
- Heavy libraries (maps, charts beyond Home, code highlighting, animations) load only on the screen that uses them.
- All server data goes through RTK Query: one shared cache, tag-based invalidation, and polling only for live figures.
- On startup, Home's data is requested at the same time as the session check instead of after it (`src/app/bootPrefetch.ts`).

`CLAUDE.md` holds the full performance and coding rules for this codebase. Read it before making changes.
