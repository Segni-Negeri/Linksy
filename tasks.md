# Linksy — Granular MVP Task List (one task per line)

This file contains very small, testable tasks derived from the architecture.md design. Each task has a single concern, clear start and end, and a short test to verify completion. (Plan based on architecture.md) 

---

## Setup & repo
1. **Init repo & README**  
**Start:** empty folder `/mnt/data/linksy_project`.  
**End:** `.git` initialized, `README.md` created with a short project summary.  
**Test:** `git status` returns repository root and `README.md` exists.

2. **Create package.json with scripts**  
**Start:** repo exists.  
**End:** `package.json` contains scripts: `dev`, `build`, `start`, `lint`.  
**Test:** run `npm run dev` shows Next.js not installed (script exists).

3. **Install core dependencies**  
**Start:** `package.json` present.  
**End:** `npm install next react react-dom typescript @types/react @types/node @supabase/supabase-js axios` completes.  
**Test:** `node_modules` exists and `npx next --version` prints version.

4. **Add TypeScript config**  
**Start:** TypeScript installed.  
**End:** `tsconfig.json` created with Next.js recommended settings.  
**Test:** `npx tsc --noEmit` runs without crashing (may show type errors but no crash).

5. **Add .gitignore and .env example**  
**Start:** repo initialized.  
**End:** `.gitignore` (node_modules, .env.local) and `.env.local.example` with SUPABASE & GOOGLE placeholders exist.  
**Test:** files present and `.env.local.example` contains `NEXT_PUBLIC_SUPABASE_URL`.

6. **Create Next.js page skeleton**  
**Start:** project root.  
**End:** `src/pages/_app.tsx`, `src/pages/index.tsx`, `src/pages/api/hello.ts` created and compile.  
**Test:** `npm run dev` loads index page at `/`.

7. **Add global CSS & basic UI folder**  
**Start:** Next pages created.  
**End:** `src/styles/globals.css` and `src/components/ui/Button.tsx` exist and imported in `_app.tsx`.  
**Test:** Button component renders on index page.

---

## Supabase schema & infra
8. **Create SQL migration file (migrate.sql)**  
**Start:** scripts folder in repo.  
**End:** `scripts/migrate.sql` contains CREATE TABLE statements for `links`, `tasks`, `visits`, `completions`.  
**Test:** SQL file exists and `psql` / Supabase migration accepts it (manual apply).

9. **Add infra supabase policy stubs**  
**Start:** infra folder exists.  
**End:** `infra/supabase/policies.sql` with placeholder RLS policies for `links` (owner-only).  
**Test:** file exists and contains `CREATE POLICY`.

10. **Write seed SQL with one test user and link**  
**Start:** migration ready.  
**End:** `scripts/seed.sql` inserts a test user, a sample link and a sample task.  
**Test:** Running seed inserts rows in Supabase (manual verification).

---

## Supabase client & auth helpers
11. **Create supabaseClient.ts (browser)**  
**Start:** lib folder exists.  
**End:** `src/lib/supabaseClient.ts` exports `supabase` initialized with `NEXT_PUBLIC_SUPABASE_URL` and `ANON_KEY`.  
**Test:** Importing `supabase` in a page does not throw.

12. **Create server admin client factory**  
**Start:** lib exists.  
**End:** `src/lib/supabaseAdmin.ts` exports `createAdminClient()` using `SUPABASE_SERVICE_ROLE_KEY` (server-only).  
**Test:** Serverless API can import and call admin client in SSR (no runtime import in browser).

13. **Implement auth helpers (getUserServerSide)**  
**Start:** supabase clients present.  
**End:** `src/lib/auth.ts` exports `getUserFromReq(req)` that verifies JWT and returns user id.  
**Test:** Unit test or manual call returns null for unauthenticated request and user object for valid token.

14. **Create useUser hook**  
**Start:** auth helpers implemented.  
**End:** `src/hooks/useUser.ts` uses `supabase.auth.getUser()` and exposes `user, loading, signIn, signOut`.  
**Test:** Hook used on index page shows sign-in button and user info after login.

---

## API: links & tasks CRUD (server-side)
15. **Implement POST /api/links (create)**  
**Start:** pages/api skeleton.  
**End:** `src/pages/api/links/index.ts` accepts authenticated POST, validates payload, inserts `links` row, returns 201 with link id.  
**Test:** `curl -X POST /api/links` with valid JWT returns 201 and JSON `{id, slug}`.

16. **Implement GET /api/links (list)**  
**Start:** create endpoint file.  
**End:** same file supports GET returning links for authenticated user.  
**Test:** `curl /api/links` returns array of user's links.

17. **Implement GET /api/links/[id]**  
**Start:** endpoint scaffolding.  
**End:** `src/pages/api/links/[id].ts` returns link with tasks when requested by owner.  
**Test:** GET returns link object with `tasks` array.

