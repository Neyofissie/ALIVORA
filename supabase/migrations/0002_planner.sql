-- Alivora V1.0 — planner (PRD §9.2)
create type recurrence_frequency as enum ('daily', 'weekly', 'monthly');

create table public.event_recurrence_rules (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  frequency recurrence_frequency not null,
  interval_count int not null default 1 check (interval_count > 0),
  until_local_date date,
  occurrence_count int check (occurrence_count > 0),
  check (until_local_date is null or occurrence_count is null)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title varchar(150) not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null,
  all_day boolean not null default false,
  location text,
  recurrence_rule_id uuid references public.event_recurrence_rules (id) on delete set null,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_end_after_start check (ends_at >= starts_at)
);
create index events_household_starts_idx on public.events (household_id, starts_at);

create table public.event_participants (
  event_id uuid not null references public.events (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  member_user_id uuid references public.profiles (id) on delete cascade,
  dependent_id uuid references public.dependent_profiles (id) on delete cascade,
  check ((member_user_id is null) <> (dependent_id is null))
);
create unique index event_participants_member_unique on public.event_participants (event_id, member_user_id) where member_user_id is not null;
create unique index event_participants_dependent_unique on public.event_participants (event_id, dependent_id) where dependent_id is not null;

-- Edited or cancelled single occurrences of a recurring event.
create table public.event_occurrence_exceptions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  occurrence_local_date date not null,
  cancelled boolean not null default false,
  override_starts_at timestamptz,
  override_ends_at timestamptz,
  override_title varchar(150),
  unique (event_id, occurrence_local_date)
);

create table public.event_reminders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  minutes_before int check (minutes_before >= 0),
  remind_at timestamptz,
  check ((minutes_before is null) <> (remind_at is null))
);
