# alivora.

**Life, beautifully in sync.** Alivora is an AI-powered family planning PWA for UK households.
Families use it to share schedules and responsibilities and to get ready for tomorrow.

This repository is the **V1.0 foundation**. It includes:

- the design system,
- every primary screen as a clickable mobile-first UI running on typed mock data,
- the Supabase schema and Row Level Security as migrations.

The PRD's later sprints wire in live auth, data, Stripe, OpenAI and background jobs.

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js 15 (App Router), React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 with semantic design tokens (`src/app/globals.css`) |
| Fonts / icons | Playfair Display + Inter (`next/font`), Lucide icons at 1.75 stroke |
| Validation | zod (domain types, form rules, AI proposal schema) |
| Data (planned) | Supabase Auth, PostgreSQL and RLS. Migrations are in `supabase/migrations` |
| Tests | Vitest (unit), Playwright (e2e at a 390px viewport), SQL RLS tests |
| CI | GitHub Actions: lint, typecheck, unit, build, e2e, plus migrations and RLS on Postgres 16 |

## Getting started

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

The app opens on the welcome screen. **Get started** walks through registration, then email
verification, then household onboarding. **Sign in** goes straight to a seeded household
(Emma, James, Ava and Noah). Demo data is kept in `localStorage`. To start over, use
**Settings → Reset demo data**. The full component showcase is at `/design-system`.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm lint` / `pnpm typecheck` | ESLint / `tsc --noEmit` |
| `pnpm test` | Unit tests: timezone/DST, recurrence, Tomorrow Ready, validation, AI proposals, store |
| `pnpm build` | Production build |
| `pnpm test:e2e` | Playwright smoke tests (set `PW_CHROMIUM_PATH` to use a preinstalled Chromium) |

Run the database tests against any Postgres 16:

```bash
for f in supabase/tests/auth_stub.sql supabase/migrations/*.sql supabase/tests/rls_isolation.sql; do
  psql -v ON_ERROR_STOP=1 -d alivora_test -f "$f"
done
```

## Project layout

```
src/app/                 routes: welcome, (auth), onboarding, (app)/home|tomorrow|planner|tasks|ai|family|settings
src/components/ui/       buttons, fields, controls, avatars, feedback, sheets/dialogs
src/components/cards/    Tomorrow Ready, event, task, AI proposal, household, subscription
src/lib/domain/          zod domain types + AI proposal schema
src/lib/briefing.ts      deterministic Tomorrow Ready builder (works without AI)
src/lib/recurrence.ts    DST-safe recurring event expansion
src/lib/ai/interpret.ts  local stand-in for POST /api/v1/ai/interpret
src/lib/store.tsx        client store over mock data (mirrors the V1.0 API shape)
supabase/migrations/     PRD §9 schema + RLS
docs/v1-decisions.md     open product decisions and the defaults used
```

## Product rules already enforced in the UI

- Alivora AI only **proposes** actions. Nothing is written until the user confirms, the proposal
  can be edited first, and the payload is revalidated before saving.
- Tomorrow Ready is built from confirmed records and needs no AI. Preparation ideas are
  suggestions that the user adds explicitly.
- Tasks can only be assigned to adults. Children are dependent profiles that can't sign in.
- An event's end can't come before its start (zod rule plus a database check constraint).
- Destructive actions ask for confirmation. A recurring event can be deleted as one occurrence
  or as the whole series.
- Every main screen has loading, empty and error states. Layouts work down to 320px.

## Next milestones (PRD §17)

1. Supabase Auth, profiles and household creation (`create_household()` is already in the migrations)
2. Invitations, permissions and dependent profiles
3. Calendar, events and recurrence persistence
4. Tasks, routines and dashboard on live data
5. Alivora AI (OpenAI) with the confirmation workflow
6. Tomorrow Ready jobs and notifications
7. Stripe billing and entitlements
8. Security, accessibility, QA, PWA service worker and private beta
