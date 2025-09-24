# Linksy — Architecture & Project Structure

## Overview
Linksy is a Cursor-deployable micro-SaaS using Next.js for the frontend (and serverless API routes) and Supabase for the database and auth. The app provides branded short links that gate destinations behind configurable social tasks with verification. This document describes the recommended file/folder layout, responsibilities for each part, where state lives, and how services connect.

## File & Folder Structure
```
linksy_project/
├─ architecture.md
├─ README.md
├─ .env.local.example
├─ package.json
├─ tsconfig.json
├─ next.config.js
├─ public/
│  ├─ favicon.ico
│  └─ assets/
├─ src/
│  ├─ pages/
│  │  ├─ _app.tsx
│  │  ├─ _document.tsx
│  │  ├─ index.tsx                 # marketing / landing
│  │  ├─ dashboard/
│  │  │  ├─ index.tsx              # protected dashboard overview
│  │  │  ├─ new.tsx                # create link flow
│  │  │  └─ [id].tsx               # link editor & analytics
│  │  ├─ l/[slug].tsx              # public task page (link lock)
│  │  └─ api/
│  │     ├─ auth/                  # optional auth endpoints if using server-side
│  │     │  └─ callback.ts
│  │     ├─ links/
│  │     │  ├─ index.ts            # GET (list), POST (create)
│  │     │  └─ [id].ts             # GET, PATCH, DELETE
│  │     ├─ verify/
│  │     │  └─ [taskId].ts         # POST verification attempt
│  │     └─ webhooks/
│  │        └─ social-callback.ts  # optional webhook handlers
│  ├─ components/
│  │  ├─ ui/                       # primitive UI: Button, Input, Modal...
│  │  ├─ LinkEditor/
│  │  ├─ TaskList/
│  │  ├─ AnalyticsPanel/
│  │  └─ PublicTaskPage/
│  ├─ lib/
│  │  ├─ supabaseClient.ts         # Supabase client wrapper
│  │  ├─ auth.ts                   # auth utilities
│  │  ├─ api.ts                    # fetch wrappers for server/client
│  │  └─ validators.ts
│  ├─ hooks/
│  │  ├─ useUser.ts
│  │  ├─ useLinks.ts
│  │  └─ useAnalytics.ts
│  ├─ types/
│  │  └─ db.ts                     # TypeScript interfaces for tables/entities
│  └─ styles/
│     └─ globals.css
├─ scripts/
│  └─ migrate.sql                  # SQL for initial Supabase tables
└─ infra/
   └─ supabase/                    # optional local infra helpers, policies
```

## What each part does (brief)
- `pages/`: Next.js pages (SSG/SSR where appropriate). `l/[slug].tsx` is the public-facing locked link page that runs the verification flows. `dashboard` pages are protected.
- `pages/api/`: Serverless API endpoints used for CRUD and verification. Use these to perform secure actions server-side (e.g., sign webhooks, call third-party verification endpoints).
- `components/`: Reusable UI pieces. Keep public page components separate from dashboard components.
- `lib/supabaseClient.ts`: Single source of truth for Supabase connection; export both client (for browser) and admin client (service_role key used only in server-side code).
- `hooks/`: Client-side data-fetching and local state hooks.
- `scripts/migrate.sql`: Initial table definitions and indexes to run against Supabase.
- `infra/`: Policy SQL, RLS and other infra-as-code pieces.

## Data model / Supabase schema (core tables)
- `users` (managed by Supabase Auth) — `id, email, name, avatar, plan, created_at`
- `links` — `id, user_id (fk users), slug (unique), destination, title, logo_url, brand_color, custom_domain, is_deleted, created_at, expires_at`
- `tasks` — `id, link_id (fk links), type (youtube, instagram, join_telegram, manual), target (url/handle), label, meta jsonb, required (bool), created_at`
- `visits` — `id, link_id, ip, user_agent, referer, created_at`
- `completions` — `id, visit_id (fk visits), task_id (fk tasks), method (webhook, redirect_check, manual), status, meta jsonb, created_at`
- `analytics_materialized` (optional) — precomputed aggregates for fast dashboard read queries

## API endpoints (Next.js serverless)
Use Next.js API routes to mediate actions requiring secrets (service_role key).
- `POST /api/links` — creates a link (server verifies user via Supabase JWT)
- `GET /api/links` — list user links
- `GET /api/links/:id` — get link + tasks
- `PATCH /api/links/:id` — update link
- `DELETE /api/links/:id` — soft-delete
- `GET /api/links/slug/:slug` — return public link + tasks for rendering
- `POST /api/verify/:taskId` — attempt/record verification (server-side may call third-party or validate redirect params)
- `POST /api/webhooks/social-callback` — receive platform callbacks if used
- `GET /api/analytics/:linkId` — aggregated metrics (cached)

## Auth & session
- Use Supabase Auth (OAuth with Google) for signin. Client-side uses `supabaseClient.auth` and server-side verifies JWT via Supabase helper.
- For server operations that need full privileges (e.g., mark completions by webhook), use a Supabase Admin client (`service_role` key) only in serverless functions — **never expose** to browser.

## Where state lives & how services connect
- Client UI state: ephemeral UI form state in components/hooks.
- Remote persisted state: Supabase tables (links, tasks, visits, completions).
- Realtime / sync: optional Supabase Realtime for live analytics updates in dashboard.
- Verification flow: public page logs a `visit` (POST to `/api/visits`), then each task can attempt verification:
  - Redirect/confirm param method: user clicks "I subscribed" — they are redirected to a platform URL that returns to `/api/verify/:taskId?confirm=...`; server verifies and writes `completion`.
  - Webhook method: platform sends callback -> `/api/webhooks/social-callback` -> server writes `completion`.
  - Manual claim: user uploads proof or enters handle; admin or automated heuristic verifies and marks completion.
- CDN & assets: `public/assets` served via Next static hosting.

## UI components to build first (priority)
1. PublicTaskPage: render tasks & CTA, run verification flows.
2. LinkEditor: create slug, title, brand, add tasks.
3. DashboardList: list links, quick actions (copy, activate).
4. AnalyticsPanel: simple conversion metrics and timeline.

## Deployment & env
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_URL` (if used), `GOOGLE_OAUTH_CLIENT_ID/SECRET`, `CUSTOM_DOMAINS_API_KEY`.
- Deploy Next.js to Vercel or Cursor (Cursor supports Next apps). Place serverless-only secrets in platform secret storage.

## Notes & assumptions
- (Assume you will use Supabase Auth with Google only; if you need other providers, add them in Supabase.)
- Implement strict RLS policies so users can only access their `links/tasks` unless server-side service_role operations.