18. **Implement PATCH /api/links/[id]**  
**Start:** [id].ts present.  
**End:** PATCH updates title/destination/brand fields and returns 200.  
**Test:** PATCH returns updated object.

19. **Implement DELETE /api/links/[id] (soft-delete)**  
**Start:** [id].ts present.  
**End:** DELETE sets `is_deleted=true`; subsequent GET returns 404 or no data.  
**Test:** DELETE returns 204 and GET returns 404.

20. **Add slug GET endpoint (public)**  
**Start:** API routes.  
**End:** `src/pages/api/links/slug/[slug].ts` returns public link and tasks by slug.  
**Test:** `curl /api/links/slug/testslug` returns the public link object without owner info.

21. **Implement POST /api/visits (record visit)**  
**Start:** API folder.  
**End:** Endpoint that inserts row into `visits` with `link_id, ip, user_agent`.  
**Test:** Calling from public page stores a row (verify via Supabase).

22. **Implement POST /api/verify/[taskId] (record verification)**  
**Start:** verify route file.  
**End:** Endpoint validates request, inserts `completions` row with status `pending|success|failed`.  
**Test:** POST returns 200 and `completions` entry exists.

23. **Stub POST /api/webhooks/social-callback**  
**Start:** api/webhooks folder.  
**End:** Endpoint accepts webhook payload and returns 200 after creating completion via admin client.  
**Test:** Simulated POST creates completion with `method=webhook`.

---

## UI: Public task page & visit flow
24. **Create public page route `src/pages/l/[slug].tsx`**  
**Start:** pages folder ready.  
**End:** Page fetches `/api/links/slug/:slug` server-side and renders link title and tasks.  
**Test:** Visiting `/l/testslug` renders content from API.

25. **Log visit on page load**  
**Start:** public page fetch implemented.  
**End:** On initial client load, POST to `/api/visits` with `link_id`; API returns 201.  
**Test:** Visit row appears in Supabase for each page load.

26. **Render task CTA buttons**  
**Start:** Public page UI exists.  
**End:** Each task displays a primary CTA button (e.g., "I Subscribed") that triggers verification flow.  
**Test:** Buttons exist and are clickable.

27. **Implement simple "simulate verify" flow for dev**  
**Start:** CTA buttons clickable.  
**End:** Clicking button calls `/api/verify/:taskId` with method `redirect_check` and updates completions to success in dev.  
**Test:** After click, `/api/completions` shows success row and UI shows unlocked state.

28. **Show unlocked destination after all required tasks completed**  
**Start:** verify endpoint writes completions.  
**End:** Public page queries completions and shows destination link when required tasks are complete.  
**Test:** After simulating completions, destination link appears and is clickable.

---

## UI: Dashboard & Link management
29. **Create dashboard index page**  
**Start:** `src/pages/dashboard/index.tsx` file.  
**End:** Page lists user's links by calling `/api/links`.  
**Test:** Signed-in user sees list of links.

30. **Implement "Create new link" page UI (`new.tsx`)**  
**Start:** dashboard index done.  
**End:** Form with fields `slug,title,destination,brandColor,logoUrl` posts to `/api/links`.  
**Test:** Submitting creates link and redirects to link editor.

31. **Implement link editor page UI (`[id].tsx`)**  
**Start:** new link creation working.  
**End:** Page fetches link by id, populates form, allows saving PATCH.  
**Test:** Editing title + save updates DB and shows success.

32. **Add TaskList UI inside Link Editor**  
**Start:** editor page present.  
**End:** Add UI to create a task (type, target, label) that POSTs to `/api/links/:id/tasks` (implement server route).  
**Test:** New task appears in tasks table and in link editor.

33. **Implement server route POST /api/links/:id/tasks**  
**Start:** API endpoints for links exist.  
**End:** Route inserts task row linked to link_id and returns 201.  
**Test:** POST returns task id and DB shows row.

34. **Add delete/edit task actions in UI**  
**Start:** TaskList shows tasks.  
**End:** Provide UI to edit and delete tasks via PATCH/DELETE endpoints.  
**Test:** Edit changes label; delete soft-removes task.

---

## Auth & protection
35. **Implement Supabase OAuth sign-in flow (Google)**  
**Start:** Supabase project configured manually.  
**End:** `useUser` signIn triggers redirect/popup and after login, user state is set.  
**Test:** Signing in sets cookie/session and user email shown.

36. **Protect dashboard pages (client-side redirect)**  
**Start:** dashboard pages exist.  
**End:** Unauthenticated users are redirected to home and shown "Please sign in".  
**Test:** Accessing `/dashboard` while signed out redirects to `/`.

37. **Server-side API auth checks**  
**Start:** API endpoints created.  
**End:** Each protected API verifies JWT and returns 401 if invalid.  
**Test:** Calling APIs without token returns 401.

