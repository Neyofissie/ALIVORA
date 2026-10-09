-- Alivora V1.0 — AI and Tomorrow Ready (PRD §9.4)
create table public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  status text not null default 'received' check (status in ('received', 'processing', 'succeeded', 'failed', 'rejected')),
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.ai_action_proposals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  request_id uuid not null references public.ai_requests (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  intent text not null,
  payload jsonb not null, -- schema-validated proposal; IDs inside are resolved server-side
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected', 'expired')),
  expires_at timestamptz not null default now() + interval '30 minutes',
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  -- A confirmed proposal cannot be executed again.
  check (status <> 'confirmed' or confirmed_at is not null)
);

create table public.ai_usage_ledger (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  request_id uuid not null unique references public.ai_requests (id) on delete cascade,
  period_start date not null,
  units int not null default 1,
  created_at timestamptz not null default now()
);

create table public.briefings (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  briefing_local_date date not null,
  content jsonb not null,
  generated_by text not null check (generated_by in ('deterministic', 'ai')),
  created_at timestamptz not null default now(),
  unique (household_id, briefing_local_date)
);

create table public.briefing_deliveries (
  id uuid primary key default gen_random_uuid(),
  briefing_id uuid not null references public.briefings (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  channel text not null check (channel in ('in_app', 'email', 'push')),
  delivered_at timestamptz not null default now(),
  -- Retries must not send duplicate notifications.
  unique (briefing_id, user_id, channel)
);
