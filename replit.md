# Acquire 360 Ventures Ltd — Website & Admin CMS

A public procurement/supply company website for Acquire 360 Ventures Ltd (Uganda), with a
secured admin dashboard for managing all site content, a request-for-quotation (RFQ) system,
and a media library for image/document uploads backed by Cloudflare R2.

## Run & Operate

- `pnpm run dev` — run the API server and frontend together (from the workspace root)
- `pnpm --filter @workspace/api-server run dev` — run just the API server (defaults to `PORT=5000` locally; reads secrets from `artifacts/api-server/.env` via `dotenv` if present)
- `pnpm --filter @workspace/acquire-360-ventures run dev` — run just the frontend (defaults to `PORT=5173`; proxies `/api` to `http://localhost:$API_PORT`, default 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from `lib/api-spec/openapi.yaml` (run this after any OpenAPI change)
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed the database with the company's initial content and an admin user

### Local setup

Copy `artifacts/api-server/.env.example` to `artifacts/api-server/.env` and fill in real values
(a local/dev Postgres `DATABASE_URL`, a `JWT_SECRET`, and R2 credentials — see below). This file
is gitignored and loaded automatically via `dotenv` when the API server starts. On Replit, set
the same variables as Secrets instead — no `.env` file is used there.

### Required environment variables

- `DATABASE_URL` — Postgres connection string (auto-provisioned on Replit)
- `JWT_SECRET` — random secret used to sign admin session cookies
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` — Cloudflare R2 credentials for the media bucket
- `R2_PUBLIC_URL` — the bucket's public base URL (its R2.dev "Public Development URL", or a custom domain bound to the bucket in the Cloudflare dashboard) — object keys are appended to this to build each file's public URL
- `PORT` — required by both the frontend (Vite) and the API server processes (the `dev` scripts default this locally; Replit's deploy/build pipeline sets it itself — don't hardcode it there)
- `BASE_PATH` — Vite base path (usually `/`)
- `API_PORT` — (dev only) port the frontend's Vite proxy forwards `/api` to
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — optional, used only by the seed script to create the first admin login; defaults to `admin@acquire360ventures.com` / `ChangeMe123!` if unset. **Change the password immediately after first login.**

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Vite + React 19 + wouter (routing) + TanStack Query + Tailwind + shadcn/ui + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: bcryptjs password hashing + JWT stored in an httpOnly session cookie (`a360_session`)
- File storage: Cloudflare R2 (S3-compatible) via `@aws-sdk/client-s3` — images and documents (PDF/Word/Excel), uploaded through multer's in-memory storage and streamed straight to the bucket
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from `lib/api-spec/openapi.yaml` → `lib/api-zod` and `lib/api-client-react`)
- Build: esbuild (API server bundle), Vite (frontend bundle)
- Dev orchestration: `concurrently` (root `dev` script) + `cross-env` (cross-platform env vars in each package's `dev` script) + `dotenv` (loads `artifacts/api-server/.env` locally)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for the API contract (public content, admin CRUD, auth, media, RFQ). Edit this, then run the `codegen` script.
- `lib/db/src/schema/index.ts` — Drizzle schema (source of truth for the DB shape): `users`, `mediaAssets` (incl. `objectKey` for R2 deletion), `companyProfiles`, `services`, `projects`, `products`, `teamMembers`, `clients`, `rfqs`.
- `artifacts/api-server/src/routes/content.ts` — public read endpoints + public RFQ submission/attachment upload (uploads to R2 under `rfq-attachments/`).
- `artifacts/api-server/src/routes/admin.ts` — authenticated CRUD for company profile, services, projects, products, team, clients, and RFQ status/listing.
- `artifacts/api-server/src/routes/auth.ts` — login/logout/me.
- `artifacts/api-server/src/routes/media.ts` — authenticated media library (list/upload/delete), enforces the 20-image cap.
- `artifacts/api-server/src/lib/upload.ts` — multer in-memory storage config (10MB limit, allowed mime types, `MAX_IMAGES = 20`).
- `artifacts/api-server/src/lib/r2.ts` — R2 client (`uploadToR2`/`deleteFromR2`), objects stored under `media/` or `rfq-attachments/`.
- `artifacts/acquire-360-ventures/src/App.tsx` — public site (Home, About, Services, Projects, Products, Quote, Contact) and top-level routing.
- `artifacts/acquire-360-ventures/src/admin/` — the entire admin dashboard: `shell.tsx` (layout + auth guard + mobile nav), `login.tsx`, `dashboard.tsx` (overview), `company.tsx` (profile editor), `entity-crud.tsx` (generic list/create/edit/delete engine used by services/projects/products/team/clients), `media.tsx` (shows the X/20 image quota), `rfqs.tsx`.
- `artifacts/acquire-360-ventures/src/lib/auth-context.tsx` — client-side auth state (current user, login, logout).
- `artifacts/acquire-360-ventures/src/lib/api-error.ts` — pulls the server's `{ error }` message out of a failed mutation for display (e.g. the image-quota message).
- `scripts/src/seed.ts` — idempotent seed script with the company's initial content.

## Architecture decisions

- Admin auth uses a JWT inside an httpOnly, `sameSite=lax` cookie rather than server-side sessions, avoiding an extra sessions table. `cookie-parser` reads it; `requireAuth` middleware verifies it.
- The public frontend calls the API via relative `/api/...` paths (see `custom-fetch.ts`), so the frontend and API are assumed to be served from the same origin in production. A Vite dev-server proxy (`/api` → `API_PORT`) makes this work in local development where the two run as separate processes.
- The generic `EntityPage`/`EntityDialog` components in `src/admin/entity-crud.tsx` drive all five CRUD admin sections (services, projects, products, team, clients) from a per-entity field/column config, instead of five near-duplicate hand-built pages.
- **Media storage is Cloudflare R2, not local disk** — required for the app to work on multi-instance/ephemeral-filesystem deployments (Replit Autoscale can run several instances; local disk wouldn't be shared or durable across them). `mediaAssets.objectKey` is stored separately from the public `url` so deletes don't depend on parsing the URL.
- **Image cap of 20**: `POST /media` counts existing rows where `kind = 'image'` before accepting a new image upload, and rejects with a 400 + explanatory message once the count reaches `MAX_IMAGES` (20). This only applies to images in the media library (used by service/project/product/team/client image fields); it does **not** apply to non-image documents in the media library, nor to RFQ attachments (a separate, unauthenticated upload path for customer-submitted spec documents). The admin must delete an existing image before uploading another once at the cap — there is no automatic eviction.
- `companyProfiles.coreValues` is a Postgres text array so the "Core Values" list (Reliability, Quality, Professionalism, Customer Satisfaction, Efficiency) is admin-editable rather than hardcoded.
- Bcrypt hashing uses `bcryptjs` (pure JS) instead of native `bcrypt`, to avoid native-module build steps across environments.

## Product

- **Public site**: Home (hero, about preview, services, featured projects, trusted clients, CTA), About (vision/mission/core values/team), Services, Projects, Products (search + category filter), Request-for-Quotation form (with file attachment upload), Contact.
- **Admin dashboard** (`/admin`, login-gated): overview stats, company profile editor, full CRUD for services/projects/products/team/clients, media library (image + document upload, capped at 20 images with a visible X/20 counter), and an RFQ inbox with status updates (new/reviewing/quoted/closed).

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, always run `pnpm --filter @workspace/api-spec run codegen` before touching frontend/backend code that consumes it — the Zod schemas (backend validation) and react-query hooks (frontend) are both generated from it.
- The Zod-side request bodies coerce `date`-format fields to a JS `Date` (`zod.coerce.date()`), but the react-query/TypeScript side keeps them as plain strings (`YYYY-MM-DD`) — send date strings from the frontend; the backend converts back to a string before writing to Drizzle's `date` column (see `toDateString()` in `admin.ts`).
- `lib/api-zod`'s tsconfig needs `"dom"` in `lib` (in addition to `es2022`) because multipart upload schemas reference `File`/`Blob`.
- `src/lib/r2.ts` and `src/lib/auth.ts` read their required env vars at **module import time** and throw immediately if missing — `dotenv/config` must stay the very first import in `src/index.ts` so `.env` is loaded before those modules evaluate.
- The image-quota check in `media.ts` counts rows before uploading to R2, so a rejected upload never touches the bucket — but there's a small race window under concurrent uploads (two simultaneous requests could both pass the count check); acceptable given this is a single-admin CMS, not a public upload endpoint.
- This repo installs on Windows for editing, but the frontend's Vite/Rollup build only works in the Linux Replit environment (Windows-specific Rollup binaries are deliberately excluded in `pnpm-workspace.yaml`). Use `pnpm run typecheck` locally; do the actual `vite build` in the Replit container.
- Local Postgres testing requires your own `DATABASE_URL`; Replit auto-provisions one.
- Only the `dev` scripts hardcode local ports/paths via `cross-env` — `build`/`start`/`serve` are left untouched since Replit's deploy pipeline sets `PORT`/`BASE_PATH` itself.

## User preferences

_None recorded yet._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Deployment (Replit)

1. Open the Repl and confirm the `postgresql-16` module is provisioned (`.replit` already declares it) — `DATABASE_URL` will be set automatically.
2. In Replit Secrets, set `JWT_SECRET`, the five `R2_*` variables (create a bucket in the Cloudflare dashboard, generate R2 API tokens, and enable a public URL for the bucket), and optionally `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.
3. Run `pnpm install` at the workspace root.
4. Push the DB schema: `pnpm --filter @workspace/db run push`.
5. Seed initial content and the first admin user: `pnpm --filter @workspace/scripts run seed`.
6. Build everything: `pnpm run build`.
7. Deploy via Replit's Autoscale deployment (already configured in `.replit`: `deploymentTarget = "autoscale"`), which runs the built API server and serves the built frontend.
8. Log in at `/admin/login` with the seeded admin credentials, then immediately change the password by re-seeding with new `SEED_ADMIN_PASSWORD` or adding a "change password" flow before going live with real credentials.