---

## Analytics & metrics
38. **Create GET /api/analytics/:linkId endpoint**  
**Start:** basic APIs implemented.  
**End:** Endpoint returns totals: visits, completions, conversionRate.  
**Test:** Create visits/completions and GET returns correct counts and conversionRate.

39. **Implement AnalyticsPanel UI**  
**Start:** analytics endpoint available.  
**End:** Dashboard link editor shows counts and a simple line chart (static SVG or table) of visits over last 7 days.  
**Test:** Values match numbers from DB.

40. **Add basic caching for analytics (server-side)**  
**Start:** analytics endpoint done.  
**End:** Endpoint caches results for 30s in-memory (or using Next.js ISR) to reduce DB load.  
**Test:** Repeated calls within 30s return cached timestamp.

---

## Verification robustness
41. **Add manual claim endpoint `/api/claims`**  
**Start:** verification endpoints exist.  
**End:** Endpoint accepts `visit_id, task_id, proof_url` and inserts completion with `method=manual,status=pending`.  
**Test:** POST returns 201 and completion status `pending`.

42. **Add admin mark-complete endpoint (server-only)**  
**Start:** manual claims table exists.  
**End:** Admin-only endpoint marks manual completion `success` using service_role admin client.  
**Test:** Calling with admin token flips pending->success.

43. **Implement webhook simulation tool**  
**Start:** webhooks endpoint stub exists.  
**End:** Small script `scripts/send_webhook.js` that posts fake webhook payload to `/api/webhooks/social-callback` for testing.  
**Test:** Running script creates completion via webhook.

---

## Security & RLS
44. **Write RLS policies for links (owner only)**  
**Start:** infra/policies.sql stub exists.  
**End:** RLS policy prevents non-owners from SELECT/INSERT/UPDATE/DELETE on `links`.  
**Test:** Attempting to read another user's link via anon client fails.

45. **Ensure service_role key only used server-side**  
**Start:** admin client created.  
**End:** No client-side code imports `SUPABASE_SERVICE_ROLE_KEY`; server-only files reference admin client.  
**Test:** Build fails if service_role is imported into client bundle.

46. **Add input validation on all API endpoints**  
**Start:** endpoints implemented.  
**End:** Each API uses `validators.ts` to validate payloads and returns 400 on invalid input.  
**Test:** Sending invalid payload returns 400 and error.

47. **Add simple rate-limiting middleware for public endpoints**  
**Start:** public endpoints exist.  
**End:** In-memory rate limiter prevents >20 req/min per IP to `/api/links/slug/*`.  
**Test:** Exceed limit triggers 429 response.

---

## Billing / plan limits (MVP)
48. **Enforce free plan link limit on POST /api/links**  
**Start:** users table has `plan` column.  
**End:** Creation checks user link count and rejects if >10 for free plan.  
**Test:** After 10 links, POST returns 402 or 403 with clear message.

49. **Add `plan` field to user profile UI**  
**Start:** user object available.  
**End:** Dashboard shows plan name and link count usage.  
**Test:** UI shows "Free — 7/10 links".

---

## Dev tooling & tests
50. **Add API smoke tests (curl scripts)**  
**Start:** endpoints implemented.  
**End:** `scripts/test_apis.sh` runs curl commands to assert 200/201 codes.  
**Test:** Running script exits 0.

51. **Add unit test for slug generator**  
**Start:** utility function exists.  
**End:** Jest test asserts slug uniqueness and sanitization.  
**Test:** `npm test` passes slug tests.

52. **Create Postman or curl collection doc**  
**Start:** APIs stable.  
**End:** `docs/postman_collection.json` with common requests for manual QA.  
**Test:** Importable into Postman and requests run.

---

## Deployment & CI
53. **Add Vercel/Cursor deployment config**  
**Start:** repo ready.  
**End:** `vercel.json` or `cursor.json` with build settings and env var placeholders.  
**Test:** Deploy to preview environment builds successfully.

54. **Add GitHub Actions CI to run lint/build/tests**  
**Start:** repo on GitHub.  
**End:** `.github/workflows/ci.yml` runs `npm ci && npm run build && npm test`.  
**Test:** Pushing branch triggers workflow and passes.

---

## Final polish (optional before public launch)
55. **Create README dev setup steps**  
**Start:** project built.  
**End:** README contains step-by-step dev setup including Supabase migration and env vars.  
**Test:** A new developer can follow README and run app locally.

56. **Add simple analytics dashboard link for first 100 users**  
**Start:** analytics implemented.  
**End:** Add CTA in README or landing to claim pro early access (manual opt-in).  
**Test:** Signing up adds user to `early_access` table via API.

---

*Notes:* each API task assumes environment variables are set locally and Supabase project is provisioned (manual step). This file is intentionally granular so an LLM agent can complete one small task at a time and you can verify after each step.
