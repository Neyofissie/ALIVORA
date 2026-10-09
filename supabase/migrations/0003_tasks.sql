-- Alivora V1.0 — tasks and routines (PRD §9.3)
create table public.task_recurrence_rules (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  frequency recurrence_frequency not null,
  interval_count int not null default 1 check (interval_count > 0),
  until_local_date date,
  occurrence_count int check (occurrence_count > 0)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  title varchar(150) not null,
  description text,
  assignee_id uuid references public.profiles (id) on delete set null,
  due_at timestamptz,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'archived')),
  recurrence_rule_id uuid references public.task_recurrence_rules (id) on delete set null,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_household_status_idx on public.tasks (household_id, status, due_at);
create index tasks_assignee_idx on public.tasks (assignee_id) where status = 'pending';

-- Recurring task occurrences keep separate completion states.
create table public.task_occurrences (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  occurrence_key date not null,
  due_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'completed', 'archived')),
  completed_at timestamptz,
  completed_by uuid references public.profiles (id),
  unique (task_id, occurrence_key)
);

create table public.task_completion_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  occurrence_id uuid references public.task_occurrences (id) on delete cascade,
  action text not null check (action in ('completed', 'reopened')),
  actor_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);
