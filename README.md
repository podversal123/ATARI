# ATARI AMS - Super Admin Panel

Pixel-accurate rebuild of the ICAR-ATARI Agriculture Management System's Super Admin panel (Zone IV, Patna) on Next.js.

## Status

Phase 1: static UI only, built against a reference recording and the live login page - no backend wired up yet. All figures shown in the app are genuinely zero, not sample data; real numbers arrive once the database step lands.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui (base-ui primitives)
- PostgreSQL with Row Level Security, multi-zone from day one (planned - see Phase 3 below)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```text
app/
  (auth)/login/page.tsx        # login screen
  (dashboard)/                 # sidebar + topbar shell and every dashboard route
components/
  ui/                          # shadcn primitives
  layout/                      # sidebar, topbar, page header
  dashboard/                   # dashboard-only widgets (stat cards, progress charts)
  data-table/                  # reusable list-page table shell
lib/
  navigation.ts                # single source of truth for the sidebar tree
```

`lib/navigation.ts` drives the sidebar and the dynamic `/masters/[...slug]` and `/forms/[...slug]` routes, so new master/form pages are a config addition rather than hand-built screens.

## Roadmap

1. **UI** (current) - login, dashboard shell, full navigation tree, static/zero data.
2. **Database & auth** - Postgres schema (zones, profiles, masters, forms), Row Level Security policies, real sign-in.
3. **Master/form buildout** - roll the reusable data-table pattern across the remaining masters and forms.
4. **Multi-zone rollout & deployment** - onboard a second zone, deploy to AWS.
