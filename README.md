# ATARI AMS

Rebuild of the ICAR-ATARI Agriculture Management System (Zone IV, Patna) on
Next.js - Super Admin, KVK Admin and KVK User panels, with a real Postgres
backend, authentication, role-based scoping, the full Form Management /
Masters catalogue, dashboard analytics, and the government report export
(the 93-page all-zone report and the 50-page single-KVK report).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui (base-ui primitives)
- PostgreSQL (Neon serverless) via Prisma 7 + `@prisma/adapter-neon`
- Session auth: `jose` HS256 JWT cookie, `bcryptjs` password hashing
- Vercel Blob for form-photo / document uploads
- Deployed on Vercel

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in DATABASE_URL, AUTH_SECRET, ...
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`.env.local` is git-ignored - never commit real secrets. Values come from the
Neon resource connected via the Vercel Marketplace integration
(`vercel env pull .env.local`).

## Project structure

```text
app/
  (auth)/login/                # sign-in
  (dashboard)/                 # sidebar + topbar shell and every panel route
  api/                         # route handlers (auth, leaf-record CRUD, reports, ...)
components/
  ui/                          # shadcn primitives
  layout/                      # sidebar, topbar, page header
  dashboard/                   # stat cards, progress / analytics charts
  data-table/                  # the reusable Form Management list + Add/Edit shell
  reports/                     # report filter views + the on-screen report document
lib/
  navigation.ts                # single source of truth for the sidebar / masters / forms tree
  report-data.ts               # builds the report section tree from the DB (both report variants)
  report-pdf.ts                # jsPDF renderer for the downloadable report
  leaf-record-registry.ts      # per-leaf create / update / delete handlers for Form Management
  auth.ts / api-auth.ts        # session issue + verify, route guards
prisma/
  schema.prisma                # full data model
  migrations/                  # ordered SQL migrations (apply with `prisma migrate deploy`)
scripts/                       # one-off data import / backfill utilities (read .env.local)
```

`lib/navigation.ts` drives the sidebar and the dynamic `/masters/[...slug]`
and `/forms/[...slug]` routes, so a new master / form page is a config entry,
not a hand-built screen.

## Reports

`/reports` builds a section tree scoped to the caller (a KVK admin is locked
to their own KVK; a Super Admin sees the whole zone, or one KVK via the
filter) with an optional reporting-period / year / form filter, then renders
it as an on-screen document, a PDF, Word or Excel export. The tree, column
sets and captions are matched section-for-section to the client's two real
exports (50-page single-KVK and 93-page all-zone).
