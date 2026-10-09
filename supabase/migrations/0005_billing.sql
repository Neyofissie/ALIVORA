-- Alivora V1.0 — billing (PRD §9.5). Payment credentials are never stored here.
create table public.plans (
  id text primary key, -- 'free' | 'plus' | 'ai'
  name text not null,
  stripe_price_id text,
  is_active boolean not null default true
);

create table public.entitlements (
  plan_id text not null references public.plans (id) on delete cascade,
  key text not null, -- e.g. adult_limit, active_task_limit, ai_requests_per_month
  value jsonb not null,
  primary key (plan_id, key)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null unique references public.households (id) on delete cascade,
  plan_id text not null references public.plans (id),
  status text not null default 'free'
    check (status in ('free', 'checkout_pending', 'active', 'cancel_at_period_end', 'past_due', 'expired')),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create table public.usage_periods (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  ai_requests_used int not null default 0,
  unique (household_id, period_start)
);

-- Idempotent webhook processing: each Stripe event is processed once.
create table public.stripe_webhook_events (
  id text primary key, -- Stripe event id
  type text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

insert into public.plans (id, name) values ('free', 'Alivora Free'), ('plus', 'Family Plus'), ('ai', 'Family AI');
insert into public.entitlements (plan_id, key, value) values
  ('free', 'adult_limit', '2'), ('free', 'active_task_limit', '30'), ('free', 'upcoming_event_limit', '30'), ('free', 'ai_requests_per_month', '0'),
  ('plus', 'adult_limit', '6'), ('plus', 'ai_requests_per_month', '10'),
  ('ai', 'adult_limit', '6'), ('ai', 'ai_requests_per_month', '100');
