# Alivora V1.0 — open decisions and defaults

PRD §19 lists product decisions to finalise before launch. The foundation build uses the
PRD's recommended defaults, kept in configuration (`src/lib/plans.ts`,
`supabase/migrations/0005_billing.sql`) rather than hardcoded in business logic.

| Decision | Default used in this build | Where |
| --- | --- | --- |
| Free-plan limits | 2 adults, 30 active tasks, 30 upcoming events | `PLANS.free`, `entitlements` |
| AI request quotas | Family Plus 10/month, Family AI 100/month | `PLANS`, `entitlements` |
| Tomorrow Ready delivery | 19:00 household-local time, configurable | `households.briefing_local_time` |
| Supported languages | English (en-GB) at launch | `profiles.locale` |
| Initial billing | Monthly GBP subscriptions | Prices still TBC — UI shows "Price TBC" |

Other notes:

- **Tomorrow Ready on every plan.** All plans get the deterministic briefing
  (`src/lib/briefing.ts`). AI-enhanced wording and suggestions are a Family AI feature.
- **AI on the free plan.** The free plan's AI quota is 0 in config. The demo doesn't enforce
  it yet. Enforcement belongs in the AI orchestration service (Sprint 5).
- **Brand clearance.** Trademark and domain clearance for "Alivora" are still outstanding.
