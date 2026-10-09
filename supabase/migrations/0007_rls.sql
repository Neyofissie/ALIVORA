-- Alivora V1.0 — Row Level Security (PRD §9.7).
-- Tenant isolation: every household-owned row requires an active membership
-- in that row's household. Privileged operations (ownership transfer, member
-- removal, billing) run through server-side services using the service role.

create or replace function public.is_household_member(p_household uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from household_members
    where household_id = p_household and user_id = auth.uid() and status = 'active'
  );
$$;

create or replace function public.household_role_of(p_household uuid)
returns household_role language sql stable security definer set search_path = public as $$
  select role from household_members
  where household_id = p_household and user_id = auth.uid() and status = 'active';
$$;

-- profiles: users manage their own profile and can see co-members.
alter table public.profiles enable row level security;
create policy profiles_self on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_comembers on public.profiles for select using (
  exists (
    select 1 from household_members me join household_members them on them.household_id = me.household_id
    where me.user_id = auth.uid() and me.status = 'active' and them.user_id = profiles.id and them.status = 'active'
  )
);

-- households: members read; owner/admin update. Creation goes through create_household().
alter table public.households enable row level security;
create policy households_read on public.households for select using (is_household_member(id));
create policy households_update on public.households for update
  using (household_role_of(id) in ('owner', 'admin')) with check (household_role_of(id) in ('owner', 'admin'));

-- memberships: readable by members; never writable by application roles
-- (users cannot modify their own permissions).
alter table public.household_members enable row level security;
create policy household_members_read on public.household_members for select using (is_household_member(household_id));

-- invites: owner/admin manage; acceptance is server-side.
alter table public.household_invites enable row level security;
create policy household_invites_manage on public.household_invites for all
  using (household_role_of(household_id) in ('owner', 'admin'))
  with check (household_role_of(household_id) in ('owner', 'admin'));

-- Standard member CRUD for household-owned planning data.
do $$
declare t text;
begin
  foreach t in array array[
    'dependent_profiles', 'events', 'event_recurrence_rules', 'event_participants',
    'event_occurrence_exceptions', 'event_reminders', 'tasks', 'task_recurrence_rules',
    'task_occurrences', 'task_completion_history', 'household_cuisine_preferences'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for all using (is_household_member(household_id)) with check (is_household_member(household_id))',
      t || '_member_access', t
    );
  end loop;
end $$;

-- Read-only to members; written by server-side services only.
do $$
declare t text;
begin
  foreach t in array array[
    'ai_requests', 'ai_action_proposals', 'ai_usage_ledger', 'briefings',
    'briefing_deliveries', 'subscriptions', 'usage_periods'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select using (is_household_member(household_id))', t || '_member_read', t);
  end loop;
end $$;

-- Reference data: readable by any signed-in user.
alter table public.plans enable row level security;
create policy plans_read on public.plans for select to authenticated using (true);
alter table public.entitlements enable row level security;
create policy entitlements_read on public.entitlements for select to authenticated using (true);
alter table public.cuisines enable row level security;
create policy cuisines_read on public.cuisines for select to authenticated using (true);

-- Webhook log: service role only.
alter table public.stripe_webhook_events enable row level security;
